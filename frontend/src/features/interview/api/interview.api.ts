import api from "@/lib/axios";


/*
|--------------------------------------------------------------------------
| Interview Modes
|--------------------------------------------------------------------------
*/

export type InterviewMode =
    | "VOICE"
    | "VIDEO";


export type InterviewInputMode =
    | "TEXT"
    | "VOICE"
    | "VIDEO";


/*
|--------------------------------------------------------------------------
| Interview Question
|--------------------------------------------------------------------------
*/

export interface InterviewQuestion {

    question: string;

    claimId?: string;

    reasoning?: string;

    expectedTopics?: string[];
}


/*
|--------------------------------------------------------------------------
| Interview Session
|--------------------------------------------------------------------------
*/

export interface InterviewSession {

    id: string;

    resumeId: string;

    candidateProfileId: string;

    status:
        | "PENDING"
        | "ACTIVE"
        | "PAUSED"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED";

    startedAt?: string | null;

    completedAt?: string | null;
}


/*
|--------------------------------------------------------------------------
| Start Interview
|--------------------------------------------------------------------------
*/

export interface StartInterviewRequest {

    resumeId: string;

    targetRole: string;

    durationMinutes: number;

    interviewType: string;

    language: string;
}


export interface StartInterviewResponse {

    success: boolean;

    data: {

        session:
            InterviewSession;

        question:
            InterviewQuestion;

        /*
         * Exact database ConversationTurn created
         * for the first question.
         */
        turnId:
            string;
    };
}


/*
|--------------------------------------------------------------------------
| Submit Interview Turn
|--------------------------------------------------------------------------
*/

export interface SubmitTurnRequest {

    /*
     * Exact ConversationTurn being answered.
     */
    turnId:
        string;

    answer:
        string;

    inputMode?:
        | "TEXT"
        | "VOICE"
        | "VIDEO";

    /*
     * Legacy/optional metadata.
     */
    questionId?:
        string;

    transcriptId?:
        string;

    startedAt?:
        string;

    endedAt?:
        string;
}


/*
|--------------------------------------------------------------------------
| Submit Interview Turn Response
|--------------------------------------------------------------------------
*/

export interface SubmitTurnResponse {

    success:
        boolean;

    data: {

        evaluation:
            unknown;

        assessment:
            unknown;

        decision:
            unknown;

        /*
         * Question generated for the next turn.
         */
        nextQuestion?:
            InterviewQuestion;

        /*
         * Exact ConversationTurn created for nextQuestion.
         */
        nextTurnId?:
            string;

        interviewCompleted:
            boolean;

        progress:
            unknown;

        inputMode:
            | "TEXT"
            | "VOICE"
            | "VIDEO";

        questionId:
            string | null;

        transcriptId:
            string | null;

        startedAt:
            string | null;

        endedAt:
            string | null;
    };
}


/*
|--------------------------------------------------------------------------
| Interview API
|--------------------------------------------------------------------------
*/

export const interviewApi = {


    /*
     * ================================================================
     * Start Interview
     * ================================================================
     */

    async start(
        data: StartInterviewRequest
    ): Promise<StartInterviewResponse> {

        console.log(
            "[Interview API] start() payload:",
            data
        );


        /*
         * Fail immediately if resumeId is missing.
         */

        if (
            !data.resumeId ||
            typeof data.resumeId !== "string"
        ) {

            throw new Error(
                "Cannot start interview: resumeId is missing."
            );
        }


        const response =
            await api.post<StartInterviewResponse>(
                "/interviews",
                data,
                {
                    /*
                     * Interview creation currently performs
                     * multiple AI operations synchronously.
                     */

                    timeout:
                        120_000,
                }
            );


        console.log(
            "[Interview API] start() response:",
            response.data
        );


        return response.data;
    },


    /*
     * ================================================================
     * Submit Interview Turn
     * ================================================================
     */

    async submitTurn(
        sessionId: string,
        data: SubmitTurnRequest
    ): Promise<SubmitTurnResponse> {

        console.log(
            "[Interview API] submitTurn() payload:",
            {
                sessionId,
                ...data,
            }
        );


        /*
         * Fail early if the exact turn ID is missing.
         */

        if (
            !data.turnId ||
            typeof data.turnId !== "string"
        ) {

            throw new Error(
                "Cannot submit interview turn: turnId is missing."
            );
        }


        const response =
            await api.post<SubmitTurnResponse>(
                `/interviews/${sessionId}/turns`,
                data,
                {
                    /*
                     * Evaluation/reasoning can involve multiple
                     * AI operations.
                     */

                    timeout:
                        60_000,
                }
            );


        console.log(
            "[Interview API] submitTurn() response:",
            response.data
        );


        return response.data;
    },


    /*
     * ================================================================
     * Get Interview Session
     * ================================================================
     */

    async getSession(
        sessionId: string
    ) {

        const response =
            await api.get(
                `/interviews/${sessionId}`,
                {
                    timeout:
                        10_000,
                }
            );


        return response.data;
    },


    /*
     * ================================================================
     * End Interview
     * ================================================================
     */

    async end(
        sessionId: string
    ) {

        const response =
            await api.post(
                `/interviews/${sessionId}/end`,
                undefined,
                {
                    timeout:
                        10_000,
                }
            );


        return response.data;
    },
};