import { CandidateAnalysis } from "../candidate-profile/candidate-profile.types.js";
import { ConversationMemory } from "./interview-memory.types.js";
import { InterviewReasoning } from "../interview-reasoning/reasoning.types.js";

import {
    InterviewConfiguration,
    SessionProgress,
} from "../interview-session/session.types.js";
import {
    InterviewPlan,
    InterviewStage,
} from "../interview-planner/planner.types.js";

export interface InterviewContext {

    candidateProfile: CandidateAnalysis;

    interviewConfiguration: InterviewConfiguration;

    interviewPlan: InterviewPlan;

    sessionProgress: SessionProgress;

    currentStage: InterviewStage;

    resumeContext: string;

    conversationHistory: ConversationMemory[];
}