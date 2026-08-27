import {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    interviewApi,
    type InterviewInputMode,
    type InterviewQuestion,
} from "../api/interview.api";


interface UseInterviewOptions {

    sessionId: string;

    initialQuestion:
        InterviewQuestion;

    initialTurnId:
        string;
}


export function useInterview({
    sessionId,
    initialQuestion,
    initialTurnId,
}: UseInterviewOptions) {

    /*
     * ============================================================
     * Current Conversation Turn
     * ============================================================
     *
     * Every interview question belongs to one ConversationTurn.
     *
     * We keep the current turn ID in React state so the UI can
     * render against the current turn.
     */

    const [
        turnId,
        setTurnId,
    ] = useState<string>(
        initialTurnId
    );


    /*
     * ============================================================
     * Current Question
     * ============================================================
     */

    const [
        question,
        setQuestion,
    ] = useState<InterviewQuestion | null>(
        initialQuestion
    );


    /*
     * ============================================================
     * Submission State
     * ============================================================
     */

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);


    /*
     * ============================================================
     * Completion State
     * ============================================================
     */

    const [
        isCompleted,
        setIsCompleted,
    ] = useState(false);


    /*
     * ============================================================
     * Error State
     * ============================================================
     */

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /*
     * ============================================================
     * Synchronous submission lock
     * ============================================================
     *
     * IMPORTANT:
     *
     * React state updates are asynchronous.
     *
     * Therefore:
     *
     *     isSubmitting === false
     *
     * can still be observed by another callback immediately after
     * the first submission starts.
     *
     * This ref changes synchronously and prevents duplicate
     * submissions immediately.
     */

    const submissionInProgressRef =
        useRef(false);


    /*
     * ============================================================
     * Processed turn IDs
     * ============================================================
     *
     * Once a turn has been submitted, never submit that exact
     * turn again from this browser session.
     */

    const submittedTurnIdsRef =
        useRef<Set<string>>(
            new Set()
        );


    /*
     * ============================================================
     * Submit Interview Turn
     * ============================================================
     */

    const submitTurn =
        useCallback(
            async (
                answer: string,
                inputMode:
                    InterviewInputMode =
                    "TEXT"
            ) => {

                const trimmed =
                    answer.trim();


                /*
                 * ------------------------------------------------
                 * Ignore empty answers
                 * ------------------------------------------------
                 */

                if (!trimmed) {

                    console.warn(
                        "[Interview] Ignoring empty answer."
                    );


                    return;
                }


                /*
                 * ------------------------------------------------
                 * Make sure we have a turn ID
                 * ------------------------------------------------
                 */

                const currentTurnId =
                    turnId;


                if (!currentTurnId) {

                    console.error(
                        "[Interview] Cannot submit answer: turnId is missing."
                    );


                    setError(
                        "The current interview turn could not be identified."
                    );


                    return;
                }


                /*
                 * ------------------------------------------------
                 * Synchronous duplicate protection
                 * ------------------------------------------------
                 */

                if (
                    submissionInProgressRef.current
                ) {

                    console.warn(
                        "[Interview] Submission already in progress. Ignoring duplicate submission."
                    );


                    return;
                }


                /*
                 * ------------------------------------------------
                 * Same turn already submitted
                 * ------------------------------------------------
                 */

                if (
                    submittedTurnIdsRef.current.has(
                        currentTurnId
                    )
                ) {

                    console.warn(
                        "[Interview] This turn has already been submitted. Ignoring duplicate submission:",
                        currentTurnId
                    );


                    return;
                }


                /*
                 * ------------------------------------------------
                 * Lock IMMEDIATELY
                 *
                 * This must happen before the first await.
                 * ------------------------------------------------
                 */

                submissionInProgressRef.current =
                    true;


                /*
                 * Mark this turn immediately.
                 *
                 * Even if React re-renders or another callback fires,
                 * the same turn ID can no longer be submitted.
                 */

                submittedTurnIdsRef.current.add(
                    currentTurnId
                );


                /*
                 * ------------------------------------------------
                 * Debug
                 * ------------------------------------------------
                 */

                console.log(
                    "[Interview] submitTurn called:",
                    {
                        sessionId,

                        turnId:
                            currentTurnId,

                        answer:
                            trimmed,

                        inputMode,
                    }
                );


                setIsSubmitting(
                    true
                );


                setError(
                    null
                );


                try {

                    /*
                     * ------------------------------------------------
                     * Send exact turn ID to backend
                     * ------------------------------------------------
                     */

                    console.log(
                        "[Interview] Sending turn to backend:",
                        {
                            sessionId,

                            turnId:
                                currentTurnId,

                            answer:
                                trimmed,

                            inputMode,
                        }
                    );


                    const response =
                        await interviewApi.submitTurn(
                            sessionId,
                            {
                                turnId:
                                    currentTurnId,

                                answer:
                                    trimmed,

                                inputMode,
                            }
                        );


                    console.log(
                        "[Interview] Turn response:",
                        response
                    );


                    const result =
                        response.data;


                    /*
                     * ------------------------------------------------
                     * Inspect engine result
                     * ------------------------------------------------
                     */

                    console.log(
                        "[Interview] Engine result:",
                        {
                            interviewCompleted:
                                result.interviewCompleted,

                            nextQuestion:
                                result.nextQuestion,

                            nextTurnId:
                                result.nextTurnId,

                            progress:
                                result.progress,

                            evaluation:
                                result.evaluation,

                            assessment:
                                result.assessment,

                            decision:
                                result.decision,
                        }
                    );


                    /*
                     * ------------------------------------------------
                     * Interview completed
                     * ------------------------------------------------
                     */

                    if (
                        result.interviewCompleted
                    ) {

                        console.log(
                            "[Interview] Interview completed."
                        );


                        setIsCompleted(
                            true
                        );


                        setQuestion(
                            null
                        );


                        /*
                         * The current turn is permanently complete.
                         * Keep it in submittedTurnIdsRef.
                         */


                        return result;
                    }


                    /*
                     * ------------------------------------------------
                     * Continue to next question
                     * ------------------------------------------------
                     */

                    if (
                        result.nextQuestion &&
                        result.nextTurnId
                    ) {

                        console.log(
                            "[Interview] Setting next question:",
                            result.nextQuestion
                        );


                        console.log(
                            "[Interview] Setting next turn:",
                            result.nextTurnId
                        );


                        setQuestion(
                            result.nextQuestion
                        );


                        setTurnId(
                            result.nextTurnId
                        );


                    } else {

                        console.warn(
                            "[Interview] Backend did not return both nextQuestion and nextTurnId.",
                            {
                                nextQuestion:
                                    result.nextQuestion,

                                nextTurnId:
                                    result.nextTurnId,
                            }
                        );


                        /*
                         * Do NOT reuse the old turn.
                         *
                         * The old turn is already marked as submitted.
                         */


                        setError(
                            "The interview did not return the next question correctly."
                        );
                    }


                    return result;

                } catch (
                    error
                ) {

                    console.error(
                        "[Interview] Turn failed:",
                        error
                    );


                    /*
                     * IMPORTANT:
                     *
                     * We intentionally KEEP the turn ID in
                     * submittedTurnIdsRef.
                     *
                     * If the backend already processed the turn
                     * but the HTTP response was lost, retrying it
                     * would cause:
                     *
                     * "Conversation turn ... has already been processed."
                     *
                     * Keeping it marked prevents that duplicate.
                     */

                    setError(
                        "Unable to process your answer. Please try again."
                    );


                    throw error;

                } finally {

                    submissionInProgressRef.current =
                        false;


                    setIsSubmitting(
                        false
                    );


                    console.log(
                        "[Interview] Turn submission finished."
                    );
                }

            },
            [
                sessionId,
                turnId,
            ]
        );


    /*
     * ============================================================
     * End Interview
     * ============================================================
     */

    const endInterview =
        useCallback(
            async () => {

                console.log(
                    "[Interview] Ending interview:",
                    sessionId
                );


                setError(
                    null
                );


                try {

                    await interviewApi.end(
                        sessionId
                    );


                    console.log(
                        "[Interview] Interview ended successfully."
                    );


                    setIsCompleted(
                        true
                    );


                    setQuestion(
                        null
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "[Interview] Ending interview failed:",
                        error
                    );


                    setError(
                        "Unable to end the interview."
                    );


                    throw error;
                }

            },
            [
                sessionId,
            ]
        );


    /*
     * ============================================================
     * Return
     * ============================================================
     */

    return {

        sessionId,

        question,

        turnId,

        isSubmitting,

        isCompleted,

        error,

        submitTurn,

        endInterview,
    };
}