import { InterviewDecisionType } from "./interview-decision.enums.js";

export interface InterviewDecision {
    type: InterviewDecisionType,
    claimId: string | null;
    reason: string;
}