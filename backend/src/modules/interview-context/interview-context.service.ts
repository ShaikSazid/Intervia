import {
    InterviewConfiguration,
    SessionProgress,
} from "../interview-session/session.types.js";

import {
    InterviewPlan,
} from "../interview-planner/planner.types.js";

import { CandidateAnalysis } from "../candidate-profile/candidate-profile.types.js";

import { InterviewContext } from "./interview-context.types.js";
import { ConversationMemory } from "./interview-memory.types.js";

interface BuildInterviewContextParams {

    candidateProfile: CandidateAnalysis;

    interviewConfiguration: InterviewConfiguration;

    interviewPlan: InterviewPlan;

    sessionProgress: SessionProgress;

    resumeContext: string;

    conversationHistory: ConversationMemory[];
}

export const buildInterviewContext = (
    params: BuildInterviewContextParams
): InterviewContext => {

    const currentStage =
        params.interviewPlan.stages[
            params.sessionProgress.currentStageIndex
        ];

    return {

        candidateProfile: params.candidateProfile,

        interviewConfiguration: params.interviewConfiguration,

        interviewPlan: params.interviewPlan,

        sessionProgress: params.sessionProgress,

        currentStage,

        resumeContext: params.resumeContext,
        conversationHistory: params.conversationHistory,
    };
};