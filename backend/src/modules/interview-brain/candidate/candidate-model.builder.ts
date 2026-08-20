import { ResumeClaim } from "../claims/resume-claim.types.js";
import { CandidateModel } from "./candidate-model.types.js";
import { createCandidateModel } from "./candidate-model.factory.js";

export const buildCandidateModel = (
    claims: ResumeClaim[]
): CandidateModel => {

    return createCandidateModel(
        claims
    );
};