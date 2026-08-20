import { InterviewSession } from "../interview-session/session.types.js";
import { InterviewType } from "./interview.enums.js";

export interface createInterviewDto {
    candidateprofileId: string;
    targetRole: string;
    durationMinutes: number;
    interviewType: InterviewType
    language: string;
}

export interface CreateInterviewResult {
    session: InterviewSession;
}