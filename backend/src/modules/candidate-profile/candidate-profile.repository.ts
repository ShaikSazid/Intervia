import { CandidateAnalysis } from "./candidate-profile.types.js";
import { prisma } from "../../lib/prisma.js";

export const findResumeById = async (resumeId: string) => {
    return prisma.resume.findUnique({
        where: {
            id: resumeId,
        },
    });
};

export const findCandidateProfileById = async (
    candidateProfileId: string
) => {
    return prisma.candidateProfile.findUnique({
        where: {
            id: candidateProfileId,
        },
    });
};

export const findCandidateProfileByResumeId = async (
    resumeId: string
) => {
    return prisma.candidateProfile.findUnique({
        where: {
            resumeId,
        },
    });
};

export const updateCandidateProfile = async (
    resumeId: string,
    candidateAnalysis: CandidateAnalysis,
    llmModel: string = "gpt-4o"
) => {
    return prisma.candidateProfile.upsert({
        where: {
            resumeId,
        },
        create: {
            resumeId,
            candidateAnalysis,
            llmModel,
            version: 1,
        },
        update: {
            candidateAnalysis,
            llmModel,
            version: {
                increment: 1,
            },
        },
    });
};