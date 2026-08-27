import { openai } from "../../lib/openai.js";

import { zodResponseFormat } from "openai/helpers/zod";

import { buildPlannerPrompt } from "./planner.builder.js";

import {
    INTERVIEW_PLANNER_PROMPT,
} from "./planner.prompt.js";

import {
    interviewPlanSchema,
} from "./planner.schema.js";

import {
    GenerateInterviewPlanDto,
    InterviewPlan,
} from "./planner.types.js";

import {
    ClaimRelationshipType,
} from "./claim-relationship.types.js";


const MODEL_NAME =
    "gemini-2.5-flash";


/*
|--------------------------------------------------------------------------
| Repair duplicate PRIMARY claims
|--------------------------------------------------------------------------
|
| The planner is an LLM, so occasionally it may produce:
|
| Stage 1
|   project_mycakepage -> PRIMARY
|
| Stage 2
|   project_mycakepage -> PRIMARY
|
| A claim can only be the main investigation target once.
|
| We preserve the first PRIMARY occurrence and downgrade later
| occurrences to SUPPORTING rather than rejecting the entire plan.
|
*/

const repairDuplicatePrimaryClaims = (
    interviewPlan: InterviewPlan
): InterviewPlan => {

    const primaryClaimIds =
        new Set<string>();


    const repairedStages =
        interviewPlan.stages.map(
            stage => {

                const repairedClaims =
                    stage.claims.map(
                        stageClaim => {

                            if (
                                stageClaim.role !==
                                "PRIMARY"
                            ) {
                                return stageClaim;
                            }


                            const alreadyPrimary =
                                primaryClaimIds.has(
                                    stageClaim.claimId
                                );


                            if (
                                alreadyPrimary
                            ) {

                                console.warn(
                                    "[InterviewPlannerAgent] Duplicate PRIMARY claim detected. Downgrading later occurrence to SUPPORTING:",
                                    {
                                        claimId:
                                            stageClaim.claimId,

                                        stageId:
                                            stage.id,
                                    }
                                );


                                return {
                                    ...stageClaim,

                                    role:
                                        "SUPPORTING" as const,
                                };
                            }


                            primaryClaimIds.add(
                                stageClaim.claimId
                            );


                            return stageClaim;
                        }
                    );


                return {
                    ...stage,

                    claims:
                        repairedClaims,
                };
            }
        );


    return {
        ...interviewPlan,

        stages:
            repairedStages,
    };
};


const validateStagePrimaryClaims = (
    interviewPlan: InterviewPlan
) => {

    for (
        const stage
        of interviewPlan.stages
    ) {

        const primaryClaims =
            stage.claims.filter(
                claim =>
                    claim.role ===
                    "PRIMARY"
            );


        if (
            primaryClaims.length > 1
        ) {

            throw new Error(
                `InterviewPlannerAgent: Stage "${stage.id}" contains more than one PRIMARY claim.`
            );
        }
    }
};


/*
|--------------------------------------------------------------------------
| Generate Interview Plan
|--------------------------------------------------------------------------
*/

