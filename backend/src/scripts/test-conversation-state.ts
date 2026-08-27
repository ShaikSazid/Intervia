import {
    updateConversationState,
} from "../modules/interview-brain/conversation/conversation-state.service.js";

import {
    ConversationState,
} from "../modules/interview-brain/conversation/conversation-state.types.js";

import {
    AnswerEvaluation,
} from "../modules/answer-evaluation/answer-evaluation.types.js";

import {
    InvestigationAttempt,
} from "../modules/interview-brain/candidate/investigation-attempt.types.js";


const initialState:
    ConversationState = {

    mode:
        "CLAIM_INVESTIGATION",

    currentThread:
        "MYCAKEPAGE backend ownership",

    threadStatus:
        "OPEN",

    demonstratedEvidence:
        [],

    missingEvidence:
        [
            "Determine what the candidate personally implemented in the backend.",
        ],

    failedAttempts:
        0,

    recentQuestionIds:
        [],

    recentQuestionTexts:
        [],

    recentAnswerTexts:
        [],

    unresolvedContradictions:
        [],

    candidateFrustrated:
        false,
};


const createEvaluation = (
    answerBehavior:
        AnswerEvaluation["answerBehavior"],

    score:
        number = 5
): AnswerEvaluation => ({

    score,

    strengths:
        [],

    weaknesses:
        [],

    feedback:
        `Test evaluation for ${answerBehavior}.`,

    followUpRequired:
        answerBehavior !== "STRONG",

    suggestedDifficulty:
        answerBehavior === "STRONG"
            ? "MEDIUM"
            : "EASY",

    answerBehavior,
});


const createAttempt = (
    outcome:
        InvestigationAttempt["outcome"] = "WEAK"
): InvestigationAttempt => ({

    turnId:
        "turn_test",

    claimId:
        "project_mycakepage",

    investigationArea:
        "OWNERSHIP",

    objective:
        "Determine what the candidate personally implemented in the backend.",

    question:
        "What did you personally implement in the MYCAKEPAGE backend?",

    outcome,
});


const runTest = (
    name: string,

    answer: string,

    evaluation: AnswerEvaluation,

    attemptOutcome:
        InvestigationAttempt["outcome"]
) => {

    const state =
        updateConversationState(

            initialState,

            {

                questionId:
                    "turn_test",

                question:
                    "What did you personally implement in the MYCAKEPAGE backend?",

                answer,

                evaluation,

                attempt:
                    createAttempt(
                        attemptOutcome
                    ),
            }
        );


    console.log(
        "\n========================================"
    );

    console.log(
        `TEST: ${name}`
    );

    console.log(
        "========================================"
    );

    console.log(
        "Answer:",
        answer
    );

    console.log(
        "Behavior:",
        evaluation.answerBehavior
    );

    console.log(
        "Mode:",
        state.mode
    );

    console.log(
        "Thread status:",
        state.threadStatus
    );

    console.log(
        "Failed attempts:",
        state.failedAttempts
    );

    console.log(
        "Candidate frustrated:",
        state.candidateFrustrated
    );

    console.log(
        "Demonstrated evidence:",
        state.demonstratedEvidence
    );

    console.log(
        "Missing evidence:",
        state.missingEvidence
    );
};


/*
 * ============================================================
 * 1. NO_ANSWER
 * ============================================================
 */

runTest(

    "NO ANSWER",

    "I don't know.",

    createEvaluation(
        "NO_ANSWER",
        0
    ),

    "NO_ANSWER"
);


/*
 * ============================================================
 * 2. DONT_REMEMBER
 * ============================================================
 */

runTest(

    "DONT REMEMBER",

    "I don't remember exactly.",

    createEvaluation(
        "DONT_REMEMBER",
        2
    ),

    "NO_ANSWER"
);


/*
 * ============================================================
 * 3. OFF_TOPIC
 * ============================================================
 */

runTest(

    "OFF TOPIC",

    "I used React and Redux for the frontend.",

    createEvaluation(
        "OFF_TOPIC",
        0
    ),

    "WEAK"
);


/*
 * ============================================================
 * 4. FRUSTRATED
 * ============================================================
 */

runTest(

    "FRUSTRATED",

    "Why do you keep asking me the same question?",

    createEvaluation(
        "FRUSTRATED",
        0
    ),

    "NO_ANSWER"
);


/*
 * ============================================================
 * 5. PARTIAL
 * ============================================================
 */

runTest(

    "PARTIAL",

    "I stored the category ID in the cake document.",

    createEvaluation(
        "PARTIAL",
        6
    ),

    "WEAK"
);


/*
 * ============================================================
 * 6. STRONG
 * ============================================================
 */

runTest(

    "STRONG",

    "I stored the category ObjectId in categoryId on the cake document and used that ID when querying cakes by category.",

    createEvaluation(
        "STRONG",
        9
    ),

    "ANSWERED"
);


/*
 * ============================================================
 * 7. CONTRADICTORY
 * ============================================================
 */

runTest(

    "CONTRADICTORY",

    "I stored the category ID directly in the cake document, although earlier I said I embedded the entire category document.",

    createEvaluation(
        "CONTRADICTORY",
        4
    ),

    "CONTRADICTORY"
);


/*
 * ============================================================
 * Finish
 * ============================================================
 */

console.log(
    "\n========================================"
);

console.log(
    "CONVERSATION STATE TESTS COMPLETED"
);

console.log(
    "========================================\n"
);