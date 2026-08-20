import { CandidateAnalysis } from "../../candidate-profile/candidate-profile.types.js";
import { ResumeClaim } from "./resume-claim.types.js";

export interface ExtractResumeClaimsInput {
    candidateAnalysis: CandidateAnalysis;
}

export interface ExtractResumeClaimsResult {
    claims: ResumeClaim[];
}