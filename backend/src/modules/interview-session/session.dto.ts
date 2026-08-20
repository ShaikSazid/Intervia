import { InterviewPlan } from "../interview-planner/planner.types.js";
import {
    InterviewConfiguration,
    SessionProgress,
} from "./session.types.js";

export interface CreateInterviewSessionDto {
    resumeId: string;
    candidateProfileId: string;
    interviewConfiguration: InterviewConfiguration;
    interviewPlan: InterviewPlan;
    sessionProgress: SessionProgress;
}