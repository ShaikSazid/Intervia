import { openai } from "../../lib/openai.js";
import { zodResponseFormat } from "openai/helpers/zod";
import { buildReasoningPrompt } from "./reasoning.builder.js";
import { INTERVIEW_REASONING_PROMPT } from "./reasoning.prompt.js";
import { interviewReasoningSchema } from "./reasoning.schema.js";
import { GenerateInterviewReasoningInput, InterviewReasoning } from "./reasoning.types.js";

const MODEL_NAME = "gemini-2.5-flash";

const MAX_ATTEMPTS = 3;

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const sleep = async (milliseconds: number): Promise<void> => {
    await new Promise<void>(resolve => setTimeout(resolve, milliseconds));
};

const getStatusCode = (error: unknown): number | null => {
    if (typeof error === "object" && error !== null && "status" in error) {
        const status = (error as { status?: unknown }).status;
        if (typeof status === "number") {
            return status;
        }
    }
    return null;
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return "Unknown provider error.";
    }
};

export const generateInterviewReasoning = async (input: GenerateInterviewReasoningInput): Promise<InterviewReasoning> => {
    const userPrompt = buildReasoningPrompt(
        input.interviewContext,
        input.evaluation,
        input.decision,
        input.claim,
        input.assessment,
    );

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            console.log(
                "[InterviewReasoningAgent] Request:",
                {
                    model:
                        MODEL_NAME,

                    attempt,

                    maxAttempts:
                        MAX_ATTEMPTS,
                }
            );


            const response =
                await openai.chat.completions.parse({

                    model:
                        MODEL_NAME,

                    temperature:
                        0.2,

                    messages: [

                        {
                            role:
                                "system",

                            content:
                                INTERVIEW_REASONING_PROMPT,
                        },

                        {
                            role:
                                "user",

                            content:
                                userPrompt,
                        },

                    ],

                    response_format:
                        zodResponseFormat(
                            interviewReasoningSchema,
                            "interview-reasoning"
                        ),
                });


            const reasoning =
                response
                    .choices[0]
                    ?.message
                    .parsed;


            if (
                !reasoning
            ) {

                throw new Error(
                    "InterviewReasoningAgent: Failed to generate reasoning."
                );
            }


            console.log(
                "[InterviewReasoningAgent] Success:",
                {
                    model:
                        MODEL_NAME,

                    attempt,
                }
            );


            return reasoning;

        } catch (
        error
        ) {

            lastError =
                error;


            const statusCode =
                getStatusCode(
                    error
                );


            const message =
                getErrorMessage(
                    error
                );


            const isRetryable =
                statusCode !== null &&
                RETRYABLE_STATUS_CODES.has(
                    statusCode
                );


            console.error(
                "[InterviewReasoningAgent] Attempt failed:",
                {
                    model:
                        MODEL_NAME,

                    attempt,

                    maxAttempts:
                        MAX_ATTEMPTS,

                    statusCode,

                    retryable:
                        isRetryable,

                    message,
                }
            );


            /*
             * --------------------------------------------------------
             * Non-retryable error
             * --------------------------------------------------------
             */

            if (
                !isRetryable
            ) {

                throw new Error(
                    `InterviewReasoningAgent Error: ${message}`
                );
            }


            /*
             * --------------------------------------------------------
             * Last attempt failed
             * --------------------------------------------------------
             */

            if (
                attempt ===
                MAX_ATTEMPTS
            ) {

                break;
            }


            /*
             * --------------------------------------------------------
             * Exponential backoff
             * --------------------------------------------------------
             *
             * 1 second
             * 2 seconds
             */

            const delay =
                1000 *
                Math.pow(
                    2,
                    attempt - 1
                );


            console.warn(
                "[InterviewReasoningAgent] Retrying after temporary provider error:",
                {
                    statusCode,

                    delayMs:
                        delay,
                }
            );


            await sleep(
                delay
            );
        }
    }


    /*
     * ================================================================
     * All attempts failed
     * ================================================================
     */

    const finalMessage =
        getErrorMessage(
            lastError
        );


    const finalStatus =
        getStatusCode(
            lastError
        );


    throw new Error(
        finalStatus !== null

            ? `InterviewReasoningAgent Error: Gemini request failed after ${MAX_ATTEMPTS} attempts with status ${finalStatus}: ${finalMessage}`

            : `InterviewReasoningAgent Error: ${finalMessage}`
    );
};