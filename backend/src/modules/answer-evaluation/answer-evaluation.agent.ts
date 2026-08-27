import { openai } from "../../lib/openai.js";
import { zodResponseFormat } from "openai/helpers/zod";

import { formatLLMError } from "../../common/utils/llm-error.js";

import { buildAnswerEvaluationPrompt } from "./answer-evaluation.builder.js";
import { ANSWER_EVALUATION_PROMPT } from "./answer-evaluation.prompt.js";
import { answerEvaluationSchema } from "./answer-evaluation.schema.js";

import {
    EvaluateAnswerInput,
    AnswerEvaluation,
} from "./answer-evaluation.types.js";

const MODEL_NAME = "gemini-2.5-flash";

export const generateAnswerEvaluation = async (
    input: EvaluateAnswerInput
): Promise<AnswerEvaluation> => {

    const userPrompt =
        buildAnswerEvaluationPrompt(input);

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
                            ANSWER_EVALUATION_PROMPT,
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
                        answerEvaluationSchema,
                        "answer_evaluation"
                    ),
            });


        const evaluation =
            response
                .choices[0]
                ?.message
                .parsed;


        if (!evaluation) {

            throw new Error(
                "AnswerEvaluationAgent: Gemini failed to return a structured evaluation."
            );
        }


        return evaluation;

    } catch (error) {

    throw formatLLMError(
        "AnswerEvaluationAgent",
        error
    );
}
};