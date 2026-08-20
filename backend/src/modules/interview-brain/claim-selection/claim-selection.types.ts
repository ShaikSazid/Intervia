import { ClaimAssessment } from "../claims/claim-assessment.types.js";
import { ResumeClaim } from "../claims/resume-claim.types.js";
import { InterviewStage } from "../../interview-planner/planner.types.js";
import { ClaimRelationship } from "../../interview-planner/claim-relationship.types.js";

export interface ClaimSelectionInput {
    claims: ResumeClaim[];

    claimAssessments: ClaimAssessment[];
    claimRelationships: ClaimRelationship[];

    currentClaimId: string | null;

    remainingClaimIds: string[];

    completedClaimIds: string[];

    pendingFollowUpClaimIds: string[];

    currentStage: InterviewStage;

    targetRole: string;
}

export interface ClaimSelectionResult {
    claim: ResumeClaim | null;

    reason: string;
}