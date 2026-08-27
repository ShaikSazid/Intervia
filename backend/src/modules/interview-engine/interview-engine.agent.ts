import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { openai } from "../../lib/openai.js";

import { env } from "../../config/env.js";

import { buildInterviewPrompt } from "./interview-engine.builder.js";
import { INTERVIEW_ENGINE_PROMPT } from "./interview-engine.prompt.js";
import { interviewQuestionSchema } from "./interview-engine.schema.js";
import { GenerateQuestionInput, InterviewQuestion } from "./interview-engine.types.js";
import { InterviewContext } from "../interview-context/interview-context.types.js";


const MODEL_NAME = "gemini-2.5-flash";

export const generateInterviewQuestion = async (
    input: GenerateQuestionInput
): Promise<InterviewQuestion> => {
    const userPrompt = buildInterviewPrompt(input);

    try {
        const response = await openai.chat.completions.parse({
            model: MODEL_NAME,
            temperature: 0.2,

            messages: [
                {
                    role: "system",
                    content: INTERVIEW_ENGINE_PROMPT,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],

            response_format: zodResponseFormat(
                interviewQuestionSchema,
                "interview-question"
            ),
        });

        const question = response.choices[0]?.message.parsed;

        if (!question) {
            throw new Error(
                "InterviewEngineAgent: OpenAI failed to generate a question."
            );
        }
        if(question.claimId !== input.claim.id) {
            throw new Error(`InterviewEngineAgent: Generated question targets claim "${question.claimId}" but expected "${input.claim.id}".`)
        }

        return question;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(
                `InterviewEngineAgent Error: ${error.message}`
            );
        }

        throw new Error("InterviewEngineAgent: Unknown error.");
    }
};