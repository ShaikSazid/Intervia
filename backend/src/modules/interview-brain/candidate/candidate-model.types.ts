import { ClaimAssessment } from "../claims/claim-assessment.types.js";
import { ResumeClaim } from "../claims/resume-claim.types.js";

export interface CandidateModel {
    claimAssessments: ClaimAssessment[];
    claims: ResumeClaim[]
}