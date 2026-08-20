import { InterviewContext } from "../interview-context/interview-context.types.js";
import { InterviewReasoning } from "../interview-reasoning/reasoning.types.js";

import { ResumeClaim } from "../interview-brain/claims/resume-claim.types.js";
import { ClaimAssessment } from "../interview-brain/claims/claim-assessment.types.js";

import { InterviewDecision } from "../interview-brain/brain/interview-decision.types.js";
import { InterviewState } from "../interview-brain/state/interview-state.types.js";

import { InvestigationIntent } from "../interview-brain/intent/investigation-intent.types.js";


export interface InterviewQuestion {

    question: string;

    claimId: string;

    reasoning: string;

    expectedTopics: string[];
}


export interface GenerateQuestionInput {

    interviewContext: InterviewContext;

    reasoning: InterviewReasoning;

    claim: ResumeClaim;

    assessment: ClaimAssessment;

    decision: InterviewDecision;

    interviewState: InterviewState;

    investigationIntent: InvestigationIntent;
}