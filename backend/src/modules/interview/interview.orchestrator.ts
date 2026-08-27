import {
    NotFoundError,
} from "../../errors/NotFoundError.js";

import {
    InterviewSessionStatus,
} from "../../generated/prisma/enums.js";

import {
    CreateInterviewDto,
} from "./interview.dto.js";

import * as interviewService
    from "./interview.service.js";

import * as interviewEngineService
    from "../interview-engine/interview-engine.service.js";

import * as interviewSessionRepository
    from "../interview-session/session.repository.js";


export type InterviewInputMode =
    | "TEXT"
    | "VOICE"
    | "VIDEO";


export interface SubmitInterviewTurnInput {

    sessionId: string;

    turnId: string;

    answer: string;

    inputMode?: InterviewInputMode;

    questionId?: string;

    startedAt?: string;

    endedAt?: string;

    transcriptId?: string;
}


/*
|--------------------------------------------------------------------------
| Start Interview Session
|--------------------------------------------------------------------------
|
| POST /api/interviews
|
| 1. Prepare the session.
| 2. Let the existing Interview Engine start the session.
| 3. Return the active session + first question.
|
| IMPORTANT:
|
| interviewEngineService.startInterview() already owns the
| PENDING -> ACTIVE transition.
|
*/

export const startInterviewSession = async (
    data: CreateInterviewDto
) => {

    const session =
        await interviewService.createInterview(
            data
        );


    const firstQuestion =
    await interviewEngineService.startInterview(
        session.id
    );


    const activeSession =
        await interviewSessionRepository
            .findInterviewSessionById(
                session.id
            );


    if (!activeSession) {
        throw new NotFoundError(
            `Interview session "${session.id}" was not found after starting.`
        );
    }


    return {
        session: activeSession,
        question: firstQuestion.question,
        turnId: firstQuestion.turnId
    };
};


/*
|--------------------------------------------------------------------------
| Submit Interview Turn
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/turns
|
| The Interview Engine owns the adaptive interview logic.
|
| This orchestrator owns the session lifecycle around it.
|
*/

export const submitInterviewTurn = async (
    input: SubmitInterviewTurnInput
) => {

    /*
     * ============================================================
     * 1. Validate Answer
     * ============================================================
     */

    if (
        typeof input.answer !== "string" ||
        input.answer.trim().length === 0
    ) {
        throw new Error(
            "Answer is required."
        );
    }


    /*
     * ============================================================
     * 2. Verify Session
     * ============================================================
     */

    const session =
        await interviewSessionRepository
            .findInterviewSessionById(
                input.sessionId
            );


    if (!session) {
        throw new NotFoundError(
            `Interview session "${input.sessionId}" was not found.`
        );
    }


    /*
     * ============================================================
     * 3. Verify Active Session
     * ============================================================
     */

    if (
        session.status !==
        InterviewSessionStatus.ACTIVE
    ) {
        throw new Error(
            `Interview session "${input.sessionId}" is not active.`
        );
    }


    /*
     * ============================================================
     * 4. Submit Answer To Existing Interview Engine
     * ============================================================
     */

    const result =
    await interviewEngineService.submitAnswer({

        sessionId:
            input.sessionId,

        turnId:
            input.turnId,

        answer:
            input.answer.trim(),
    });


    /*
     * ============================================================
     * 5. Persist Natural Interview Completion
     * ============================================================
     *
     * The Interview Engine decides whether the interview has
     * actually finished.
     *
     * If interviewCompleted === true:
     *
     * ACTIVE
     *   ↓
     * COMPLETED
     *
     * This is different from the user manually ending the session.
     */

    if (
        result.interviewCompleted === true
    ) {

        await interviewSessionRepository
            .updateInterviewSession(
                input.sessionId,
                {
                    status:
                        InterviewSessionStatus.COMPLETED,

                    completedAt:
                        new Date(),
                }
            );
    }


    /*
     * ============================================================
     * 6. Return Normalized Turn Response
     * ============================================================
     */

    return {
    ...result,

    inputMode:
        input.inputMode ?? "TEXT",

    questionId:
        input.questionId ?? null,

    transcriptId:
        input.transcriptId ?? null,

    startedAt:
        input.startedAt ?? null,

    endedAt:
        input.endedAt ?? null,
};
};


/*
|--------------------------------------------------------------------------
| Get Interview Session
|--------------------------------------------------------------------------
|
| GET /api/interviews/:sessionId
|
*/

export const getInterviewSession = async (
    sessionId: string
) => {

    const session =
        await interviewSessionRepository
            .findInterviewSessionById(
                sessionId
            );


    if (!session) {
        throw new NotFoundError(
            `Interview session "${sessionId}" was not found.`
        );
    }


    return session;
};


/*
|--------------------------------------------------------------------------
| End Interview Session
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/end
|
| This means the candidate explicitly stopped the interview.
|
| Therefore:
|
| ACTIVE -> CANCELLED
|
| It must NOT be marked COMPLETED.
|
*/

export const endInterviewSession = async (
    sessionId: string
) => {

    /*
     * ============================================================
     * 1. Find Session
     * ============================================================
     */

    const session =
        await interviewSessionRepository
            .findInterviewSessionById(
                sessionId
            );


    if (!session) {
        throw new NotFoundError(
            `Interview session "${sessionId}" was not found.`
        );
    }


    /*
     * ============================================================
     * 2. Idempotent Cancellation
     * ============================================================
     *
     * If already cancelled, simply return the stored session.
     */

    if (
        session.status ===
        InterviewSessionStatus.CANCELLED
    ) {
        return session;
    }


    /*
     * ============================================================
     * 3. Already Completed
     * ============================================================
     *
     * A completed interview should remain completed.
     */

    if (
        session.status ===
        InterviewSessionStatus.COMPLETED
    ) {
        return session;
    }


    /*
     * ============================================================
     * 4. Cannot Cancel A Failed Session
     * ============================================================
     */

    if (
        session.status ===
        InterviewSessionStatus.FAILED
    ) {
        throw new Error(
            `Interview session "${sessionId}" has already failed.`
        );
    }


    /*
     * ============================================================
     * 5. Persist Cancellation
     * ============================================================
     */

    const cancelledSession =
        await interviewSessionRepository
            .updateInterviewSession(
                sessionId,
                {
                    status:
                        InterviewSessionStatus.CANCELLED,

                    completedAt:
                        new Date(),
                }
            );


    return cancelledSession;
};