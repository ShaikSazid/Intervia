import {
    decideNextAction,
} from "../modules/interview-brain/brain/interview-brain.service.js";

import {
    InterviewBrainContext,
} from "../modules/interview-brain/brain/interview-brain.types.js";

import {
    InterviewDecisionType,
} from "../modules/interview-brain/brain/interview-decision.enums.js";

import {
    AnswerEvaluation,
    AnswerBehavior,
} from "../modules/answer-evaluation/answer-evaluation.types.js";

import {
    ResumeClaim,
} from "../modules/interview-brain/claims/resume-claim.types.js";

import {
    ResumeClaimType,
} from "../modules/interview-brain/claims/resume-claim.enums.js";

import {
    ClaimAssessment,
} from "../modules/interview-brain/claims/claim-assessment.types.js";

import {
    ClaimVerificationStatus,
} from "../modules/interview-brain/claims/claim-assessment.enums.js";

import {
    CandidateModel,
} from "../modules/interview-brain/candidate/candidate-model.types.js";

import {
    InterviewState,
} from "../modules/interview-brain/state/interview-state.types.js";

import {
    InterviewStage,
} from "../modules/interview-planner/planner.types.js";

import {
    InterviewDifficulty,
} from "../modules/interview/interview.enums.js";


/*
 * ============================================================
 * Claims
 * ============================================================
 */

const myCakePageClaim:
    ResumeClaim = {

    id:
        "project_mycakepage",

    title:
        "MYCAKEPAGE",

    type:
        ResumeClaimType.PROJECT,

    sourceSection:
        "PROJECTS",

    description:
        "Built a full-stack cake platform with REST APIs, authentication, MongoDB, and Cloudinary.",

    relatedSkillNames:
        [
            "Node.js",
            "Express.js",
            "MongoDB",
        ],

    dateRange:
        null,
};


const chatterBoxClaim:
    ResumeClaim = {

    id:
        "project_chatterbox",

    title:
        "CHATTERBOX",

    type:
        ResumeClaimType.PROJECT,

    sourceSection:
        "PROJECTS",

    description:
        "Built an AI chat application using React, Node.js, MongoDB, and Google Gemini.",

    relatedSkillNames:
        [
            "React",
            "Node.js",
            "MongoDB",
        ],

    dateRange:
        null,
};


/*
 * ============================================================
 * Claim Assessments
 * ============================================================
 */

const myCakePageAssessment:
    ClaimAssessment = {

    claimId:
        myCakePageClaim.id,

    verificationStatus:
        ClaimVerificationStatus.QUESTIONABLE,

    confidence:
        0.20,

    evidenceTurnIds:
        [],

    evidence:
        [],

    needsFollowUp:
        true,
};


const chatterBoxAssessment:
    ClaimAssessment = {

    claimId:
        chatterBoxClaim.id,

    verificationStatus:
        ClaimVerificationStatus.QUESTIONABLE,

    confidence:
        0.10,

    evidenceTurnIds:
        [],

    evidence:
        [],

    needsFollowUp:
        true,
};


/*
 * ============================================================
 * Candidate Model
 * ============================================================
 */

const candidateModel:
    CandidateModel = {

    claims:
        [
            myCakePageClaim,
            chatterBoxClaim,
        ],

    claimAssessments:
        [
            myCakePageAssessment,
            chatterBoxAssessment,
        ],
};


/*
 * ============================================================
 * Interview Stage
 * ============================================================
 */

const currentStage:
    InterviewStage = {

    id:
        "stage_mycakepage_backend",

    topic:
        "MYCAKEPAGE Backend Engineering",

    primaryClaimType:
        ResumeClaimType.PROJECT,

    investigationMode:
        "CLAIM_BASED",

    priority:
        "CRITICAL",

    difficulty:
        InterviewDifficulty.MEDIUM,

    objectives:
        [
            "Assess backend ownership.",
            "Assess API implementation.",
            "Assess database understanding.",
        ],

    investigationGoal:
        "Determine whether the candidate genuinely implemented the MYCAKEPAGE backend.",

    investigationDimensions:
        [
            "OWNERSHIP",
            "IMPLEMENTATION",
            "API_DESIGN",
            "DATABASE",
        ],

    claims:
        [
            {
                claimId:
                    myCakePageClaim.id,

                role:
                    "PRIMARY",
            },

            {
                claimId:
                    chatterBoxClaim.id,

                role:
                    "CONTEXTUAL",
            },
        ],

    estimatedQuestions:
        6,

    adaptive:
        true,
};


