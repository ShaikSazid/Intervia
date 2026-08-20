import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { env } from "../../config/env.js";

import { buildAnswerEvaluationPrompt } from "./answer-evaluation.builder.js";
import { ANSWER_EVALUATION_PROMPT } from "./answer-evaluation.prompt.js";
import { answerEvaluationSchema } from "./answer-evaluation.schema.js";

import { EvaluateAnswerInput, AnswerEvaluation } from "./answer-evaluation.types.js";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY
});

const modelName = "gpt-4o";

export const generateAnswerEvaluation = async (input: EvaluateAnswerInput): Promise<AnswerEvaluation> => {
    const userPrompt = buildAnswerEvaluationPrompt(input);
    try {
        const response = await openai.chat.completions.parse({
            model: modelName,
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: ANSWER_EVALUATION_PROMPT
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            response_format: zodResponseFormat(answerEvaluationSchema, "answer_evaluation")
        });
        const evaluation = response.choices[0]?.message.parsed;
        if(!evaluation) {
            throw new Error("AnswerEvaluationAgent: OpenAI failed to evaluate the answer.");
        }
        return evaluation;
    } catch (error) {
        if(error instanceof Error) {
            throw new Error(`AnswerEvaluationAgent Error: ${error.message}`);
        }
        throw new Error("AnswerEvaluationAgent: Unknown error.")
    }
}