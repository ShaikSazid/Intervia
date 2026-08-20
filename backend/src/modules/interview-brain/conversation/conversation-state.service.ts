import {
    ConversationState,
    ConversationThreadStatus,
    InterviewConversationMode,
} from "./conversation-state.types.js";

import {
    AnswerEvaluation,
} from "../../answer-evaluation/answer-evaluation.types.js";

import {
    InvestigationAttempt,
} from "../candidate/investigation-attempt.types.js";


const NO_ANSWER_VALUES = new Set([
    "i don't know",
    "i dont know",
    "i don't remember",
    "i dont remember",
    "no idea",
    "not sure",
]);


const FRUSTRATION_PATTERNS = [
    "why are you asking",
    "same question",
    "you already asked",
    "you keep asking",
    "stop asking",
    "worst interview",
    "this is the worst interview",
    "this interview is bad",
    "i already told you",
];


const MAX_RECENT_QUESTIONS = 5;

const GUIDED_RECOVERY_AFTER_FAILURES = 1;

const FUNDAMENTALS_AFTER_FAILURES = 3;


/*
 * ============================================================
 * Normalize text
 * ============================================================
 */

const normalizeText = (
    value: string
): string => {

    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};


/*
 * ============================================================
 * Detect explicit no-answer
 * ============================================================
 */

const isNoAnswer = (
    answer: string
): boolean => {

    return NO_ANSWER_VALUES.has(
        normalizeText(answer)
    );
};


/*
 * ============================================================
 * Detect candidate frustration
 * ============================================================
 */

const detectCandidateFrustration = (
    answer: string
): boolean => {

    const normalized =
        normalizeText(answer);

    return FRUSTRATION_PATTERNS.some(
        (pattern) =>
            normalized.includes(pattern)
    );
};


/*
 * ============================================================
 * Determine conversation mode
 * ============================================================
 *
 * The mode describes HOW the interviewer should behave.
 *
 * It is intentionally separate from:
 *
 * - claim
 * - investigation area
 * - interview stage
 *
 * This is conversational control.
 */

const determineConversationMode = (
    previousMode: InterviewConversationMode,
    evaluation: AnswerEvaluation,
    answer: string,
    failedAttempts: number,
    candidateFrustrated: boolean,
): InterviewConversationMode => {

    /*
     * Candidate frustration takes precedence.
     *
     * The interviewer should stop pushing the same
     * conversational pattern.
     */

    if (candidateFrustrated) {

        return "GUIDED_RECOVERY";
    }


    /*
     * Explicit non-answer.
     */

    if (
        isNoAnswer(answer)
    ) {

        if (
            failedAttempts >=
            FUNDAMENTALS_AFTER_FAILURES
        ) {

            return "FUNDAMENTALS_CHECK";
        }


        if (
            failedAttempts >=
            GUIDED_RECOVERY_AFTER_FAILURES
        ) {

            return "GUIDED_RECOVERY";
        }


        return "CLAIM_INVESTIGATION";
    }


    /*
     * Weak answer.
     */

    if (
        evaluation.score < 5
    ) {

        if (
            failedAttempts >=
            FUNDAMENTALS_AFTER_FAILURES
        ) {

            return "FUNDAMENTALS_CHECK";
        }


        return "GUIDED_RECOVERY";
    }


    /*
     * Strong answer that still requires additional evidence.
     *
     * Stay in normal claim investigation.
     */

    if (
        evaluation.score >= 8 &&
        evaluation.followUpRequired === false
    ) {

        return "CLAIM_INVESTIGATION";
    }


    /*
     * Moderate answer.
     */

    if (
        evaluation.followUpRequired
    ) {

        return "CLAIM_INVESTIGATION";
    }


    /*
     * Preserve the previous mode when nothing requires
     * a conversational transition.
     */

    return previousMode;
};


/*
 * ============================================================
 * Determine thread status
 * ============================================================
 */

