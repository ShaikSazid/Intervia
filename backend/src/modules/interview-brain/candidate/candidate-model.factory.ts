import { ClaimVerificationStatus } from "../claims/claim-assessment.enums.js";
import { ResumeClaim } from "../claims/resume-claim.types.js";
import { CandidateModel } from "./candidate-model.types.js";

export const createCandidateModel = (claims: ResumeClaim[]): CandidateModel => {
    return {
        claims,
        claimAssessments: claims.map((claim) => ({
            claimId: claim.id,
            verificationStatus: ClaimVerificationStatus.UNKNOWN,
            confidence: 0,
            evidenceTurnIds: [],
            evidence: [],
            needsFollowUp: false,
        })),
    };
}