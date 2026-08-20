import { ConversationTurnStatus } from "../../generated/prisma/enums.js";

export interface ConversationTurn {
    id: string;
    interviewSessionId: string;
    sequenceNumber: number;
    question: string;
    answer?: string;
    evaluation?: unknown;
    status: ConversationTurnStatus;
    startedAt?: Date;
    answeredAt?: Date;
    evaluatedAt?: Date;
    createdAt: Date;
    updatedAt: Date; 
}