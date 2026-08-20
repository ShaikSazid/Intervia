import { ConversationTurnStatus } from "../../generated/prisma/enums.js";
import { InvestigationIntent } from "../interview-brain/intent/investigation-intent.types.js";

export interface CreateConversationTurnDto {
    interviewSessionId: string;
    sequenceNumber: number;
    question: string;
    status: ConversationTurnStatus;
    startedAt: Date;
    investigationIntent: InvestigationIntent;
}