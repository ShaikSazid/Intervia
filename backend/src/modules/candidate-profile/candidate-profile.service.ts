import { analyzeResume } from "./candidate-understanding.agent.js";
import * as candidateProfileRepository from "./candidate-profile.repository.js";
import { GetProfileParams } from "./candidate-profile.types.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export const generateCandidateProfile = async (
    resumeId: string,
    extractedText: string
) => {
    console.log("\n============= Candidate Profile Pipeline Started =============\n");

    console.log("[Candidate] Step 1/3 - Analyzing resume...");

    const candidateAnalysis = await analyzeResume(extractedText);

    console.log("[Candidate] ✓ Resume analysis completed.");

    console.log("[Candidate] Step 2/3 - Saving candidate profile...");

    const profile = await candidateProfileRepository.updateCandidateProfile(
        resumeId,
        candidateAnalysis
    );

    console.log("[Candidate] ✓ Candidate profile saved.");

    console.log("[Candidate] Step 3/3 - Candidate profile is ready.");

    console.log("\n============= Candidate Profile Pipeline Finished =============\n");

    return profile;
};

export const getProfileResumeById = async ({
    resumeId,
    userId,
}: GetProfileParams) => {
    const resume = await candidateProfileRepository.findResumeById(resumeId);

    if (!resume) {
        throw new NotFoundError(
            `Resume with ID "${resumeId}" was not found.`
        );
    }

    if (resume.userId !== userId) {
        throw new ForbiddenError(
            "You do not have permission to view this candidate profile."
        );
    }

    const profile =
        await candidateProfileRepository.findCandidateProfileByResumeId(
            resumeId
        );

    if (!profile) {
        throw new NotFoundError(
            `Candidate profile for resumeId "${resumeId}" was not found.`
        );
    }

    return profile;
};