import { InvestigationArea } from "../../interview-reasoning/reasoning.types.js";

export interface ClaimProgress {
    claimId: string;
    questionCount: number;
    weakAnswerCount: number;
    followUpCount: number;
    probeCount: number;
    investigatedAreas: InvestigationArea[];
}