export const generateInterviewPlan = async (
    input: GenerateInterviewPlanDto
): Promise<InterviewPlan> => {

    /*
     * =========================================================================
     * 1. Validate input
     * =========================================================================
     */

    if (
        !input.candidateProfile
    ) {

        throw new Error(
            "InterviewPlannerAgent: candidateProfile is required."
        );
    }


    if (
        !input.resumeClaims ||
        input.resumeClaims.length === 0
    ) {

        throw new Error(
            "InterviewPlannerAgent: resumeClaims are required."
        );
    }


    if (
        input.durationMinutes <= 0
    ) {

        throw new Error(
            "InterviewPlannerAgent: durationMinutes must be positive."
        );
    }


    /*
     * =========================================================================
     * 2. Build prompt
     * =========================================================================
     */

    const userPrompt =
        buildPlannerPrompt(
            input
        );


    try {

        /*
         * =========================================================================
         * 3. Generate structured plan
         * =========================================================================
         */

        const response =
            await openai.chat.completions.parse({

                model:
                    MODEL_NAME,

                temperature:
                    0.2,

                messages: [

                    {
                        role:
                            "system",

                        content:
                            INTERVIEW_PLANNER_PROMPT,
                    },

                    {
                        role:
                            "user",

                        content:
                            userPrompt,
                    },

                ],

                response_format:
                    zodResponseFormat(
                        interviewPlanSchema,
                        "interview-plan"
                    ),
            });


        const generatedPlan =
            response
                .choices[0]
                ?.message
                .parsed;


        if (
            !generatedPlan
        ) {

            throw new Error(
                "InterviewPlannerAgent: OpenAI failed to return a structured interview plan."
            );
        }


        /*
         * =========================================================================
         * 4. Repair duplicate PRIMARY claims
         * =========================================================================
         *
         * Do this BEFORE validation.
         *
         * This prevents a valid interview from failing just because
         * the LLM repeated a project claim as PRIMARY.
         */

        const interviewPlan =
            repairDuplicatePrimaryClaims(
                generatedPlan as InterviewPlan
            );


        /*
         * =========================================================================
         * 5. Validate claim IDs and claim roles
         * =========================================================================
         */

        const validClaimIds =
            new Set(
                input.resumeClaims.map(
                    claim =>
                        claim.id
                )
            );


        const primaryClaimIds =
            new Set<string>();


        for (
            const stage
            of interviewPlan.stages
        ) {

            if (
                !stage.claims ||
                stage.claims.length === 0
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Stage "${stage.id}" contains no claims.`
                );
            }


            for (
                const stageClaim
                of stage.claims
            ) {

                const claimId =
                    stageClaim.claimId;


                /*
                 * ---------------------------------------------------------------
                 * Validate claim ID
                 * ---------------------------------------------------------------
                 */

                if (
                    !validClaimIds.has(
                        claimId
                    )
                ) {

                    throw new Error(
                        `InterviewPlannerAgent: Invalid claimId "${claimId}" returned by planner.`
                    );
                }


                /*
                 * ---------------------------------------------------------------
                 * Validate PRIMARY uniqueness across stages
                 * ---------------------------------------------------------------
                 */

                if (
                    stageClaim.role ===
                    "PRIMARY"
                ) {

                    if (
                        primaryClaimIds.has(
                            claimId
                        )
                    ) {

                        throw new Error(
                            `InterviewPlannerAgent: Claim "${claimId}" is PRIMARY in more than one stage after repair.`
                        );
                    }


                    primaryClaimIds.add(
                        claimId
                    );
                }
            }
        }


        /*
         * =========================================================================
         * 6. Validate stage PRIMARY structure
         * =========================================================================
         */

        validateStagePrimaryClaims(
            interviewPlan
        );


        /*
         * =========================================================================
         * 7. Validate claim relationships
         * =========================================================================
         */

        const claimRelationships =
            interviewPlan.claimRelationships ??
            [];


        for (
            const relationship
            of claimRelationships
        ) {

            /*
             * ---------------------------------------------------------------
             * Validate fromClaimId
             * ---------------------------------------------------------------
             */

            if (
                !validClaimIds.has(
                    relationship.fromClaimId
                )
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Invalid relationship fromClaimId "${relationship.fromClaimId}".`
                );
            }


            /*
             * ---------------------------------------------------------------
             * Validate toClaimId
             * ---------------------------------------------------------------
             */

            if (
                !validClaimIds.has(
                    relationship.toClaimId
                )
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Invalid relationship toClaimId "${relationship.toClaimId}".`
                );
            }


            /*
             * ---------------------------------------------------------------
             * Prevent self relationships
             * ---------------------------------------------------------------
             */

            if (
                relationship.fromClaimId ===
                relationship.toClaimId
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Claim relationship cannot point from "${relationship.fromClaimId}" to itself.`
                );
            }
        }


        /*
         * =========================================================================
         * 8. Validate relationship enum values
         * =========================================================================
         *
         * This protects the TypeScript contract if the Zod schema and
         * ClaimRelationshipType enum ever drift apart.
         */

        for (
            const relationship
            of claimRelationships
        ) {

            if (
                !Object.values(
                    ClaimRelationshipType
                ).includes(
                    relationship.relation
                )
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Invalid claim relationship type "${relationship.relation}".`
                );
            }
        }


        /*
         * =========================================================================
         * 9. Validate question count
         * =========================================================================
         */

        const calculatedTotalQuestions =
            interviewPlan.stages.reduce(
                (
                    total,
                    stage
                ) =>
                    total +
                    stage.estimatedQuestions,

                0
            );


        if (
            calculatedTotalQuestions !==
            interviewPlan.totalQuestions
        ) {

            throw new Error(
                "InterviewPlannerAgent: totalQuestions does not match the sum of stage estimatedQuestions."
            );
        }


        /*
         * =========================================================================
         * 10. Validate duration
         * =========================================================================
         */

        if (
            interviewPlan.estimatedDurationMinutes <=
            0
        ) {

            throw new Error(
                "InterviewPlannerAgent: estimatedDurationMinutes must be positive."
            );
        }


        /*
         * =========================================================================
         * 11. Return validated and repaired plan
         * =========================================================================
         */

        return interviewPlan;


    } catch (
        error
    ) {

        if (
            error instanceof Error
        ) {

            throw new Error(
                `InterviewPlannerAgent Error: ${error.message}`
            );
        }


        throw new Error(
            "InterviewPlannerAgent: Unknown error."
        );
    }
};