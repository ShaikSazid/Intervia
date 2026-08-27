import {
    InterviewDecision,
} from "../brain/interview-decision.types.js";

import {
    recordFollowUp,
    recordProbe,
} from "../candidate/claim-progress.service.js";

import {
    InterviewDecisionType,
} from "../brain/interview-decision.enums.js";

import {
    InterviewState,
} from "./interview-state.types.js";


export const applyInterviewDecision = (
    state: InterviewState,
    decision: InterviewDecision
): InterviewState => {

    switch (decision.type) {


        /*
        |--------------------------------------------------------------------------
        | FOLLOW_UP
        |--------------------------------------------------------------------------
        |
        | Continue investigating the same claim.
        |
        */

        case InterviewDecisionType.FOLLOW_UP: {

            if (!decision.claimId) {

                throw new Error(
                    "FOLLOW_UP decision requires a claimId."
                );
            }


            const updatedClaimProgress =
                recordFollowUp(
                    state.claimProgress,
                    decision.claimId
                );


            return {

                ...state,

                currentClaimId:
                    decision.claimId,

                pendingFollowUpClaimIds:
                    state.pendingFollowUpClaimIds.includes(
                        decision.claimId
                    )
                        ? state.pendingFollowUpClaimIds
                        : [
                            ...state.pendingFollowUpClaimIds,
                            decision.claimId,
                        ],

                claimProgress:
                    updatedClaimProgress,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | RECOVER_CONVERSATION
        |--------------------------------------------------------------------------
        |
        | The candidate is struggling, so stay on the same claim
        | but explicitly enter conversational recovery.
        |
        */

        case InterviewDecisionType.RECOVER_CONVERSATION: {

            if (!decision.claimId) {

                throw new Error(
                    "RECOVER_CONVERSATION decision requires a claimId."
                );
            }


            const updatedClaimProgress =
                recordFollowUp(
                    state.claimProgress,
                    decision.claimId
                );


            return {

                ...state,

                currentClaimId:
                    decision.claimId,

                pendingFollowUpClaimIds:
                    state.pendingFollowUpClaimIds.includes(
                        decision.claimId
                    )
                        ? state.pendingFollowUpClaimIds
                        : [
                            ...state.pendingFollowUpClaimIds,
                            decision.claimId,
                        ],

                claimProgress:
                    updatedClaimProgress,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | PROBE_CLAIM
        |--------------------------------------------------------------------------
        |
        | Continue investigating the same claim through a deeper
        | or different technical dimension.
        |
        */

        case InterviewDecisionType.PROBE_CLAIM: {

            if (!decision.claimId) {

                throw new Error(
                    "PROBE_CLAIM decision requires a claimId."
                );
            }


            const updatedClaimProgress =
                recordProbe(
                    state.claimProgress,
                    decision.claimId
                );


            return {

                ...state,

                currentClaimId:
                    decision.claimId,

                claimProgress:
                    updatedClaimProgress,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | CHANGE_ANGLE
        |--------------------------------------------------------------------------
        |
        | Stay on the same claim but deliberately investigate a
        | different conversational/technical angle.
        |
        */

        case InterviewDecisionType.CHANGE_ANGLE: {

            if (!decision.claimId) {

                throw new Error(
                    "CHANGE_ANGLE decision requires a claimId."
                );
            }


            const updatedClaimProgress =
                recordProbe(
                    state.claimProgress,
                    decision.claimId
                );


            return {

                ...state,

                currentClaimId:
                    decision.claimId,

                claimProgress:
                    updatedClaimProgress,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | CLARIFY_CONTRADICTION
        |--------------------------------------------------------------------------
        |
        | Remain on the same claim and resolve contradictory evidence.
        |
        */

        case InterviewDecisionType.CLARIFY_CONTRADICTION: {

            if (!decision.claimId) {

                throw new Error(
                    "CLARIFY_CONTRADICTION decision requires a claimId."
                );
            }


            const updatedClaimProgress =
                recordFollowUp(
                    state.claimProgress,
                    decision.claimId
                );


            return {

                ...state,

                currentClaimId:
                    decision.claimId,

                pendingFollowUpClaimIds:
                    state.pendingFollowUpClaimIds.includes(
                        decision.claimId
                    )
                        ? state.pendingFollowUpClaimIds
                        : [
                            ...state.pendingFollowUpClaimIds,
                            decision.claimId,
                        ],

                claimProgress:
                    updatedClaimProgress,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | MOVE_TO_NEXT_CLAIM
        |--------------------------------------------------------------------------
        */

        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM: {

            if (!decision.claimId) {

                throw new Error(
                    "MOVE_TO_NEXT_CLAIM decision requires a claimId."
                );
            }


            const currentClaimId =
                state.currentClaimId;


            /*
             * Remove the NEW claim from remaining claims.
             */

            const remainingClaimIds =
                state.remainingClaimIds.filter(
                    (claimId) =>
                        claimId !==
                        decision.claimId
                );


            /*
             * Complete the previous claim.
             */

            const completedClaimIds =
                currentClaimId &&
                    !state.completedClaimIds.includes(
                        currentClaimId
                    )
                    ? [
                        ...state.completedClaimIds,
                        currentClaimId,
                    ]
                    : state.completedClaimIds;


            /*
             * Remove both claims from pending follow-ups.
             */

            const pendingFollowUpClaimIds =
                state.pendingFollowUpClaimIds.filter(
                    (claimId) =>
                        claimId !==
                        currentClaimId &&
                        claimId !==
                        decision.claimId
                );


            return {

                ...state,

                currentClaimId:
                    decision.claimId,

                remainingClaimIds,

                completedClaimIds,

                pendingFollowUpClaimIds,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | MOVE_TO_NEXT_STAGE
        |--------------------------------------------------------------------------
        |
        | SessionProgress owns the stage index.
        |
        | The Brain state therefore clears the active claim.
        |
        */

        case InterviewDecisionType.MOVE_TO_NEXT_STAGE: {

            const currentClaimId =
                state.currentClaimId;


            const completedClaimIds =
                currentClaimId &&
                    !state.completedClaimIds.includes(
                        currentClaimId
                    )
                    ? [
                        ...state.completedClaimIds,
                        currentClaimId,
                    ]
                    : state.completedClaimIds;


            return {

                ...state,

                currentClaimId:
                    null,

                pendingFollowUpClaimIds:
                    [],

                completedClaimIds,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | FINISH_INTERVIEW
        |--------------------------------------------------------------------------
        */

        case InterviewDecisionType.FINISH_INTERVIEW: {

            const currentClaimId =
                state.currentClaimId;


            const completedClaimIds =
                currentClaimId &&
                    !state.completedClaimIds.includes(
                        currentClaimId
                    )
                    ? [
                        ...state.completedClaimIds,
                        currentClaimId,
                    ]
                    : state.completedClaimIds;


            return {

                ...state,

                currentClaimId:
                    null,

                remainingClaimIds:
                    [],

                pendingFollowUpClaimIds:
                    [],

                completedClaimIds,
            };
        }


        /*
        |--------------------------------------------------------------------------
        | Exhaustive Check
        |--------------------------------------------------------------------------
        */

        default: {

            const exhaustiveCheck:
                never =
                decision.type;

            return exhaustiveCheck;
        }
    }
};