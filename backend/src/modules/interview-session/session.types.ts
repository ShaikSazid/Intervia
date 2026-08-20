import { InterviewType } from "../interview/interview.enums.js";
import { InterviewPlan } from "../interview-planner/planner.types.js";
import {
    ConversationTurnStatus,
} from "./session.enums.js";

import { InterviewSessionStatus } from "../../generated/prisma/enums.js";

import { CandidateModel } from "../interview-brain/candidate/candidate-model.types.js";
import { InterviewState } from "../interview-brain/state/interview-state.types.js";

export interface ConversationTurns {
    id: string;
    question: string;
    answer?: string;
    status: ConversationTurnStatus;
    startedAt: Date;
    completedAt?: Date;
}

export interface SessionProgress {
    currentStageIndex: number;

    currentQuestionIndex: number;

    completedQuestions: number;

    totalQuestions: number;

    /*
     * Interview Brain state.
     *
     * This allows the Brain to continue
     * from the previous HTTP request.
     */
    interviewState: InterviewState;

    /*
     * Candidate claims and their
     * accumulated assessments/evidence.
     */
    candidateModel: CandidateModel;
}

export interface InterviewConfiguration {
    targetRole: string;

    interviewType: InterviewType;

    durationMinutes: number;

    language: string;
}

export interface InterviewSession {
    id: string;

    resumeId: string;

    candidateProfileId: string;

    configuration: InterviewConfiguration;

    interviewPlan: InterviewPlan;

    progress: SessionProgress;

    conversation: ConversationTurns[];

    status: InterviewSessionStatus;

    startedAt?: Date;

    completedAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}