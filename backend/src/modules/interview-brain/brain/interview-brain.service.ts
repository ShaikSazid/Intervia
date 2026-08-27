import { InterviewDecision } from "./interview-decision.types.js";

import {
    InterviewBrainContext,
} from "./interview-brain.types.js";

import {
    InterviewDecisionType,
} from "./interview-decision.enums.js";

import {
    selectNextClaim,
} from "../claim-selection/claim-selection.service.js";

import {
    ClaimVerificationStatus,
} from "../claims/claim-assessment.enums.js";

import {
    ClaimAssessment,
} from "../claims/claim-assessment.types.js";


const CONFIDENCE_TO_VERIFY = 0.75;

const CONFIDENCE_TO_PROBE = 0.70;

const WEAK_SCORE_THRESHOLD = 5;

const STRONG_SCORE_THRESHOLD = 8;

const MAX_WEAK_ANSWERS_BEFORE_MOVING_ON = 3;


/*
 * Maximum number of failed attempts in the same investigation
 * area before the Brain should prefer moving away from that area.
 */
const MAX_FAILED_ATTEMPTS_SAME_AREA = 2;


export const decideNextAction = (
    context: InterviewBrainContext
): InterviewDecision => {

    const {
        candidateModel,
        interviewState,
        latestEvaluation,
        currentStage,
        targetRole,
        claimRelationships,
    } = context;


    /*
     * ============================================================
     * 1. Check whether a current claim exists
     * ============================================================
     */

    const currentClaimId =
        interviewState.currentClaimId;


    /*
     * No current claim means the Brain must select one.
     */

    if (!currentClaimId) {

        const selection =
            selectNextClaim({

                claims:
                    candidateModel.claims,

                claimAssessments:
                    candidateModel.claimAssessments,

                currentClaimId:
                    null,

                remainingClaimIds:
                    interviewState.remainingClaimIds,

                completedClaimIds:
                    interviewState.completedClaimIds,

                pendingFollowUpClaimIds:
                    interviewState.pendingFollowUpClaimIds,

                currentStage,

                targetRole,

                claimRelationships,
            });


        /*
         * No claim remains in this stage.
         */

        if (!selection.claim) {

            return {

                type:
                    InterviewDecisionType.MOVE_TO_NEXT_STAGE,

                claimId:
                    null,

                reason:
                    selection.reason,
            };
        }


        return {

            type:
                InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

            claimId:
                selection.claim.id,

            reason:
                selection.reason,
        };
    }


    const currentClaim =
        candidateModel.claims.find(
            (claim) =>
                claim.id ===
                currentClaimId
        );


    if (!currentClaim) {

        throw new Error(
            `Interview Brain: current claim "${currentClaimId}" was not found in Candidate Model.`
        );
    }


    const assessment:
        ClaimAssessment | undefined =
        candidateModel.claimAssessments.find(
            (item) =>
                item.claimId ===
                currentClaimId
        );


    if (!assessment) {

        throw new Error(
            `Interview Brain: no assessment exists for claim "${currentClaimId}".`
        );
    }


    const claimProgress =
        interviewState.claimProgress.find(
            (progress) =>
                progress.claimId ===
                currentClaimId
        );


    const weakAnswerCount =
        claimProgress?.weakAnswerCount ?? 0;


    const conversationState =
        interviewState.conversationState;


    const conversationIsBlocked =
        conversationState.threadStatus ===
        "BLOCKED";


    const candidateIsFrustrated =
        conversationState.candidateFrustrated;


    const conversationMode =
        conversationState.mode;


    /*
     * ============================================================
     * 2. Investigation Attempts
     * ============================================================
     */

    const investigationAttempts =
        interviewState.investigationAttempts ?? [];


    const currentClaimAttempts =
        investigationAttempts.filter(
            (attempt) =>
                attempt.claimId ===
                currentClaimId
        );


    const latestInvestigationArea =
        currentClaimAttempts.at(-1)?.investigationArea;


    const failedAttemptsInLatestArea =
        latestInvestigationArea

            ? currentClaimAttempts.filter(
                (attempt) =>
                    attempt.investigationArea ===
                        latestInvestigationArea
                    &&
                    (
                        attempt.outcome ===
                            "NO_ANSWER"
                        ||
                        attempt.outcome ===
                            "WEAK"
                    )
            ).length

            : 0;


    const evidenceCount =
        assessment.evidenceTurnIds.length;


    /*
     * ============================================================
     * 3. Fundamental / Recovery Mode
     * ============================================================
     *
     * These are state-level fallbacks.
     *
     * Answer behavior below has priority when a specific
     * behavior is available.
     */

    if (
        conversationMode ===
        "FUNDAMENTALS_CHECK"
    ) {

        return {

            type:
                InterviewDecisionType.PROBE_CLAIM,

            claimId:
                currentClaimId,

            reason:
                `The candidate has struggled to provide resume-specific evidence for "${currentClaim.title}". The interviewer should assess foundational understanding instead of continuing the same resume investigation.`,
        };
    }


    /*
     * ============================================================
     * 4. Conversational Answer Behavior
     * ============================================================
     *
     * Only exceptional behaviors return immediately here.
     *
     * PARTIAL and STRONG continue into the normal evidence,
     * verification, and confidence logic below.
     */

    switch (
        latestEvaluation.answerBehavior
    ) {

        /*
         * --------------------------------------------------------
         * NO ANSWER
         * --------------------------------------------------------
         */

        case "NO_ANSWER": {

            if (
                weakAnswerCount >=
                MAX_WEAK_ANSWERS_BEFORE_MOVING_ON
            ) {

                const selection =
                    selectNextClaim({

                        claims:
                            candidateModel.claims,

                        claimAssessments:
                            candidateModel.claimAssessments,

                        currentClaimId:
                            currentClaimId,

                        remainingClaimIds:
                            interviewState.remainingClaimIds,

                        completedClaimIds:
                            interviewState.completedClaimIds,

                        pendingFollowUpClaimIds:
                            interviewState.pendingFollowUpClaimIds,

                        currentStage,

                        targetRole,

                        claimRelationships,
                    });


                if (selection.claim) {

                    return {

                        type:
                            InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

                        claimId:
                            selection.claim.id,

                        reason:
                            `The candidate has repeatedly been unable to provide evidence for "${currentClaim.title}". Move to another high-value claim rather than continuing the same investigation.`,
                    };
                }


                return {

                    type:
                        InterviewDecisionType.MOVE_TO_NEXT_STAGE,

                    claimId:
                        null,

                    reason:
                        `The candidate has repeatedly been unable to provide evidence for "${currentClaim.title}", and no other eligible claim remains in the current stage.`,
                };
            }


            return {

                type:
                    InterviewDecisionType.RECOVER_CONVERSATION,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate explicitly indicated that they do not know the answer for "${currentClaim.title}". Recover with a simpler, more concrete question about the same claim.`,
            };
        }


        /*
         * --------------------------------------------------------
         * DON'T REMEMBER
         * --------------------------------------------------------
         */

        case "DONT_REMEMBER": {

            return {

                type:
                    InterviewDecisionType.RECOVER_CONVERSATION,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate could not recall the specific implementation detail for "${currentClaim.title}". Use a nearby or simpler question that helps the candidate recall their practical experience without assuming they lack the underlying knowledge.`,
            };
        }


        /*
         * --------------------------------------------------------
         * OFF TOPIC
         * --------------------------------------------------------
         */

        case "OFF_TOPIC": {

            return {

                type:
                    InterviewDecisionType.CHANGE_ANGLE,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate's answer was not relevant to the current investigation of "${currentClaim.title}". Change the questioning angle while remaining grounded in the same claim.`,
            };
        }


        /*
         * --------------------------------------------------------
         * FRUSTRATED
         * --------------------------------------------------------
         */

        case "FRUSTRATED": {

            const selection =
                selectNextClaim({

                    claims:
                        candidateModel.claims,

                    claimAssessments:
                        candidateModel.claimAssessments,

                    currentClaimId:
                        currentClaimId,

                    remainingClaimIds:
                        interviewState.remainingClaimIds,

                    completedClaimIds:
                        interviewState.completedClaimIds,

                    pendingFollowUpClaimIds:
                        interviewState.pendingFollowUpClaimIds,

                    currentStage,

                    targetRole,

                    claimRelationships,
                });


            if (selection.claim) {

                return {

                    type:
                        InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

                    claimId:
                        selection.claim.id,

                    reason:
                        `The candidate appears frustrated with the current line of questioning about "${currentClaim.title}". Move to another high-value claim rather than continuing the same conversational pattern.`,
                };
            }


            return {

                type:
                    InterviewDecisionType.CHANGE_ANGLE,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate appears frustrated and no other eligible claim remains. Change the angle of investigation within "${currentClaim.title}" rather than repeating the same question pattern.`,
            };
        }


        /*
         * --------------------------------------------------------
         * CONTRADICTORY
         * --------------------------------------------------------
         */

        case "CONTRADICTORY": {

            return {

                type:
                    InterviewDecisionType.CLARIFY_CONTRADICTION,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate's current answer conflicts with previously established evidence for "${currentClaim.title}". Clarify the contradiction before continuing the investigation.`,
            };
        }


        /*
         * --------------------------------------------------------
         * WEAK
         * --------------------------------------------------------
         */

        case "WEAK": {

            if (
                weakAnswerCount >=
                MAX_WEAK_ANSWERS_BEFORE_MOVING_ON
            ) {

                const selection =
                    selectNextClaim({

                        claims:
                            candidateModel.claims,

                        claimAssessments:
                            candidateModel.claimAssessments,

                        currentClaimId:
                            currentClaimId,

                        remainingClaimIds:
                            interviewState.remainingClaimIds,

                        completedClaimIds:
                            interviewState.completedClaimIds,

                        pendingFollowUpClaimIds:
                            interviewState.pendingFollowUpClaimIds,

                        currentStage,

                        targetRole,

                        claimRelationships,
                    });


                if (selection.claim) {

                    return {

                        type:
                            InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

                        claimId:
                            selection.claim.id,

                        reason:
                            `The candidate has provided insufficient evidence for "${currentClaim.title}" after ${weakAnswerCount} weak answers. Move to another high-value claim rather than repeating the same investigation.`,
                    };
                }


                return {

                    type:
                        InterviewDecisionType.MOVE_TO_NEXT_STAGE,

                    claimId:
                        null,

                    reason:
                        `The candidate has provided insufficient evidence for "${currentClaim.title}" after ${weakAnswerCount} weak answers, and no other eligible claim remains in the current stage.`,
                };
            }


            if (
                failedAttemptsInLatestArea >=
                MAX_FAILED_ATTEMPTS_SAME_AREA
            ) {

                return {

                    type:
                        InterviewDecisionType.CHANGE_ANGLE,

                    claimId:
                        currentClaimId,

                    reason:
                        `The candidate has struggled with the "${latestInvestigationArea}" area for "${currentClaim.title}" across ${failedAttemptsInLatestArea} attempts. Change the angle rather than repeating the same conversational approach.`,
                };
            }


            return {

                type:
                    InterviewDecisionType.RECOVER_CONVERSATION,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate attempted to answer but provided weak evidence for "${currentClaim.title}". Use a simpler and more concrete recovery question.`,
            };
        }


        /*
         * --------------------------------------------------------
         * PARTIAL
         * --------------------------------------------------------
         *
         * Continue into the normal logic below.
         */

        case "PARTIAL":
            break;


        /*
         * --------------------------------------------------------
         * STRONG
         * --------------------------------------------------------
         *
         * Continue into the normal verification logic below.
         */

        case "STRONG":
            break;


        default: {

            const exhaustiveCheck:
                never =
                latestEvaluation.answerBehavior;

            throw new Error(
                `Interview Brain: unsupported answer behavior "${exhaustiveCheck}".`
            );
        }
    }


    /*
     * ============================================================
     * 5. Blocked Conversation Fallback
     * ============================================================
     */

    if (
        conversationIsBlocked ||
        candidateIsFrustrated
    ) {

        const selection =
            selectNextClaim({

                claims:
                    candidateModel.claims,

                claimAssessments:
                    candidateModel.claimAssessments,

                currentClaimId:
                    currentClaimId,

                remainingClaimIds:
                    interviewState.remainingClaimIds,

                completedClaimIds:
                    interviewState.completedClaimIds,

                pendingFollowUpClaimIds:
                    interviewState.pendingFollowUpClaimIds,

                currentStage,

                targetRole,

                claimRelationships,
            });


        if (selection.claim) {

            return {

                type:
                    InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

                claimId:
                    selection.claim.id,

                reason:
                    candidateIsFrustrated

                        ? `The candidate appears frustrated with the current conversational thread. The Brain is moving to another high-value claim rather than continuing the same line of questioning.`

                        : `The current conversational thread for "${currentClaim.title}" has become blocked. The Brain is moving to another high-value claim rather than repeating the same investigation.`,
            };
        }


        return {

            type:
                InterviewDecisionType.MOVE_TO_NEXT_STAGE,

            claimId:
                null,

            reason:
                candidateIsFrustrated

                    ? `The candidate appears frustrated and no other eligible claim remains in the current stage.`

                    : `The current conversational thread for "${currentClaim.title}" is blocked and no other eligible claim remains in the current stage.`,
        };
    }


    /*
     * ============================================================
     * 6. Legacy Weak Answer Protection
     * ============================================================
     *
     * This is retained as a safety net.
     */

    if (
        latestEvaluation.score <
            WEAK_SCORE_THRESHOLD &&
        weakAnswerCount >=
            MAX_WEAK_ANSWERS_BEFORE_MOVING_ON
    ) {

        const selection =
            selectNextClaim({

                claims:
                    candidateModel.claims,

                claimAssessments:
                    candidateModel.claimAssessments,

                currentClaimId:
                    currentClaimId,

                remainingClaimIds:
                    interviewState.remainingClaimIds,

                completedClaimIds:
                    interviewState.completedClaimIds,

                pendingFollowUpClaimIds:
                    interviewState.pendingFollowUpClaimIds,

                currentStage,

                targetRole,

                claimRelationships,
            });


        if (selection.claim) {

            return {

                type:
                    InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

                claimId:
                    selection.claim.id,

                reason:
                    `The candidate has provided insufficient evidence for "${currentClaim.title}" after ${weakAnswerCount} weak answers. The Brain is moving to the next high-value claim rather than repeating the same investigation.`,
            };
        }


        return {

            type:
                InterviewDecisionType.MOVE_TO_NEXT_STAGE,

            claimId:
                null,

            reason:
                `The candidate has provided insufficient evidence for "${currentClaim.title}" after ${weakAnswerCount} weak answers, and no other eligible claims remain in the current stage.`,
        };
    }


    /*
     * ============================================================
     * 7. Failed Attempts in Same Investigation Area
     * ============================================================
     */

    if (
        failedAttemptsInLatestArea >=
        MAX_FAILED_ATTEMPTS_SAME_AREA
    ) {

        if (
            latestEvaluation.score <
            WEAK_SCORE_THRESHOLD
        ) {

            return {

                type:
                    InterviewDecisionType.CHANGE_ANGLE,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate has struggled with the "${latestInvestigationArea}" investigation area for "${currentClaim.title}" across ${failedAttemptsInLatestArea} attempts. The Brain will change the investigation angle instead of repeating the same conversational approach.`,
            };
        }
    }


    /*
     * ============================================================
     * 8. First Weak Answer Fallback
     * ============================================================
     */

    if (
        latestEvaluation.score <
            WEAK_SCORE_THRESHOLD &&
        weakAnswerCount === 1
    ) {

        return {

            type:
                InterviewDecisionType.RECOVER_CONVERSATION,

            claimId:
                currentClaimId,

            reason:
                `The candidate provided insufficient evidence for "${currentClaim.title}". This is the first weak answer, so one focused recovery question is appropriate.`,
        };
    }


    /*
     * ============================================================
     * 9. Second Weak Answer Fallback
     * ============================================================
     */

    if (
        latestEvaluation.score <
            WEAK_SCORE_THRESHOLD &&
        weakAnswerCount === 2
    ) {

        return {

            type:
                InterviewDecisionType.CHANGE_ANGLE,

            claimId:
                currentClaimId,

            reason:
                `The candidate has provided two weak answers while investigating "${currentClaim.title}". The Brain will make one deeper probe from a different angle before deciding whether to move on.`,
        };
    }


    /*
     * ============================================================
     * 10. Follow-up Required
     * ============================================================
     */

    if (
        latestEvaluation.followUpRequired
    ) {

        return {

            type:
                InterviewDecisionType.FOLLOW_UP,

            claimId:
                currentClaimId,

            reason:
                `The latest answer indicates that additional evidence is required for "${currentClaim.title}".`,
        };
    }


    /*
     * ============================================================
     * 11. Questionable Claim
     * ============================================================
     */

    if (
        assessment.verificationStatus ===
        ClaimVerificationStatus.QUESTIONABLE
    ) {

        if (
            latestEvaluation.score <
                STRONG_SCORE_THRESHOLD ||
            evidenceCount < 2
        ) {

            return {

                type:
                    InterviewDecisionType.PROBE_CLAIM,

                claimId:
                    currentClaimId,

                reason:
                    `The claim "${currentClaim.title}" previously had questionable evidence. Additional evidence is required before it can be verified.`,
            };
        }
    }


    /*
     * ============================================================
     * 12. Sufficiently Verified
     * ============================================================
     */

    const sufficientlyVerified =
        assessment.confidence >=
            CONFIDENCE_TO_VERIFY &&

        !assessment.needsFollowUp &&

        assessment.verificationStatus ===
            ClaimVerificationStatus.VERIFIED;


    if (
        sufficientlyVerified
    ) {

        const selection =
            selectNextClaim({

                claims:
                    candidateModel.claims,

                claimAssessments:
                    candidateModel.claimAssessments,

                currentClaimId:
                    currentClaimId,

                remainingClaimIds:
                    interviewState.remainingClaimIds,

                completedClaimIds:
                    interviewState.completedClaimIds,

                pendingFollowUpClaimIds:
                    interviewState.pendingFollowUpClaimIds,

                currentStage,

                targetRole,

                claimRelationships,
            });


        if (selection.claim) {

            return {

                type:
                    InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

                claimId:
                    selection.claim.id,

                reason:
                    `The claim "${currentClaim.title}" has sufficient evidence. The next highest-value claim has been selected.`,
            };
        }


        return {

            type:
                InterviewDecisionType.MOVE_TO_NEXT_STAGE,

            claimId:
                null,

            reason:
                `The important claims in stage "${currentStage.topic}" have been sufficiently investigated.`,
        };
    }


    /*
     * ============================================================
     * 13. Strong Answer but Confidence Is Still Low
     * ============================================================
     */

    if (
        latestEvaluation.answerBehavior ===
            "STRONG" &&

        latestEvaluation.score >=
            STRONG_SCORE_THRESHOLD &&

        assessment.confidence <
            CONFIDENCE_TO_VERIFY
    ) {

        return {

            type:
                InterviewDecisionType.PROBE_CLAIM,

            claimId:
                currentClaimId,

            reason:
                `The latest answer was strong, but the accumulated evidence for "${currentClaim.title}" is not yet sufficient for high-confidence verification.`,
        };
    }


    /*
     * ============================================================
     * 14. Confidence-Based Probe
     * ============================================================
     */

    if (
        assessment.confidence >=
        CONFIDENCE_TO_PROBE
    ) {

        return {

            type:
                InterviewDecisionType.PROBE_CLAIM,

            claimId:
                currentClaimId,

            reason:
                `The candidate has demonstrated meaningful understanding of "${currentClaim.title}", but additional evidence would improve confidence.`,
        };
    }


    /*
     * ============================================================
     * 15. Partial Answer
     * ============================================================
     *
     * At this point the candidate answered partially and there
     * are no stronger transition conditions.
     */

    if (
        latestEvaluation.answerBehavior ===
        "PARTIAL"
    ) {

        return {

            type:
                InterviewDecisionType.FOLLOW_UP,

            claimId:
                currentClaimId,

            reason:
                `The candidate provided useful but incomplete evidence for "${currentClaim.title}". Ask a focused follow-up that builds directly on the answer.`,
        };
    }


    /*
     * ============================================================
     * 16. Default
     * ============================================================
     */

    return {

        type:
            InterviewDecisionType.PROBE_CLAIM,

        claimId:
            currentClaimId,

        reason:
            `The available evidence is insufficient to confidently verify "${currentClaim.title}".`,
    };
};