import {
    ClaimSelectionInput,
    ClaimSelectionResult,
} from "./claim-selection.types.js";

import {
    ResumeClaim,
} from "../claims/resume-claim.types.js";

import {
    ClaimVerificationStatus,
} from "../claims/claim-assessment.enums.js";

import {
    ClaimRelationshipType,
} from "../../interview-planner/claim-relationship.types.js";


/*
 * ============================================================================
 * Planner Priority
 * ============================================================================
 */

const PRIORITY_WEIGHT: Record<string, number> = {
    CRITICAL: 400,
    HIGH: 300,
    MEDIUM: 200,
    LOW: 100,
};


/*
 * ============================================================================
 * Claim Type Weight
 * ============================================================================
 *
 * These weights are secondary to:
 *
 * - planner priority
 * - verification status
 * - claim role
 * - evidence relationships
 */

const CLAIM_TYPE_WEIGHT: Record<string, number> = {

    PROJECT:
        40,

    WORK_EXPERIENCE:
        35,

    EXPERIENCE:
        35,

    OPEN_SOURCE:
        32,

    RESEARCH:
        30,

    PUBLICATION:
        28,

    LEADERSHIP:
        28,

    SKILL:
        20,

    EDUCATION:
        18,

    ACHIEVEMENT:
        15,

    CERTIFICATION:
        10,

    OTHER:
        5,
};


/*
 * ============================================================================
 * Stage Claim Role Weight
 * ============================================================================
 *
 * PRIMARY
 *     Main investigation target.
 *
 * SUPPORTING
 *     Evidence that supports the primary claim.
 *
 * CONTEXTUAL
 *     Background information.
 */

const CLAIM_ROLE_WEIGHT: Record<string, number> = {

    PRIMARY:
        50,

    SUPPORTING:
        20,

    CONTEXTUAL:
        0,
};


/*
 * ============================================================================
 * Relationship Weight
 * ============================================================================
 *
 * Relationships are NOT absolute rules.
 *
 * They influence selection.
 *
 * Example:
 *
 * skill_node
 *      |
 *      | DEMONSTRATED_THROUGH
 *      ↓
 * project_mycakepage
 *
 * The project should normally be investigated first.
 *
 * Node.js can still be investigated later if additional
 * verification is actually required.
 * ============================================================================
 */

const RELATIONSHIP_WEIGHT = {

    DEMONSTRATED_THROUGH:
        -35,

    SUPPORTED_BY:
        -15,

    RELATED_TO:
        0,

    DUPLICATES:
        -100,

    EXTENDS:
        10,

    CONTEXT_FOR:
        -10,
} satisfies Record<ClaimRelationshipType, number>;


/*
 * ============================================================================
 * selectNextClaim
 * ============================================================================
 */

