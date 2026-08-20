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


export const decideNextAction = (context: InterviewBrainContext): InterviewDecision => {
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

    const weakAnswerCount = claimProgress?.weakAnswerCount ?? 0;
    const conversationState = interviewState.conversationState;
    const conversationIsBlocked = conversationState.threadStatus === "BLOCKED";
    const candidateIsFrustrated = conversationState.candidateFrustrated;
    const conversationMode = conversationState.mode;



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


if (
    conversationMode ===
    "GUIDED_RECOVERY"
) {

    return {
        type:
            InterviewDecisionType.FOLLOW_UP,

        claimId:
            currentClaimId,

        reason:
            `The candidate is struggling with the current investigation. Use a simpler, more concrete question to recover the conversation before moving on.`,
    };
}


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
                    InterviewDecisionType.PROBE_CLAIM,

                claimId:
                    currentClaimId,

                reason:
                    `The candidate has struggled with the "${latestInvestigationArea}" investigation area for "${currentClaim.title}" across ${failedAttemptsInLatestArea} attempts. The Brain will probe the same claim from a different angle instead of repeating the same conversational approach.`,
            };
        }
    }


    if (
        latestEvaluation.score <
            WEAK_SCORE_THRESHOLD &&
        weakAnswerCount === 1
    ) {

        return {

            type:
                InterviewDecisionType.FOLLOW_UP,

            claimId:
                currentClaimId,

            reason:
                `The candidate provided insufficient evidence for "${currentClaim.title}". This is the first weak answer, so one focused follow-up is appropriate.`,
        };
    }


    if (
        latestEvaluation.score <
            WEAK_SCORE_THRESHOLD &&
        weakAnswerCount === 2
    ) {

        return {

            type:
                InterviewDecisionType.PROBE_CLAIM,

            claimId:
                currentClaimId,

            reason:
                `The candidate has provided two weak answers while investigating "${currentClaim.title}". The Brain will make one deeper probe from a different angle before deciding whether to move on.`,
        };
    }


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

        if (
            selection.claim
        ) {

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

    if (
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
     * 18. Default
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