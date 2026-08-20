import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { env } from "../../config/env.js";

import { buildReasoningPrompt } from "./reasoning.builder.js";
import { INTERVIEW_REASONING_PROMPT } from "./reasoning.prompt.js";

import { interviewReasoningSchema } from "./reasoning.schema.js";

import {
    GenerateInterviewReasoningInput,
    InterviewReasoning,
} from "./reasoning.types.js";


const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});


const MODEL_NAME = "gpt-4o";


export const generateInterviewReasoning = async (
    input: GenerateInterviewReasoningInput
): Promise<InterviewReasoning> => {

    const userPrompt =
        buildReasoningPrompt(
            input.interviewContext,
            input.evaluation,
            input.decision,
            input.claim,
            input.assessment,
        );


    try {

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


        if (!reasoning) {

            throw new Error(
                "InterviewReasoningAgent: Failed to generate reasoning."
            );
        }


        return reasoning;


    } catch (error) {

        if (error instanceof Error) {

            throw new Error(
                `InterviewReasoningAgent Error: ${error.message}`
            );
        }


        throw new Error(
            "InterviewReasoningAgent: Unknown error."
        );
    }
};