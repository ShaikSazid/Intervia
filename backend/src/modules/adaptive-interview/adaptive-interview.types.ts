import { InterviewDifficulty } from "../interview/interview.enums.js";

export type AdaptiveAction = | "FOLLOW_UP" | "NEXT_QUESTION" | "NEXT_STAGE" | "FINISH_INTERVIEW";

export interface AdaptiveInterviewInput {
    score: number;
    followUpRequired: boolean;
    currentStageIndex: number;
    currentQuestionIndex: number;
    totalStages: number;
    questionsInCurrentStage: number;
}

export interface AdaptiveInterviewDecision {
    action: AdaptiveAction;
    nextStageIndex: number;
    nextQuestionIndex: number;
    difficulty: InterviewDifficulty;
}