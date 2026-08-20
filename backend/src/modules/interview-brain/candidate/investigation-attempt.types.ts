import { InvestigationArea } from "../../interview-reasoning/reasoning.types.js";

export type InvestigationAttemptOutcome =
    | "ANSWERED"
    | "WEAK"
    | "NO_ANSWER"
    | "CONTRADICTORY";

export interface InvestigationAttempt {

    turnId: string;

    claimId: string;

    investigationArea: InvestigationArea;

    objective: string;

    question: string;

    outcome: InvestigationAttemptOutcome;
}