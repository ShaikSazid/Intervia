import { InterviewSessionStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { toPrismaJson } from "../../common/utils/prisma-json.js";
import { CreateInterviewSessionDto } from "./session.dto.js";

export const createInterviewSession = async (
    data: CreateInterviewSessionDto
) => {
    return prisma.interviewSession.create({
        data: {
            resumeId: data.resumeId,
            candidateProfileId: data.candidateProfileId,

            interviewConfiguration: toPrismaJson(
                data.interviewConfiguration
            ),

            interviewPlan: toPrismaJson(
                data.interviewPlan
            ),

            sessionProgress: toPrismaJson(
                data.sessionProgress
            ),

            status: InterviewSessionStatus.PENDING,
        },
    });
};

export const findInterviewSessionById = async (
    sessionId: string
) => {
    return prisma.interviewSession.findUnique({
        where: {
            id: sessionId,
        },
    });
};

export const updateInterviewSession = async (
    sessionId: string,
    data: Partial<CreateInterviewSessionDto> & {
        status?: InterviewSessionStatus;
        startedAt?: Date | null;
        completedAt?: Date | null;
    }
) => {
    return prisma.interviewSession.update({
        where: {
            id: sessionId,
        },
        data: {
            ...(data.interviewConfiguration && {
                interviewConfiguration: toPrismaJson(
                    data.interviewConfiguration
                ),
            }),

            ...(data.interviewPlan && {
                interviewPlan: toPrismaJson(
                    data.interviewPlan
                ),
            }),

            ...(data.sessionProgress && {
                sessionProgress: toPrismaJson(
                    data.sessionProgress
                ),
            }),

            ...(data.status && {
                status: data.status,
            }),

            ...(data.startedAt !== undefined && {
                startedAt: data.startedAt,
            }),

            ...(data.completedAt !== undefined && {
                completedAt: data.completedAt,
            }),
        },
    });
};

export const deleteInterviewSession = async (
    sessionId: string
) => {
    return prisma.interviewSession.delete({
        where: {
            id: sessionId,
        },
    });
};

export const findInterviewSessionWithCandidateProfile = async (
    sessionId: string
) => {
    return prisma.interviewSession.findUnique({
        where: {
            id: sessionId,
        },
        include: {
            candidateProfile: true,
        },
    });
};