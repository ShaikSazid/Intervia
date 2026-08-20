import { InterviewContext } from "../interview-context/interview-context.types.js";
import { AnswerEvaluation } from "../answer-evaluation/answer-evaluation.types.js";
import { InterviewDecision } from "../interview-brain/brain/interview-decision.types.js";
import { ResumeClaim } from "../interview-brain/claims/resume-claim.types.js";
import { ClaimAssessment } from "../interview-brain/claims/claim-assessment.types.js";


export type InvestigationArea =
    | "OWNERSHIP"
    | "IMPLEMENTATION"
    | "ARCHITECTURE"
    | "API"
    | "DATABASE"
    | "AUTHENTICATION"
    | "ERROR_HANDLING"
    | "DEBUGGING"
    | "DEPLOYMENT"
    | "SCALABILITY"
    | "TECHNICAL_DECISION"
    | "TRADE_OFF"
    | "CHALLENGE"
    | "PRACTICAL_USAGE"
    | "PROBLEM_SOLVING"
    | "GENERAL";


export interface InterviewReasoning {
    reasoning: string;
    objective: string;
    investigationArea: InvestigationArea;
    questionType:
        | "FOLLOW_UP"
        | "NEW_TOPIC"
        | "PROBE_CLAIM"
        | "PROJECT"
        | "SCENARIO"
        | "IMPLEMENTATION";
    stayOnCurrentTopic: boolean;
    increaseDifficulty: boolean;
    referenceResume: boolean;
    askImplementationQuestion: boolean;
}


export interface GenerateInterviewReasoningInput {
    interviewContext: InterviewContext;
    evaluation: AnswerEvaluation;
    decision: InterviewDecision;
    claim: ResumeClaim;
    assessment: ClaimAssessment;
}