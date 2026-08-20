import OpenAI from "openai";

import { zodResponseFormat } from "openai/helpers/zod";

import { env } from "../../config/env.js";

import { buildPlannerPrompt } from "./planner.builder.js";

import { INTERVIEW_PLANNER_PROMPT }
    from "./planner.prompt.js";

import { interviewPlanSchema }
    from "./planner.schema.js";

import {
    GenerateInterviewPlanDto,
    InterviewPlan,
} from "./planner.types.js";

import {
    ClaimRelationshipType,
} from "./claim-relationship.types.js";


const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});


const MODEL_NAME = "gpt-4o";


export const generateInterviewPlan = async (
    input: GenerateInterviewPlanDto
): Promise<InterviewPlan> => {

    /*
     * =========================================================================
     * 1. Validate input
     * =========================================================================
     */

    if (!input.candidateProfile) {

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
        buildPlannerPrompt(input);


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


        const interviewPlan =
            response
                .choices[0]
                ?.message
                .parsed;


        if (!interviewPlan) {

            throw new Error(
                "InterviewPlannerAgent: OpenAI failed to return a structured interview plan."
            );
        }


        /*
         * =========================================================================
         * 4. Validate claim IDs and claim roles
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


                if (
                    !validClaimIds.has(
                        claimId
                    )
                ) {

                    throw new Error(
                        `InterviewPlannerAgent: Invalid claimId "${claimId}" returned by planner.`
                    );
                }


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
                            `InterviewPlannerAgent: Claim "${claimId}" is PRIMARY in more than one stage.`
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
         * 5. Validate claim relationships
         * =========================================================================
         */

        const claimRelationships =
            interviewPlan.claimRelationships ?? [];


        for (
            const relationship
            of claimRelationships
        ) {

            if (
                !validClaimIds.has(
                    relationship.fromClaimId
                )
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Invalid relationship fromClaimId "${relationship.fromClaimId}".`
                );
            }


            if (
                !validClaimIds.has(
                    relationship.toClaimId
                )
            ) {

                throw new Error(
                    `InterviewPlannerAgent: Invalid relationship toClaimId "${relationship.toClaimId}".`
                );
            }


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
         * 6. Validate question count
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
         * 7. Validate duration
         * =========================================================================
         */

        if (
            interviewPlan.estimatedDurationMinutes <= 0
        ) {

            throw new Error(
                "InterviewPlannerAgent: estimatedDurationMinutes must be positive."
            );
        }


        /*
         * =========================================================================
         * 8. Defensive enum validation
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
         * 9. Return validated plan
         * =========================================================================
         */

        return interviewPlan as InterviewPlan;


    } catch (error) {

        if (error instanceof Error) {

            throw new Error(
                `InterviewPlannerAgent Error: ${error.message}`
            );
        }


        throw new Error(
            "InterviewPlannerAgent: Unknown error."
        );
    }
};