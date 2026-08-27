import {
    GoogleGenAI,
} from "@google/genai";

import {
    env,
} from "../../config/env.js";


const ai =
    new GoogleGenAI({
        apiKey:
            env.GEMINI_API_KEY,
    });


const TRANSCRIPTION_MODEL =
    "gemini-3.6-flash";


const MAX_RETRIES =
    3;


const BASE_RETRY_DELAY_MS =
    1500;


/*
|--------------------------------------------------------------------------
| Retryable Gemini errors
|--------------------------------------------------------------------------
*/

const isRetryableError = (
    error: unknown
): boolean => {

    if (
        !error ||
        typeof error !== "object"
    ) {

        return false;
    }


    const candidate =
        error as {
            status?: number;
        };


    return (
        candidate.status === 429 ||
        candidate.status === 500 ||
        candidate.status === 502 ||
        candidate.status === 503 ||
        candidate.status === 504
    );
};


/*
|--------------------------------------------------------------------------
| Sleep
|--------------------------------------------------------------------------
*/

const sleep = (
    milliseconds: number
) => {

    return new Promise<void>(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
};


/*
|--------------------------------------------------------------------------
| Extract text from Gemini Interaction
|--------------------------------------------------------------------------
*/

const extractInteractionText = (
    interaction: unknown
): string => {

    if (
        !interaction ||
        typeof interaction !== "object"
    ) {

        return "";
    }


    const value =
        interaction as {
            output_text?: unknown;

            steps?: unknown;
        };


    /*
     * ------------------------------------------------------------
     * First try SDK convenience property
     * ------------------------------------------------------------
     */

    if (
        typeof value.output_text ===
        "string" &&
        value.output_text.trim()
    ) {

        return value.output_text.trim();
    }


    /*
     * ------------------------------------------------------------
     * Fallback: inspect interaction steps
     * ------------------------------------------------------------
     */

    if (
        !Array.isArray(
            value.steps
        )
    ) {

        return "";
    }


    const texts: string[] = [];


    for (
        const step of
        value.steps
    ) {

        if (
            !step ||
            typeof step !== "object"
        ) {

            continue;
        }


        const stepValue =
            step as {
                type?: unknown;

                content?: unknown;
            };


        /*
         * We're only interested in model output steps.
         */

        if (
            stepValue.type !==
            "model_output"
        ) {

            continue;
        }


        if (
            !Array.isArray(
                stepValue.content
            )
        ) {

            continue;
        }


        for (
            const content
            of stepValue.content
        ) {

            if (
                !content ||
                typeof content !== "object"
            ) {

                continue;
            }


            const contentValue =
                content as {
                    type?: unknown;

                    text?: unknown;
                };


            if (
                contentValue.type ===
                    "text" &&
                typeof contentValue.text ===
                    "string"
            ) {

                texts.push(
                    contentValue.text
                );
            }
        }
    }


    return texts
        .join("\n")
        .trim();
};


/*
|--------------------------------------------------------------------------
| Transcribe audio
|--------------------------------------------------------------------------
*/

export const transcribeAudio = async (
    audioBuffer: Buffer,
    mimeType: string,
): Promise<string> => {

    if (
        !audioBuffer ||
        audioBuffer.length === 0
    ) {

        throw new Error(
            "Audio file is empty."
        );
    }


    const base64Audio =
        audioBuffer.toString(
            "base64"
        );


    console.log(
        "[Voice] Transcribing audio:",
        {
            mimeType,

            size:
                audioBuffer.length,

            model:
                TRANSCRIPTION_MODEL,
        }
    );


    let lastError:
        unknown = null;


    for (
        let attempt = 1;
        attempt <= MAX_RETRIES;
        attempt++
    ) {

        try {

            console.log(
                `[Voice] Transcription attempt ${attempt}/${MAX_RETRIES}`
            );


            /*
             * Gemini Interactions API.
             *
             * This follows Google's documented audio input
             * structure: text instruction + inline audio data.
             */

            const interaction =
                await ai.interactions.create({

                    model:
                        TRANSCRIPTION_MODEL,

                    input: [

                        {
                            type:
                                "text",

                            text:
                                "Generate a verbatim transcript of the speech in this audio. Return only the transcript text. Do not summarize, explain, evaluate, or answer the candidate's question.",
                        },

                        {
                            type:
                                "audio",

                            data:
                                base64Audio,

                            mime_type:
                                mimeType ||
                                "audio/wav",
                        },

                    ],
                });


            /*
             * IMPORTANT DEBUGGING INFORMATION.
             *
             * We currently need to know whether Gemini returned
             * output_text, model_output steps, or something else.
             */

            console.log(
                "[Voice] Gemini interaction status:",
                (
                    interaction as {
                        status?: unknown;
                    }
                ).status
            );


            const transcript =
                extractInteractionText(
                    interaction
                );


            if (
                transcript
            ) {

                console.log(
                    "[Voice] Transcription completed:",
                    transcript
                );


                return transcript;
            }


            /*
             * Do not immediately throw away the response.
             * Log the useful structural information so we can
             * determine why Gemini returned no text.
             */

            const diagnostic =
                interaction as {
                    status?: unknown;

                    output_text?: unknown;

                    steps?: unknown;

                    errors?: unknown;
                };


            console.error(
                "[Voice] Gemini returned no transcript.",
                {
                    status:
                        diagnostic.status,

                    hasOutputText:
                        Boolean(
                            diagnostic.output_text
                        ),

                    outputTextType:
                        typeof diagnostic.output_text,

                    stepCount:
                        Array.isArray(
                            diagnostic.steps
                        )
                            ? diagnostic.steps.length
                            : 0,

                    errors:
                        diagnostic.errors,
                }
            );


            /*
             * Empty output is not a transient HTTP error.
             * Do not blindly retry three times.
             */

            throw new Error(
                "Speech transcription returned no text."
            );

        } catch (
            error
        ) {

            lastError =
                error;


            console.error(
                `[Voice] Transcription attempt ${attempt} failed:`,
                error
            );


            /*
             * Retry only temporary provider failures.
             */

            if (
                !isRetryableError(
                    error
                )
            ) {

                throw error;
            }


            if (
                attempt ===
                MAX_RETRIES
            ) {

                break;
            }


            const delay =
                BASE_RETRY_DELAY_MS *
                Math.pow(
                    2,
                    attempt - 1
                );


            console.log(
                `[Voice] Retrying transcription in ${delay}ms...`
            );


            await sleep(
                delay
            );
        }
    }


    /*
     * ------------------------------------------------------------
     * All retries failed
     * ------------------------------------------------------------
     */

    if (
        lastError &&
        typeof lastError ===
            "object"
    ) {

        const error =
            lastError as {
                status?: number;
            };


        if (
            error.status ===
            503
        ) {

            throw new Error(
                "Speech transcription service is temporarily busy. Please try again."
            );
        }


        if (
            error.status ===
            429
        ) {

            throw new Error(
                "Speech transcription service is temporarily rate limited. Please try again."
            );
        }
    }


    throw new Error(
        "Unable to transcribe your voice answer."
    );
};