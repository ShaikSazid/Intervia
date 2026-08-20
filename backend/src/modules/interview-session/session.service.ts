import { InterviewSessionStatus } from "../../generated/prisma/enums.js";
import * as interviewSessionRepository from "./session.repository.js";

import { SessionProgress } from "./session.types.js";

export const updateSessionProgress = async (sessionId: string, progress: SessionProgress) => {
    return interviewSessionRepository.updateInterviewSession(sessionId, {
        sessionProgress: progress
    });
}

export const completeInterview = async (sessionId: string) => {
    return interviewSessionRepository.updateInterviewSession(sessionId, {
        status: InterviewSessionStatus.COMPLETED,
        completedAt: new Date()
    });
}