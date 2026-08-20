import { ClaimProgress } from "../candidate/claim-progress.types.js";
import { InvestigationAttempt } from "../candidate/investigation-attempt.types.js";
import { ConversationState } from "../conversation/conversation-state.types.js";

export interface InterviewState {
    currentStage: string;
    currentClaimId: string | null;
    remainingClaimIds: string[];
    pendingFollowUpClaimIds: string[];
    completedClaimIds: string[];
    claimProgress: ClaimProgress[];
    investigationAttempts: InvestigationAttempt[];
    conversationState: ConversationState;
}