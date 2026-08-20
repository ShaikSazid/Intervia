import { InterviewDecisionType } from "../brain/interview-decision.enums.js";
import { InterviewDecision } from "../brain/interview-decision.types.js";
import { ClaimAssessment } from "../claims/claim-assessment.types.js";
import { ResumeClaim } from "../claims/resume-claim.types.js";
import { InvestigationArea } from "../../interview-reasoning/reasoning.types.js";

export type ConversationDirective =
    | "CONTINUE"
    | "CLARIFY"
    | "DEEPEN"
    | "TRANSITION";

export interface InvestigationIntent {

    /*
     * What the Brain decided.
     */
    decision: InterviewDecisionType;

    /*
     * Claim that remains the investigation target.
     */
    claimId: string;

    /*
     * Specific thing we want to learn.
     */
    objective: string;

    /*
     * One investigation dimension.
     */
    investigationArea: InvestigationArea;

    /*
     * Evidence we want to obtain.
     */
    requiredEvidence: string[];

    /*
     * Areas that should not be repeated.
     */
    investigatedAreas: InvestigationArea[];

    /*
     * How the conversation should behave.
     */
    conversationDirective: ConversationDirective;

    /*
     * Current claim assessment.
     */
    assessment: ClaimAssessment;

    /*
     * The claim itself.
     */
    claim: ResumeClaim;
}