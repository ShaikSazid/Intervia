import { CandidateModel } from "../candidate/candidate-model.types.js";
import { ResumeClaim } from "./resume-claim.types.js";

export const selectInitialClaim = (candidateModel: CandidateModel): ResumeClaim => {
    const claim = candidateModel.claims[0];
    if(!claim) {
        throw new Error("ClaimSelector: No resume claims available");
    }
    return claim;
}