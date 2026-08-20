import { ConversationTurn } from "../../generated/prisma/client.js";
import { fromPrismaJson } from "../../common/utils/prisma-json.js";

import { AnswerEvaluation } from "../answer-evaluation/answer-evaluation.types.js";
import { ConversationMemory } from "./interview-memory.types.js";

export const mapConversationMemory = (
    turns: ConversationTurn[]
): ConversationMemory[] => {
    return turns.map((turn) => {

        const evaluation = turn.evaluation
            ? fromPrismaJson<AnswerEvaluation>(turn.evaluation)
            : null;

        return {
            sequenceNumber: turn.sequenceNumber,
            question: turn.question,
            answer: turn.answer,
            score: evaluation?.score ?? null,
            feedback: evaluation?.feedback ?? null,
        };
    });
};