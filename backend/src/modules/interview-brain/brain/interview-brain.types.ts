import { CandidateModel } from "../candidate/candidate-model.types.js";
import { InterviewState } from "../state/interview-state.types.js";
import { AnswerEvaluation } from "../../answer-evaluation/answer-evaluation.types.js";
import { InterviewStage } from "../../interview-planner/planner.types.js";
import { ClaimRelationship } from "../../interview-planner/claim-relationship.types.js";

export interface InterviewBrainContext {

    candidateModel: CandidateModel;

    interviewState: InterviewState;

    latestEvaluation: AnswerEvaluation;

    currentStage: InterviewStage;

    targetRole: string;
    claimRelationships: ClaimRelationship[];
}