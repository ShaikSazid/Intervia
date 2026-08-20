import { EvaluateAnswerInput } from "./answer-evaluation.types.js";

export const buildAnswerEvaluationPrompt = (input: EvaluateAnswerInput): string => {
    return `
        Target Role:
        ${input.targetRole}

        Interview Topic:
        ${input.topic}

        Question Difficulty:
        ${input.difficulty}

        Interview Question:
        ${input.question}

        Candidate Answer:
        ${input.answer}

        Evaluate this answer according to the system instructions
    `;
};