/*
 * ============================================================
 * Base Interview State
 * ============================================================
 */

const createInterviewState = (
    answerBehavior:
        AnswerBehavior
): InterviewState => {

    const weakAnswerCount =
        answerBehavior === "NO_ANSWER" ||
        answerBehavior === "DONT_REMEMBER" ||
        answerBehavior === "OFF_TOPIC" ||
        answerBehavior === "WEAK"
            ? 1
            : 0;


    const candidateFrustrated =
        answerBehavior ===
        "FRUSTRATED";


    const conversationMode =
        answerBehavior === "STRONG" ||
        answerBehavior === "PARTIAL"

            ? "CLAIM_INVESTIGATION"

            : "GUIDED_RECOVERY";


    const threadStatus =
        candidateFrustrated
            ? "BLOCKED"
            : "OPEN";


    return {

        currentStage:
            currentStage.id,

        currentClaimId:
            myCakePageClaim.id,

        remainingClaimIds:
            [
                chatterBoxClaim.id,
            ],

        pendingFollowUpClaimIds:
            [],

        completedClaimIds:
            [],

        claimProgress:
            [
                {
                    claimId:
                        myCakePageClaim.id,

                    questionCount:
                        1,

                    weakAnswerCount:
                        weakAnswerCount,

                    followUpCount:
                        1,

                    probeCount:
                        0,

                    investigatedAreas:
                        [
                            "OWNERSHIP",
                        ],
                },

                {
                    claimId:
                        chatterBoxClaim.id,

                    questionCount:
                        0,

                    weakAnswerCount:
                        0,

                    followUpCount:
                        0,

                    probeCount:
                        0,

                    investigatedAreas:
                        [],
                },
            ],

        investigationAttempts:
            [],

        conversationState: {

            mode:
                conversationMode,

            currentThread:
                "MYCAKEPAGE backend ownership",

            threadStatus,

            demonstratedEvidence:
                [],

            missingEvidence:
                [
                    "Determine what the candidate personally implemented in the backend.",
                ],

            failedAttempts:
                weakAnswerCount,

            recentQuestionIds:
                [
                    "turn_1",
                ],

            recentQuestionTexts:
                [
                    "What did you personally implement in the MYCAKEPAGE backend?",
                ],

            recentAnswerTexts:
                [
                    "test answer",
                ],

            unresolvedContradictions:
                [],

            candidateFrustrated,
        },
    };
};


/*
 * ============================================================
 * Create Evaluation
 * ============================================================
 */