export const selectNextClaim = (
    input: ClaimSelectionInput
): ClaimSelectionResult => {

    const {
        claims,
        claimAssessments,
        claimRelationships,
        currentClaimId,
        remainingClaimIds,
        completedClaimIds,
        pendingFollowUpClaimIds,
        currentStage,
        targetRole,
    } = input;


    /*
     * =========================================================================
     * 1. Follow-up claims
     * =========================================================================
     *
     * Follow-ups have the highest priority because the Brain has already
     * determined that additional evidence is required.
     */

    const pendingFollowUp =
        pendingFollowUpClaimIds

            .filter(
                (claimId) =>
                    claimId !== currentClaimId
            )

            .filter(
                (claimId) =>
                    !completedClaimIds.includes(
                        claimId
                    )
            )

            .map(
                (claimId) =>
                    claims.find(
                        (claim) =>
                            claim.id === claimId
                    )
            )

            .find(
                (
                    claim
                ): claim is ResumeClaim =>
                    Boolean(claim)
            );


    if (pendingFollowUp) {

        return {

            claim:
                pendingFollowUp,

            reason:
                "A previously investigated resume claim requires additional evidence.",
        };
    }


    /*
     * =========================================================================
     * 2. Restrict candidates to current planner stage
     * =========================================================================
     */

    const stageClaims =
        currentStage.claims;


    const stageClaimIds =
        new Set(
            stageClaims.map(
                (stageClaim) =>
                    stageClaim.claimId
            )
        );


    /*
     * =========================================================================
     * 3. Build eligible claims
     * =========================================================================
     */

    const eligibleClaims =
        remainingClaimIds

            .filter(
                (claimId) =>
                    claimId !== currentClaimId
            )

            .filter(
                (claimId) =>
                    !completedClaimIds.includes(
                        claimId
                    )
            )

            .filter(
                (claimId) =>
                    stageClaimIds.has(
                        claimId
                    )
            )

            .map(
                (claimId) =>
                    claims.find(
                        (claim) =>
                            claim.id === claimId
                    )
            )

            .filter(
                (
                    claim
                ): claim is ResumeClaim =>
                    Boolean(claim)
            );


    /*
     * =========================================================================
     * 4. No eligible claims
     * =========================================================================
     */

    if (
        eligibleClaims.length === 0
    ) {

        return {

            claim:
                null,

            reason:
                `No eligible resume claims remain in the "${currentStage.topic}" stage.`,
        };
    }


    /*
     * =========================================================================
     * 5. Rank claims
     * =========================================================================
     */

    const rankedClaims =
        eligibleClaims.map(
            (claim) => {

                const assessment =
                    claimAssessments.find(
                        (item) =>
                            item.claimId ===
                            claim.id
                    );


                const stageClaim =
                    stageClaims.find(
                        (item) =>
                            item.claimId ===
                            claim.id
                    );


                /*
                 * -------------------------------------------------------------
                 * Base planner priority
                 * -------------------------------------------------------------
                 */

                let score =
                    PRIORITY_WEIGHT[
                        currentStage.priority
                    ] ?? 100;


                /*
                 * -------------------------------------------------------------
                 * Claim type
                 * -------------------------------------------------------------
                 */

                score +=
                    CLAIM_TYPE_WEIGHT[
                        claim.type
                    ] ?? 0;


                /*
                 * -------------------------------------------------------------
                 * Claim role
                 * -------------------------------------------------------------
                 */

                const claimRole =
                    stageClaim?.role ??
                    "CONTEXTUAL";


                score +=
                    CLAIM_ROLE_WEIGHT[
                        claimRole
                    ] ?? 0;


                /*
                 * -------------------------------------------------------------
                 * Relationship analysis
                 * -------------------------------------------------------------
                 *
                 * Look at relationships originating from this claim.
                 *
                 * Example:
                 *
                 * skill_node
                 *      ↓
                 * DEMONSTRATED_THROUGH
                 *      ↓
                 * project_mycakepage
                 *
                 * This tells us that Node.js is already demonstrated
                 * through the project.
                 *
                 * Therefore the project should generally be preferred
                 * as the direct investigation target.
                 */

                const outgoingRelationships =
                    claimRelationships.filter(
                        (relationship) =>
                            relationship.fromClaimId ===
                            claim.id
                    );


                for (
                    const relationship
                    of outgoingRelationships
                ) {

                    const relationshipWeight =
                        RELATIONSHIP_WEIGHT[
                            relationship.relation
                        ] ?? 0;


                    /*
                     * Do not apply the duplicate penalty blindly.
                     *
                     * If the claim is already the PRIMARY claim,
                     * we don't want the relationship graph to destroy
                     * the planner's explicit decision.
                     */

                    if (
                        claimRole === "PRIMARY" &&
                        relationship.relation ===
                            ClaimRelationshipType.DUPLICATES
                    ) {

                        score +=
                            relationshipWeight;

                    } else {

                        score +=
                            relationshipWeight;
                    }
                }


                /*
                 * -------------------------------------------------------------
                 * Incoming DEMONSTRATED_THROUGH relationships
                 * -------------------------------------------------------------
                 *
                 * Example:
                 *
                 * skill_node
                 *      ↓ DEMONSTRATED_THROUGH
                 * project_mycakepage
                 *
                 * project_mycakepage is the evidence-bearing claim.
                 *
                 * Give it a bonus because it demonstrates another claim.
                 */

                const incomingDemonstratedRelationships =
                    claimRelationships.filter(
                        (relationship) =>
                            relationship.toClaimId ===
                                claim.id &&
                            relationship.relation ===
                                ClaimRelationshipType.DEMONSTRATED_THROUGH
                    );


                if (
                    incomingDemonstratedRelationships.length > 0
                ) {

                    score +=
                        30;
                }


                /*
                 * -------------------------------------------------------------
                 * Verification status
                 * -------------------------------------------------------------
                 */

                if (!assessment) {

                    score +=
                        30;

                } else {

                    switch (
                        assessment.verificationStatus
                    ) {

                        case ClaimVerificationStatus.UNKNOWN:

                            score +=
                                35;

                            break;


                        case ClaimVerificationStatus.QUESTIONABLE:

                            score +=
                                45;

                            break;


                        case ClaimVerificationStatus.PARTIALLY_VERIFIED:

                            score +=
                                25;

                            break;


                        case ClaimVerificationStatus.VERIFIED:

                            score -=
                                100;

                            break;


                        default:

                            break;
                    }
                }


                /*
                 * -------------------------------------------------------------
                 * Confidence
                 * -------------------------------------------------------------
                 */

                if (assessment) {

                    const confidence =
                        Math.max(
                            0,
                            Math.min(
                                1,
                                assessment.confidence
                            )
                        );


                    score +=
                        (
                            1 -
                            confidence
                        ) * 30;
                }


                /*
                 * -------------------------------------------------------------
                 * Explicit follow-up requirement
                 * -------------------------------------------------------------
                 */

                if (
                    assessment?.needsFollowUp
                ) {

                    score +=
                        50;
                }


                /*
                 * -------------------------------------------------------------
                 * Evidence count
                 * -------------------------------------------------------------
                 */

                const evidenceCount =
                    assessment
                        ?.evidenceTurnIds
                        .length ?? 0;


                if (
                    evidenceCount === 0
                ) {

                    score +=
                        20;

                } else if (
                    evidenceCount === 1
                ) {

                    score +=
                        10;
                }


                return {

                    claim,

                    score,
                };
            }
        );


    /*
     * =========================================================================
     * 6. Sort highest-value claim first
     * =========================================================================
     */

    rankedClaims.sort(
        (a, b) =>
            b.score -
            a.score
    );


    const selected =
        rankedClaims[0];


    /*
     * =========================================================================
     * 7. Return selected claim
     * =========================================================================
     */

    if (!selected) {

        return {

            claim:
                null,

            reason:
                "No suitable resume claim could be selected.",
        };
    }


    /*
     * =========================================================================
     * 8. Explain selection
     * =========================================================================
     */

    const assessment =
        claimAssessments.find(
            (item) =>
                item.claimId ===
                selected.claim.id
        );


    const stageClaim =
        stageClaims.find(
            (item) =>
                item.claimId ===
                selected.claim.id
        );


    const status =
        assessment?.verificationStatus ??
        ClaimVerificationStatus.UNKNOWN;


    const relationshipSummary =
        claimRelationships
            .filter(
                (relationship) =>
                    relationship.fromClaimId ===
                        selected.claim.id ||
                    relationship.toClaimId ===
                        selected.claim.id
            )
            .map(
                (relationship) =>
                    `${relationship.relation} (${relationship.fromClaimId} → ${relationship.toClaimId})`
            )
            .join(", ");


    return {

        claim:
            selected.claim,

        reason:
            `Selected "${selected.claim.title}" as the highest-value eligible claim for the "${currentStage.topic}" stage of the ${targetRole} interview. Claim role: ${stageClaim?.role ?? "CONTEXTUAL"}. Claim type: ${selected.claim.type}. Verification status: ${status}. Relationships: ${relationshipSummary || "none"}.`,
    };
};