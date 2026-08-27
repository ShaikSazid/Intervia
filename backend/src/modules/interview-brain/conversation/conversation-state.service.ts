import {
    ConversationState,
    ConversationThreadStatus,
    InterviewConversationMode,
} from "./conversation-state.types.js";

import {
    AnswerEvaluation,
    AnswerBehavior,
} from "../../answer-evaluation/answer-evaluation.types.js";

import {
    InvestigationAttempt,
} from "../candidate/investigation-attempt.types.js";


const MAX_RECENT_QUESTIONS = 5;


/*
 * ============================================================
 * Determine Conversation Mode
 * ============================================================
 *
 * AnswerBehavior is now the authoritative signal.
 *
 * We deliberately keep the existing ConversationMode values
 * for now. New explicit Brain decisions such as CHANGE_ANGLE
 * and CLARIFY_CONTRADICTION will be added later.
 */

const determineConversationMode = (
    previousMode: InterviewConversationMode,
    answerBehavior: AnswerBehavior,
    failedAttempts: number,
): InterviewConversationMode => {

    switch (answerBehavior) {

        /*
         * Candidate does not know the answer.
         *
         * Make the next question simpler and more concrete.
         */

        case "NO_ANSWER":

            if (failedAttempts >= 3) {
                return "FUNDAMENTALS_CHECK";
            }

            return "GUIDED_RECOVERY";


        /*
         * Candidate may know the concept but cannot remember
         * the exact implementation.
         *
         * Do not immediately treat this as lack of knowledge.
         */

        case "DONT_REMEMBER":

            return "GUIDED_RECOVERY";


        /*
         * Candidate answered something unrelated.
         *
         * Recover the conversation rather than treating the
         * unrelated answer as evidence for the current claim.
         */

        case "OFF_TOPIC":

            return "GUIDED_RECOVERY";


        /*
         * Candidate explicitly expressed frustration.
         *
         * Stay away from the same question pattern.
         */

        case "FRUSTRATED":

            return "GUIDED_RECOVERY";


        /*
         * Contradiction requires clarification.
         *
         * For now, keep the conversation in a controlled recovery
         * mode. A dedicated contradiction decision will come later.
         */

        case "CONTRADICTORY":

            return "GUIDED_RECOVERY";


        /*
         * Strong answer.
         *
         * Return to normal claim investigation so the Brain can
         * decide whether deeper investigation is justified.
         */

        case "STRONG":

            return "CLAIM_INVESTIGATION";


        /*
         * Partial answer.
         *
         * Continue normal investigation because the candidate
         * has provided some useful evidence.
         */

        case "PARTIAL":

            return "CLAIM_INVESTIGATION";


        /*
         * Weak but relevant answer.
         *
         * Stay in claim investigation unless repeated failure
         * has already pushed the interview toward recovery.
         */

        case "WEAK":

            if (failedAttempts >= 3) {
                return "FUNDAMENTALS_CHECK";
            }

            return "GUIDED_RECOVERY";


        default: {

            const exhaustiveCheck:
                never =
                answerBehavior;

            return exhaustiveCheck;
        }
    }
};


/*
 * ============================================================
 * Determine Failed Attempt Count
 * ============================================================
 *
 * Not every non-strong answer is the same.
 *
 * NO_ANSWER:
 *     strong failure signal
 *
 * DONT_REMEMBER:
 *     unsuccessful for this question, but weaker signal
 *
 * OFF_TOPIC:
 *     unproductive, but not necessarily lack of knowledge
 *
 * FRUSTRATED:
 *     do not punish the candidate's technical confidence
 *
 * STRONG / PARTIAL:
 *     reset consecutive failure count
 */

const determineFailedAttempts = (
    currentFailedAttempts: number,
    answerBehavior: AnswerBehavior,
): number => {

    switch (answerBehavior) {

        case "NO_ANSWER":

            return currentFailedAttempts + 1;


        case "DONT_REMEMBER":

            return currentFailedAttempts + 1;


        case "OFF_TOPIC":

            return currentFailedAttempts + 1;


        case "WEAK":

            return currentFailedAttempts + 1;


        /*
         * Frustration is a conversational event, not evidence
         * that the candidate lacks technical ability.
         */

        case "FRUSTRATED":

            return currentFailedAttempts;


        /*
         * Contradiction needs clarification, but should not
         * automatically count as lack of knowledge.
         */

        case "CONTRADICTORY":

            return currentFailedAttempts;


        case "PARTIAL":

            return 0;


        case "STRONG":

            return 0;


        default: {

            const exhaustiveCheck:
                never =
                answerBehavior;

            return exhaustiveCheck;
        }
    }
};


/*
 * ============================================================
 * Determine Thread Status
 * ============================================================
 */

