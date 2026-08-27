import {
    ConversationTurnStatus,
} from "../../generated/prisma/enums.js";

import * as conversationTurnRepository
    from "./conversation-turn.repository.js";

import {
    CreateConversationTurnDto,
} from "./conversation-turn.dto.js";

import {
    AnswerEvaluation,
} from "../answer-evaluation/answer-evaluation.types.js";


export const createConversationTurn =
    async (
        data: CreateConversationTurnDto
    ) => {

        return conversationTurnRepository
            .createConversationTurn(
                data
            );
    };


export const getConversationHistory =
    async (
        interviewSessionId: string
    ) => {

        return conversationTurnRepository
            .findConversationTurnsBySessionId(
                interviewSessionId
            );
    };


export const getConversation =
    async (
        turnId: string
    ) => {

        return conversationTurnRepository
            .findConversationTurnById(
                turnId
            );
    };


/*
|--------------------------------------------------------------------------
| Get Exact Conversation Turn
|--------------------------------------------------------------------------
*/

export const getConversationTurnById =
    async (
        turnId: string
    ) => {

        return conversationTurnRepository
            .findConversationTurnById(
                turnId
            );
    };


/*
|--------------------------------------------------------------------------
| Submit Answer
|--------------------------------------------------------------------------
*/

export const submitAnswer =
    async (
        turnId: string,
        answer: string
    ) => {

        return conversationTurnRepository
            .updateConversationTurn(
                turnId,
                {
                    answer,

                    status:
                        ConversationTurnStatus.ANSWERED,

                    answeredAt:
                        new Date(),
                }
            );
    };


/*
|--------------------------------------------------------------------------
| Save Evaluation
|--------------------------------------------------------------------------
*/

export const saveEvaluation =
    async (
        turnId: string,
        evaluation: AnswerEvaluation
    ) => {

        return conversationTurnRepository
            .updateConversationTurn(
                turnId,
                {
                    evaluation,

                    status:
                        ConversationTurnStatus.EVALUATED,

                    evaluatedAt:
                        new Date(),
                }
            );
    };


/*
|--------------------------------------------------------------------------
| Legacy Pending Lookup
|--------------------------------------------------------------------------
|
| Keep this temporarily because other code may still use it.
| The Interview Engine will no longer depend on it for answering.
|
*/

export const getPendingConversationTurn =
    async (
        interviewSessionId: string
    ) => {

        return conversationTurnRepository
            .findPendingConversationTurn(
                interviewSessionId
            );
    };