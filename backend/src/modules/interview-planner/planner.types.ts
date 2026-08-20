import { CandidateAnalysis } from "../candidate-profile/candidate-profile.types.js";

import {
    InterviewDifficulty,
    InterviewType,
} from "../interview/interview.enums.js";

import { ResumeClaim } from "../interview-brain/claims/resume-claim.types.js";

import { ResumeClaimType } from "../interview-brain/claims/resume-claim.enums.js";

import {
    ClaimRelationship,
} from "./claim-relationship.types.js";


/*
 * ============================================================
 * Generate Interview Plan Input
 * ============================================================
 */

export interface GenerateInterviewPlanDto {

    candidateProfile:
        CandidateAnalysis;

    resumeClaims:
        ResumeClaim[];

    targetRole:
        string;

    durationMinutes:
        number;

    interviewType:
        InterviewType;

    language:
        string;
}


/*
 * ============================================================
 * Interview Stage
 * ============================================================
 *
 * primaryClaimType answers:
 *
 * "What kind of resume claim is this investigation primarily
 * anchored to?"
 *
 * investigationMode answers:
 *
 * "How should this investigation generally be conducted?"
 *
 * These are deliberately separate concepts.
 * ============================================================
 */

export type InvestigationMode =
    | "CLAIM_BASED"
    | "FUNDAMENTALS_CHECK"
    | "SCENARIO";


export type InterviewPriority =
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW";


export type InvestigationDimension =
    | "OWNERSHIP"
    | "ARCHITECTURE"
    | "IMPLEMENTATION"
    | "API_DESIGN"
    | "DATABASE"
    | "AUTHENTICATION"
    | "ERROR_HANDLING"
    | "DEBUGGING"
    | "PERFORMANCE"
    | "SCALABILITY"
    | "SECURITY"
    | "DEPLOYMENT"
    | "TRADE_OFFS"
    | "TECHNICAL_REASONING"
    | "FUNDAMENTALS"
    | "PRODUCTION_SCENARIO";


/*
 * ============================================================
 * Stage Claim Role
 * ============================================================
 *
 * PRIMARY:
 * The main thing being investigated.
 *
 * SUPPORTING:
 * May be naturally verified while investigating the primary
 * claim, but should not automatically receive its own stage.
 *
 * CONTEXTUAL:
 * Provides useful context but should not consume dedicated
 * interview time.
 * ============================================================
 */

export type InterviewStageClaimRole =
    | "PRIMARY"
    | "SUPPORTING"
    | "CONTEXTUAL";


export interface InterviewStageClaim {

    claimId:
        string;

    role:
        InterviewStageClaimRole;
}


/*
 * ============================================================
 * Interview Stage
 * ============================================================
 */

export interface InterviewStage {

    id:
        string;

    topic:
        string;

    /*
     * The dominant resume claim category being investigated.
     */
    primaryClaimType:
        ResumeClaimType;

    /*
     * How the investigation should generally be conducted.
     */
    investigationMode:
        InvestigationMode;

    priority:
        InterviewPriority;

    difficulty:
        InterviewDifficulty;

    objectives:
        string[];

    /*
     * What the interviewer is ultimately
     * trying to determine.
     */
    investigationGoal:
        string;

    /*
     * Specific dimensions through which
     * the claims should be investigated.
     */
    investigationDimensions:
        InvestigationDimension[];

    /*
     * Claims associated with this investigation.
     *
     * The role determines whether a claim is the
     * main target, supporting evidence, or context.
     */
    claims:
        InterviewStageClaim[];

    /*
     * Approximate question budget.
     *
     * This is NOT a fixed number of questions.
     */
    estimatedQuestions:
        number;

    /*
     * Allows the Interview Brain to dynamically
     * decide whether to continue investigating.
     */
    adaptive:
        boolean;
}


/*
 * ============================================================
 * Interview Plan
 * ============================================================
 */

export interface InterviewPlan {

    stages:
        InterviewStage[];

    /*
     * Relationships between resume claims discovered
     * during planning.
     *
     * These relationships describe planning structure.
     *
     * They are NOT interview evidence.
     */
    claimRelationships:
        ClaimRelationship[];

    totalQuestions:
        number;

    estimatedDurationMinutes:
        number;
}