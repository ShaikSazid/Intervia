import { ClaimVerificationStatus } from "./claim-assessment.enums.js";
import { ClaimEvidence } from "./claim-evidence.types.js";

export interface ClaimAssessment {
    claimId: string;
    verificationStatus: ClaimVerificationStatus;
    confidence: number;
    evidenceTurnIds: string[];
    evidence: ClaimEvidence[];
    needsFollowUp: boolean;
}