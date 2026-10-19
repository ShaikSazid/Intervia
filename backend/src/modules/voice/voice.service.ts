
import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
});

const TRANSCRIPTION_MODEL = "gemini-3.8-flash";
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1500;

const getErrorStatus = (
    error: unknown
): number | undefined => {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const candidate = error as {
        status?: number;
        statusCode?: number;
        httpMeta?: {
            response?: {
                status?: number;
            };
        };
        response?: {
            status?: number;
        };
    };

    return (
        candidate.status ??
        candidate.statusCode ??
        candidate.httpMeta?.response?.status ??
        candidate.response?.status
    );
};

const isRetryableError = (
    error: unknown
): boolean => {
    const status = getErrorStatus(error);

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
    );
};

const getRetryDelayMs = (
    error: unknown,
    fallbackMs: number
): number => {
    if (!error || typeof error !== "object") {
        return fallbackMs;
    }

    const candidate = error as {
        headers?: Headers | Record<string, unknown>;
        httpMeta?: {
            response?: {
                headers?: Headers | Record<string, unknown>;
            };
        };
        response?: {
            headers?: Headers | Record<string, unknown>;
        };
    };

    const headers =
        candidate.headers ??
        candidate.httpMeta?.response?.headers ??
        candidate.response?.headers;

    if (!headers) {
        return fallbackMs;
    }

    let retryAfter: string | null | undefined;

    if (
        typeof (headers as Headers).get === "function"
    ) {
        retryAfter = (headers as Headers).get("retry-after");
    } else {
        const record = headers as Record<string, unknown>;
        const value =
            record["retry-after"] ??
            record["Retry-After"];

        if (
            typeof value === "string" ||
            typeof value === "number"
        ) {
            retryAfter = String(value);
        }
    }

    if (!retryAfter) {
        return fallbackMs;
    }

    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
        return seconds * 1000;
    }

    const retryAt = Date.parse(retryAfter);

    if (!Number.isNaN(retryAt)) {
        return Math.max(0, retryAt - Date.now());
    }

    return fallbackMs;
};

const sleep = (
    milliseconds: number
): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
};

const extractInteractionText = (
    interaction: unknown
): string => {
    if (!interaction || typeof interaction !== "object") {
        return "";
    }

    const value = interaction as {
        output_text?: unknown;
        steps?: unknown;
    };

    if (
        typeof value.output_text === "string" &&
        value.output_text.trim()
    ) {
        return value.output_text.trim();
    }

    if (!Array.isArray(value.steps)) {
        return "";
    }

    const texts: string[] = [];

    for (const step of value.steps) {
        if (!step || typeof step !== "object") {
            continue;
        }

        const stepValue = step as {
            type?: unknown;
            content?: unknown;
        };

        if (
            stepValue.type !== "model_output" ||
            !Array.isArray(stepValue.content)
        ) {
            continue;
        }

        for (const content of stepValue.content) {
            if (!content || typeof content !== "object") {
                continue;
            }

            const contentValue = content as {
                type?: unknown;
                text?: unknown;
            };

            if (
                contentValue.type === "text" &&
                typeof contentValue.text === "string"
            ) {
                texts.push(contentValue.text);
            }
        }
    }

    return texts.join("\n").trim();
};

export const transcribeAudio = async (
    audioBuffer: Buffer,
    mimeType: string
): Promise<string> => {
    if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error("Audio file is empty.");
    }

    const base64Audio = audioBuffer.toString("base64");

    console.log("[Voice] Transcribing audio:", {
        mimeType,
        size: audioBuffer.length,
        model: TRANSCRIPTION_MODEL,
    });

    let lastError: unknown = null;

    for (
        let attempt = 1;
        attempt <= MAX_RETRIES;
        attempt++
    ) {
        try {
            console.log(
                `[Voice] Transcription attempt ${attempt}/${MAX_RETRIES}`
            );

            const interaction = await ai.interactions.create({
                model: TRANSCRIPTION_MODEL,
                input: [
                    {
                        type: "text",
                        text:
                            "Generate a verbatim transcript of the speech in this audio. Return only the transcript text. Do not summarize, explain, evaluate, or answer the candidate's question.",
                    },
                    {
                        type: "audio",
                        data: base64Audio,
                        mime_type: mimeType || "audio/wav",
                    },
                ],
            });

            const transcript =
                extractInteractionText(interaction);

            if (transcript) {
                console.log(
                    "[Voice] Transcription completed."
                );

                return transcript;
            }

            const diagnostic = interaction as {
                status?: unknown;
                output_text?: unknown;
                steps?: unknown;
                errors?: unknown;
            };

            console.error(
                "[Voice] Gemini returned no transcript.",
                {
                    status: diagnostic.status,
                    hasOutputText: Boolean(
                        diagnostic.output_text
                    ),
                    outputTextType:
                        typeof diagnostic.output_text,
                    stepCount: Array.isArray(
                        diagnostic.steps
                    )
                        ? diagnostic.steps.length
                        : 0,
                    errors: diagnostic.errors,
                }
            );

            throw new Error(
                "Speech transcription returned no text."
            );
        } catch (error) {
            lastError = error;

            const status = getErrorStatus(error);

            console.error(
                `[Voice] Transcription attempt ${attempt} failed.`,
                { status }
            );

            if (!isRetryableError(error)) {
                throw error;
            }

            if (attempt === MAX_RETRIES) {
                break;
            }

            const fallbackDelay =
                BASE_RETRY_DELAY_MS *
                Math.pow(2, attempt - 1);

            const delay = getRetryDelayMs(
                error,
                fallbackDelay
            );

            console.log(
                `[Voice] Retrying transcription in ${delay}ms.`
            );

            await sleep(delay);
        }
    }

    const status = getErrorStatus(lastError);

    if (status === 503) {
        throw new Error(
            "Speech transcription service is temporarily busy. Please try again."
        );
    }

    if (status === 429) {
        throw new Error(
            "Speech transcription service is rate limited. Please try again later."
        );
    }

    throw new Error(
        "Unable to transcribe your voice answer."
    );
};
