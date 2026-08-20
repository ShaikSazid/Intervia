import { AnswerEvaluation } from "../../answer-evaluation/answer-evaluation.types.js";

export interface ClaimEvidence {
    turnId: string;
    evaluation: AnswerEvaluation;
}