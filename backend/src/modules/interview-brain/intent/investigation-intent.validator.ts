import {
    InterviewDecisionType,
} from "../brain/interview-decision.enums.js";

import {
    InvestigationIntent,
} from "./investigation-intent.types.js";


export const validateInvestigationIntent = (
    intent: InvestigationIntent
): void => {

    if (!intent.claimId) {
        throw new Error(
            "InvestigationIntent: claimId is required."
        );
    }

    /*
 * RECOVER_CONVERSATION must stay on the current claim
 * and should use clarification behavior.
 */
if (
    intent.decision ===
    InterviewDecisionType.RECOVER_CONVERSATION
) {

    if (
        intent.conversationDirective !==
        "CLARIFY"
    ) {

        throw new Error(
            "RECOVER_CONVERSATION must use CLARIFY conversation directive."
        );
    }
}


/*
 * CHANGE_ANGLE should remain on the same claim
 * but investigate a different dimension.
 */
if (
    intent.decision ===
    InterviewDecisionType.CHANGE_ANGLE
) {

    if (
        intent.conversationDirective !==
        "DEEPEN"
    ) {

        throw new Error(
            "CHANGE_ANGLE must use DEEPEN conversation directive."
        );
    }
}


/*
 * CLARIFY_CONTRADICTION must use clarification behavior.
 */
if (
    intent.decision ===
    InterviewDecisionType.CLARIFY_CONTRADICTION
) {

    if (
        intent.conversationDirective !==
        "CLARIFY"
    ) {

        throw new Error(
            "CLARIFY_CONTRADICTION must use CLARIFY conversation directive."
        );
    }
}

    if (!intent.objective) {
        throw new Error(
            "InvestigationIntent: objective is required."
        );
    }

    if (!intent.investigationArea) {
        throw new Error(
            "InvestigationIntent: investigationArea is required."
        );
    }


    /*
     * FOLLOW_UP must stay on the current claim.
     */
    if (
        intent.decision ===
        InterviewDecisionType.FOLLOW_UP
    ) {

        if (
            intent.conversationDirective !==
            "CLARIFY"
        ) {

            throw new Error(
                "FOLLOW_UP must use CLARIFY conversation directive."
            );
        }
    }


    /*
     * PROBE must actually deepen investigation.
     */
    if (
        intent.decision ===
        InterviewDecisionType.PROBE_CLAIM
    ) {

        if (
            intent.conversationDirective !==
            "DEEPEN"
        ) {

            throw new Error(
                "PROBE_CLAIM must use DEEPEN conversation directive."
            );
        }
    }


    /*
     * The Brain should never tell the question generator
     * to finish while still generating a question.
     */
    if (
        intent.decision ===
        InterviewDecisionType.FINISH_INTERVIEW
    ) {

        throw new Error(
            "FINISH_INTERVIEW must not generate a question."
        );
    }
};