const determineThreadStatus = (
    evaluation: AnswerEvaluation,
    answer: string,
    failedAttempts: number,
    candidateFrustrated: boolean,
): ConversationThreadStatus => {

    /*
     * Candidate frustration means the current thread should
     * not continue in exactly the same form.
     */

    if (candidateFrustrated) {

        return "BLOCKED";
    }


    /*
     * Explicit no-answer.
     */

    if (
        isNoAnswer(answer)
    ) {

        return failedAttempts >= 2
            ? "BLOCKED"
            : "OPEN";
    }


    /*
     * Weak answer.
     */

    if (
        evaluation.score < 5
    ) {

        return failedAttempts >= 3
            ? "BLOCKED"
            : "OPEN";
    }


    /*
     * Strong and sufficiently complete answer.
     */

    if (
        evaluation.score >= 8 &&
        !evaluation.followUpRequired
    ) {

        return "RESOLVED";
    }


    /*
     * Moderate/incomplete answer.
     */

    return "OPEN";
};


/*
 * ============================================================
 * Build demonstrated evidence
 * ============================================================
 *
 * We currently use evaluator feedback plus the investigation
 * objective as a coarse evidence representation.
 *
 * Later we can replace this with a dedicated evidence extractor.
 */

const updateDemonstratedEvidence = (
    currentEvidence: string[],
    evaluation: AnswerEvaluation,
    attempt: InvestigationAttempt,
): string[] => {

    if (
        evaluation.score < 7 ||
        evaluation.followUpRequired
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
 * Build missing evidence
 * ============================================================
 */

const updateMissingEvidence = (
    currentEvidence: string[],
    evaluation: AnswerEvaluation,
    attempt: InvestigationAttempt,
): string[] => {

    const shouldRemainMissing =
        evaluation.score < 7 ||
        evaluation.followUpRequired ||
        attempt.outcome === "NO_ANSWER" ||
        attempt.outcome === "WEAK";


    if (!shouldRemainMissing) {

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


    const candidateFrustrated =
        detectCandidateFrustration(
            answer
        );


    const noAnswer =
        isNoAnswer(
            answer
        );


    /*
     * ============================================================
     * Failed attempt counter
     * ============================================================
     */

    const failedAnswer =
        noAnswer ||
        evaluation.score < 5 ||
        attempt.outcome === "NO_ANSWER" ||
        attempt.outcome === "WEAK";


    const failedAttempts =
        failedAnswer
            ? currentState.failedAttempts + 1
            : 0;


    /*
     * ============================================================
     * Demonstrated evidence
     * ============================================================
     */

    const demonstratedEvidence =
        updateDemonstratedEvidence(
            currentState.demonstratedEvidence,
            evaluation,
            attempt
        );


    /*
     * ============================================================
     * Missing evidence
     * ============================================================
     */

    const missingEvidence =
        updateMissingEvidence(
            currentState.missingEvidence,
            evaluation,
            attempt
        );


    /*
     * ============================================================
     * Thread status
     * ============================================================
     */

    const threadStatus =
        determineThreadStatus(
            evaluation,
            answer,
            failedAttempts,
            candidateFrustrated
        );


    /*
     * ============================================================
     * Conversation mode
     * ============================================================
     */

    const mode =
        determineConversationMode(
            currentState.mode,
            evaluation,
            answer,
            failedAttempts,
            candidateFrustrated
        );


    /*
     * ============================================================
     * Recent questions
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
     * Recent answers
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
     * Contradictions
     * ============================================================
     *
     * We are not automatically detecting semantic contradictions
     * yet.
     *
     * Keep the existing structure intact until that component
     * is introduced.
     */

    const unresolvedContradictions =
        currentState.unresolvedContradictions;


    /*
     * ============================================================
     * Return updated state
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

        candidateFrustrated:
            currentState.candidateFrustrated ||
            candidateFrustrated,
    };
};