const determineThreadStatus = (
    answerBehavior: AnswerBehavior,
    failedAttempts: number,
): ConversationThreadStatus => {

    switch (answerBehavior) {

        /*
         * Explicit frustration means the current conversational
         * pattern should not simply continue unchanged.
         */

        case "FRUSTRATED":

            return "BLOCKED";


        /*
         * Repeated inability to answer means the current
         * investigation thread is no longer productive.
         */

        case "NO_ANSWER":

            return failedAttempts >= 3
                ? "BLOCKED"
                : "OPEN";


        case "DONT_REMEMBER":

            return failedAttempts >= 3
                ? "BLOCKED"
                : "OPEN";


        case "OFF_TOPIC":

            return failedAttempts >= 2
                ? "BLOCKED"
                : "OPEN";


        case "CONTRADICTORY":

            return "OPEN";


        /*
         * A strong answer can resolve the current question
         * without necessarily ending the overall claim.
         */

        case "STRONG":

            return "RESOLVED";


        case "PARTIAL":

            return "OPEN";


        case "WEAK":

            return failedAttempts >= 3
                ? "BLOCKED"
                : "OPEN";


        default: {

            const exhaustiveCheck:
                never =
                answerBehavior;

            return exhaustiveCheck;
        }
    }
};


/*
 * ============================================================
 * Update Demonstrated Evidence
 * ============================================================
 */

const updateDemonstratedEvidence = (
    currentEvidence: string[],
    evaluation: AnswerEvaluation,
    attempt: InvestigationAttempt,
): string[] => {

    /*
     * Only strong answers should automatically establish
     * demonstrated evidence.
     *
     * Partial answers may contain useful information, but we
     * currently don't want to treat them as fully established.
     */

    if (
        evaluation.answerBehavior !==
        "STRONG"
    ) {

        return currentEvidence;
    }


    return [
        ...new Set([
            ...currentEvidence,
            attempt.objective,
        ]),
    ];
};


/*
 * ============================================================
 * Update Missing Evidence
 * ============================================================
 */

const updateMissingEvidence = (
    currentEvidence: string[],
    evaluation: AnswerEvaluation,
    attempt: InvestigationAttempt,
): string[] => {

    switch (
        evaluation.answerBehavior
    ) {

        /*
         * Strong answer can remove the current objective from
         * the list of missing evidence.
         */

        case "STRONG": {

            return currentEvidence.filter(
                (evidence) =>
                    evidence !==
                    attempt.objective
            );
        }


        /*
         * Everything else leaves the objective unresolved.
         */

        default: {

            return [
                ...new Set([
                    ...currentEvidence,
                    attempt.objective,
                ]),
            ];
        }
    }
};


/*
 * ============================================================
 * Update Conversation State
 * ============================================================
 */

export const updateConversationState = (
    currentState: ConversationState,
    input: {
        questionId: string;

        question: string;

        answer: string;

        evaluation: AnswerEvaluation;

        attempt: InvestigationAttempt;
    }
): ConversationState => {

    const {
        questionId,
        question,
        answer,
        evaluation,
        attempt,
    } = input;


    /*
     * ============================================================
     * 1. Answer behavior
     * ============================================================
     *
     * This is now the primary conversational signal.
     */

    const answerBehavior =
        evaluation.answerBehavior;


    /*
     * ============================================================
     * 2. Failed attempt count
     * ============================================================
     */

    const failedAttempts =
        determineFailedAttempts(
            currentState.failedAttempts,
            answerBehavior,
        );


    /*
     * ============================================================
     * 3. Demonstrated evidence
     * ============================================================
     */

    const demonstratedEvidence =
        updateDemonstratedEvidence(
            currentState.demonstratedEvidence,
            evaluation,
            attempt,
        );


    /*
     * ============================================================
     * 4. Missing evidence
     * ============================================================
     */

    const missingEvidence =
        updateMissingEvidence(
            currentState.missingEvidence,
            evaluation,
            attempt,
        );


    /*
     * ============================================================
     * 5. Thread status
     * ============================================================
     */

    const threadStatus =
        determineThreadStatus(
            answerBehavior,
            failedAttempts,
        );


    /*
     * ============================================================
     * 6. Conversation mode
     * ============================================================
     */

    const mode =
        determineConversationMode(
            currentState.mode,
            answerBehavior,
            failedAttempts,
        );


    /*
     * ============================================================
     * 7. Recent questions
     * ============================================================
     */

    const recentQuestionIds = [
        ...currentState.recentQuestionIds,
        questionId,
    ].slice(
        -MAX_RECENT_QUESTIONS
    );


    const recentQuestionTexts = [
        ...currentState.recentQuestionTexts,
        question,
    ].slice(
        -MAX_RECENT_QUESTIONS
    );


    /*
     * ============================================================
     * 8. Recent answers
     * ============================================================
     */

    const recentAnswerTexts = [
        ...currentState.recentAnswerTexts,
        answer,
    ].slice(
        -MAX_RECENT_QUESTIONS
    );


    /*
     * ============================================================
     * 9. Candidate frustration
     * ============================================================
     *
     * We now trust the evaluator instead of searching the raw
     * answer text ourselves.
     */

    const candidateFrustrated =
        currentState.candidateFrustrated ||
        answerBehavior === "FRUSTRATED";


    /*
     * ============================================================
     * 10. Contradictions
     * ============================================================
     *
     * Detection itself will be implemented separately.
     * Do not invent contradictions here.
     */

    const unresolvedContradictions =
        currentState.unresolvedContradictions;


    /*
     * ============================================================
     * 11. Return new immutable state
     * ============================================================
     */

    return {

        ...currentState,

        mode,

        threadStatus,

        demonstratedEvidence,

        missingEvidence,

        failedAttempts,

        recentQuestionIds,

        recentQuestionTexts,

        recentAnswerTexts,

        unresolvedContradictions,

        candidateFrustrated,
    };
};