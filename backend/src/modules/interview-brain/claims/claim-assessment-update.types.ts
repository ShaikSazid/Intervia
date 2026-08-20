import { AnswerEvaluation } from "../../answer-evaluation/answer-evaluation.types.js";

export interface AssessClaimInput {
    claimId: string;
    evaluation: AnswerEvaluation;
    conversationTurnId: string;
}