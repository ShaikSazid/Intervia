import { InterviewType } from "./interview.enums.js";

export interface CreateInterviewDto {
    resumeId: string;
    targetRole: string;
    interviewType: InterviewType
    durationMinutes: number;
    language: string;
}