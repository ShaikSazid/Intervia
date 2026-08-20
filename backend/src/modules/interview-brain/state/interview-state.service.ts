import {
    InterviewDecision,
} from "../brain/interview-decision.types.js";

import { recordFollowUp, recordProbe } from "../candidate/claim-progress.service.js";

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
        | PROBE_CLAIM
        |--------------------------------------------------------------------------
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
             * The previous claim has now been completed.
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
        | The actual stage index is maintained by SessionProgress.
        |
        | This decision clears the active claim.
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
        | MOVE_TO_NEXT_STAGE
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