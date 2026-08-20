import { ConversationTurnStatus } from "../../generated/prisma/enums.js";
import * as conversationTurnRepository from "./conversation-turn.repository.js";
import { CreateConversationTurnDto } from "./conversation-turn.dto.js";
import { AnswerEvaluation } from "../answer-evaluation/answer-evaluation.types.js";

export const createConversationTurn = async (data: CreateConversationTurnDto) => {
    return conversationTurnRepository.createConversationTurn(data);
}

export const getConversationHistory = async (
    interviewSessionId: string
) => {
    return conversationTurnRepository.findConversationTurnsBySessionId(
        interviewSessionId
    );
}

export const getConversation = async (turnId: string) => {
    return conversationTurnRepository.findConversationTurnsBySessionId(turnId);
}

export const submitAnswer = async (turnId: string, answer: string) => {
    return conversationTurnRepository.updateConversationTurn(turnId, {
        answer, status: ConversationTurnStatus.ANSWERED, answeredAt: new Date()
    });
}

export const saveEvaluation = async (turnId: string, evaluation: AnswerEvaluation) => {
    return conversationTurnRepository.updateConversationTurn(turnId, {
        evaluation, status: ConversationTurnStatus.EVALUATED, evaluatedAt: new Date()
    });
}

export const getPendingConversationTurn = async (interviewSessionId: string) => {
    return conversationTurnRepository.findPendingConversationTurn(interviewSessionId);
}