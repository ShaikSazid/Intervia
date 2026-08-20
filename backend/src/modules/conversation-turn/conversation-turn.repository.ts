import { prisma } from "../../lib/prisma.js";
import { ConversationTurnStatus } from "../../generated/prisma/enums.js";
import { AnswerEvaluation } from "../answer-evaluation/answer-evaluation.types.js";

import { CreateConversationTurnDto } from "./conversation-turn.dto.js";
import { toPrismaJson } from "../../common/utils/prisma-json.js";

export const createConversationTurn = async (data: CreateConversationTurnDto) => {
    return prisma.conversationTurn.create({
        data: {
            interviewSessionId: data.interviewSessionId,
            sequenceNumber: data.sequenceNumber,
            question: data.question,
            status: data.status,
            startedAt: data.startedAt,
            investigationIntent: toPrismaJson(data.investigationIntent)
        }
    });
}

export const findConversationTurnById = async (turnId: string) => {
    return prisma.conversationTurn.findUnique({
        where: { id: turnId }
    });
}

export const findConversationTurnsBySessionId = async (interviewSessionId: string) => {
    return prisma.conversationTurn.findMany({
        where: { interviewSessionId }, orderBy: { sequenceNumber: "asc" }
    });
}

export const findLatestConversationTurn = async (interviewSessionId: string) => {
    return prisma.conversationTurn.findFirst({
        where: { interviewSessionId}, orderBy: { sequenceNumber: "desc"}
    });
}

export const updateConversationTurn = async (
    turnId: string,
    data: {
        answer?: string;
        evaluation?: AnswerEvaluation;
        status?: ConversationTurnStatus;
        answeredAt?: Date | null;
        evaluatedAt?: Date | null;
    }
) => {
    return prisma.conversationTurn.update({
        where: {
            id: turnId,
        },

        data: {
            ...(data.answer !== undefined && {
                answer: data.answer,
            }),

            ...(data.evaluation !== undefined && {
                evaluation: toPrismaJson(data.evaluation),
            }),

            ...(data.status && {
                status: data.status,
            }),

            ...(data.answeredAt !== undefined && {
                answeredAt: data.answeredAt,
            }),

            ...(data.evaluatedAt !== undefined && {
                evaluatedAt: data.evaluatedAt,
            }),
        },
    });
};

export const deleteConversationTurn = async (
    turnId: string
) => {
    return prisma.conversationTurn.delete({
        where: {
            id: turnId,
        },
    });
};

export const findPendingConversationTurn = async (interviewSessionId: string) => {
    return prisma.conversationTurn.findFirst({
        where: {
            interviewSessionId,
            status: ConversationTurnStatus.PENDING
        },
        orderBy: { sequenceNumber: "asc" }
    });
}