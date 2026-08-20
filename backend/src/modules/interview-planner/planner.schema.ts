import { z } from "zod";

import {
    InterviewDifficulty,
} from "../interview/interview.enums.js";

import {
    ClaimRelationshipType,
} from "./claim-relationship.types.js";

import {
    ResumeClaimType,
} from "../interview-brain/claims/resume-claim.enums.js";


/*
 * ============================================================
 * Investigation Dimension
 * ============================================================
 */

export const investigationDimensionSchema =
    z.enum([
        "OWNERSHIP",
        "ARCHITECTURE",
        "IMPLEMENTATION",
        "API_DESIGN",
        "DATABASE",
        "AUTHENTICATION",
        "ERROR_HANDLING",
        "DEBUGGING",
        "PERFORMANCE",
        "SCALABILITY",
        "SECURITY",
        "DEPLOYMENT",
        "TRADE_OFFS",
        "TECHNICAL_REASONING",
        "FUNDAMENTALS",
        "PRODUCTION_SCENARIO",
    ]);


/*
 * ============================================================
 * Investigation Mode
 * ============================================================
 */

export const investigationModeSchema =
    z.enum([
        "CLAIM_BASED",
        "FUNDAMENTALS_CHECK",
        "SCENARIO",
    ]);


/*
 * ============================================================
 * Interview Priority
 * ============================================================
 */

export const interviewPrioritySchema =
    z.enum([
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW",
    ]);


/*
 * ============================================================
 * Stage Claim Role
 * ============================================================
 */

export const interviewStageClaimRoleSchema =
    z.enum([
        "PRIMARY",
        "SUPPORTING",
        "CONTEXTUAL",
    ]);


/*
 * ============================================================
 * Stage Claim
 * ============================================================
 */

export const interviewStageClaimSchema =
    z.object({

        claimId:
            z.string().min(1),

        role:
            interviewStageClaimRoleSchema,
    });


/*
 * ============================================================
 * Claim Relationship
 * ============================================================
 */

export const claimRelationshipTypeSchema =
    z.nativeEnum(
        ClaimRelationshipType
    );


export const claimRelationshipSchema =
    z.object({

        fromClaimId:
            z.string().min(1),

        toClaimId:
            z.string().min(1),

        relation:
            claimRelationshipTypeSchema,
    });


/*
 * ============================================================
 * Interview Stage
 * ============================================================
 */

export const interviewStageSchema =
    z.object({

        id:
            z.string().min(1),

        topic:
            z.string().min(1),

        /*
         * The resume claim category primarily being
         * investigated.
         */
        primaryClaimType:
            z.enum(ResumeClaimType),

        /*
         * The general investigation approach.
         */
        investigationMode:
            investigationModeSchema,

        priority:
            interviewPrioritySchema,

        difficulty:
            z.enum(InterviewDifficulty),

        objectives:
            z.array(
                z.string().min(1)
            ).min(1),

        investigationGoal:
            z.string().min(1),

        investigationDimensions:
            z.array(
                investigationDimensionSchema
            ).min(1),

        claims:
            z.array(
                interviewStageClaimSchema
            ).min(1),

        estimatedQuestions:
            z.number()
                .int()
                .positive(),

        adaptive:
            z.boolean(),
    });


/*
 * ============================================================
 * Interview Plan
 * ============================================================
 */

export const interviewPlanSchema =
    z.object({

        stages:
            z.array(
                interviewStageSchema
            ).min(1),

        claimRelationships:
            z.array(
                claimRelationshipSchema
            ),

        totalQuestions:
            z.number()
                .int()
                .positive(),

        estimatedDurationMinutes:
            z.number()
                .int()
                .positive(),
    });