export interface StartInterviewDto {

    sessionId: string;
}


export interface SubmitAnswerDto {

    sessionId: string;

    /*
     * Exact ConversationTurn being answered.
     */
    turnId: string;

    answer: string;
}