const createEvaluation = (
    answerBehavior:
        AnswerBehavior
): AnswerEvaluation => {

    switch (answerBehavior) {

        case "NO_ANSWER":

            return {

                score:
                    0,

                strengths:
                    [],

                weaknesses:
                    [
                        "Candidate did not provide an answer.",
                    ],

                feedback:
                    "Candidate explicitly indicated that they did not know.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior,
            };


        case "DONT_REMEMBER":

            return {

                score:
                    2,

                strengths:
                    [],

                weaknesses:
                    [
                        "Candidate could not recall the implementation.",
                    ],

                feedback:
                    "Candidate could not remember the specific detail.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior,
            };


        case "OFF_TOPIC":

            return {

                score:
                    0,

                strengths:
                    [],

                weaknesses:
                    [
                        "Answer was unrelated to the question.",
                    ],

                feedback:
                    "The response did not address the current topic.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior,
            };


        case "FRUSTRATED":

            return {

                score:
                    0,

                strengths:
                    [],

                weaknesses:
                    [
                        "Candidate expressed frustration.",
                    ],

                feedback:
                    "Candidate objected to the current line of questioning.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior,
            };


        case "CONTRADICTORY":

            return {

                score:
                    4,

                strengths:
                    [],

                weaknesses:
                    [
                        "Current answer conflicts with previous evidence.",
                    ],

                feedback:
                    "The candidate gave contradictory information.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior,
            };


        case "WEAK":

            return {

                score:
                    4,

                strengths:
                    [],
                
                weaknesses:
                    [
                        "The answer contains limited technical evidence.",
                    ],

                feedback:
                    "The candidate provided a weak but relevant answer.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior,
            };


        case "PARTIAL":

            return {

                score:
                    6,

                strengths:
                    [
                        "The answer contains relevant information.",
                    ],

                weaknesses:
                    [
                        "Some important details are missing.",
                    ],

                feedback:
                    "The candidate provided partially sufficient evidence.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "MEDIUM",

                answerBehavior,
            };


        case "STRONG":

            return {

                score:
                    9,

                strengths:
                    [
                        "The candidate demonstrated strong technical understanding.",
                    ],

                weaknesses:
                    [],

                feedback:
                    "The candidate provided a strong and relevant answer.",

                /*
                 * Deliberately false here.
                 *
                 * We want to test the Brain's confidence/evidence
                 * logic rather than force a FOLLOW_UP decision.
                 */

                followUpRequired:
                    false,

                suggestedDifficulty:
                    "HARD",

                answerBehavior,
            };


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
 * Claim Relationships
 * ============================================================
 */

const claimRelationships:
    InterviewBrainContext["claimRelationships"] = [];


/*
 * ============================================================
 * Build Brain Context
 * ============================================================
 */

const createContext = (
    answerBehavior:
        AnswerBehavior
): InterviewBrainContext => {

    const interviewState =
        createInterviewState(
            answerBehavior
        );


    const latestEvaluation =
        createEvaluation(
            answerBehavior
        );


    return {

        candidateModel,

        interviewState,

        latestEvaluation,

        currentStage,

        targetRole:
            "Backend Developer",

        claimRelationships,
    };
};


/*
 * ============================================================
 * Expected Decision
 * ============================================================
 */

const expectedDecision = (
    answerBehavior:
        AnswerBehavior
): string => {

    switch (answerBehavior) {

        case "NO_ANSWER":
            return "RECOVER_CONVERSATION";

        case "DONT_REMEMBER":
            return "RECOVER_CONVERSATION";

        case "OFF_TOPIC":
            return "CHANGE_ANGLE";

        case "FRUSTRATED":
            return "MOVE_TO_NEXT_CLAIM";

        case "CONTRADICTORY":
            return "CLARIFY_CONTRADICTION";

        case "WEAK":
            return "RECOVER_CONVERSATION";

        case "PARTIAL":
            return "FOLLOW_UP";

        case "STRONG":
            return "PROBE_CLAIM";

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
 * Run Test
 * ============================================================
 */

const runTest = (
    answerBehavior:
        AnswerBehavior
) => {

    const context =
        createContext(
            answerBehavior
        );


    const decision =
        decideNextAction(
            context
        );


    const expected =
        expectedDecision(
            answerBehavior
        );


    const actual =
        decision.type;


    const passed =
        actual ===
        expected;


    console.log(
        "\n========================================"
    );

    console.log(
        `TEST: ${answerBehavior}`
    );

    console.log(
        "========================================"
    );

    console.log(
        "Expected:",
        expected
    );

    console.log(
        "Actual:",
        actual
    );

    console.log(
        "Claim ID:",
        decision.claimId
    );

    console.log(
        "Reason:",
        decision.reason
    );

    console.log(
        "Result:",
        passed
            ? "PASS"
            : "FAIL"
    );


    return passed;
};


/*
 * ============================================================
 * Execute Tests
 * ============================================================
 */

const behaviors:
    AnswerBehavior[] = [

    "NO_ANSWER",

    "DONT_REMEMBER",

    "OFF_TOPIC",

    "FRUSTRATED",

    "CONTRADICTORY",

    "WEAK",

    "PARTIAL",

    "STRONG",
];


let passedTests =
    0;


for (
    const behavior
    of behaviors
) {

    if (
        runTest(
            behavior
        )
    ) {

        passedTests++;
    }
}


/*
 * ============================================================
 * Summary
 * ============================================================
 */

console.log(
    "\n========================================"
);

console.log(
    "      INTERVIEW BRAIN TEST SUMMARY"
);

console.log(
    "========================================"
);

console.log(
    `Passed: ${passedTests}/${behaviors.length}`
);

console.log(
    `Failed: ${behaviors.length - passedTests}/${behaviors.length}`
);

console.log(
    "========================================\n"
);


if (
    passedTests !==
    behaviors.length
) {

    process.exit(1);
}