import {
    InvestigationAttempt,
    InvestigationAttemptOutcome,
} from "./investigation-attempt.types.js";

import {
    AnswerEvaluation,
} from "../../answer-evaluation/answer-evaluation.types.js";


export const determineInvestigationAttemptOutcome = (
    evaluation: AnswerEvaluation,
    answer: string
): InvestigationAttemptOutcome => {

    const normalizedAnswer =
        answer.trim().toLowerCase();


    /*
     * Candidate explicitly could not provide an answer.
     */
    if (
        normalizedAnswer === "i don't know" ||
        normalizedAnswer === "i dont know" ||
        normalizedAnswer === "i don't remember" ||
        normalizedAnswer === "i dont remember" ||
        normalizedAnswer === "no" ||
        normalizedAnswer === "no idea"
    ) {
        return "NO_ANSWER";
    }


    /*
     * Weak technical answer.
     */
    if (
        evaluation.score < 5
    ) {
        return "WEAK";
    }


    /*
     * For now, treat a sufficiently answered question
     * as ANSWERED.
     *
     * Contradiction detection will be added separately.
     */
    return "ANSWERED";
};


export const createInvestigationAttempt = (
    input: {
        turnId: string;
        claimId: string;
        investigationArea:
            InvestigationAttempt["investigationArea"];
        objective: string;
        question: string;
        answer: string;
        evaluation: AnswerEvaluation;
    }
): InvestigationAttempt => {

    return {

        turnId:
            input.turnId,

        claimId:
            input.claimId,

        investigationArea:
            input.investigationArea,

        objective:
            input.objective,

        question:
            input.question,

        outcome:
            determineInvestigationAttemptOutcome(
                input.evaluation,
                input.answer
            ),
    };
};