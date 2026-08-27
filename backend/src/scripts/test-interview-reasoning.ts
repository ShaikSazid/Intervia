import {
    generateInterviewReasoning,
} from "../modules/interview-reasoning/reasoning.agent.js";


import {
    InterviewContext,
} from "../modules/interview-context/interview-context.types.js";

import {
    AnswerEvaluation,
} from "../modules/answer-evaluation/answer-evaluation.types.js";

import {
    InterviewDecision,
} from "../modules/interview-brain/brain/interview-decision.types.js";

import {
    InterviewDecisionType,
} from "../modules/interview-brain/brain/interview-decision.enums.js";

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
    InterviewReasoning,
} from "../modules/interview-reasoning/reasoning.types.js";


/*
 * ============================================================
 * 1. Current Resume Claim
 * ============================================================
 */

const claim:
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
        "Built a full-stack platform with REST APIs, JWT authentication, MongoDB, and Cloudinary.",

    relatedSkillNames:
        [
            "Node.js",
            "Express.js",
            "MongoDB",
        ],

    dateRange:
        null,
};


/*
 * ============================================================
 * 2. Current Claim Assessment
 * ============================================================
 */

const assessment:
    ClaimAssessment = {

    claimId:
        claim.id,

    verificationStatus:
        ClaimVerificationStatus.QUESTIONABLE,

    confidence:
        0.40,

    evidenceTurnIds:
        [
            "turn_1",
        ],

    evidence:
        [],

    needsFollowUp:
        true,
};


/*
 * ============================================================
 * 3. Base Interview Context
 * ============================================================
 *
 * This fixture is intentionally centered on one claim so that
 * we can clearly observe how the reasoning changes according
 * to the Brain decision.
 *
 * ============================================================
 */

const baseInterviewContext =
    {

    candidateProfile: {

        identity: {

            fullName:
                "SHAIK SAZID",

            primaryTitle:
                "Backend / Full Stack Developer",

            headline:
                "Backend / Full Stack Developer",

            executiveSummary:
                "Full-stack developer with experience in Node.js, Express.js, React, MongoDB and PostgreSQL.",

            perceivedSeniorityLevel:
                "ENTRY",

            estimatedYearsOfExperience:
                null,

            contactChannels:
                [],

            onlinePresences:
                [],
        },

        skills:
            [],

        workExperiences:
            [],

        education:
            [],

        projects:
            [],
    },


    interviewConfiguration: {

        targetRole:
            "Backend Developer",

        interviewType:
            "TECHNICAL",

        durationMinutes:
            30,

        language:
            "English",
    },


    interviewPlan: {

        stages:
            [],

        claimRelationships:
            [],

        totalQuestions:
            6,

        estimatedDurationMinutes:
            30,
    },


    currentStage: {

        id:
            "stage_mycakepage_backend",

        topic:
            "MYCAKEPAGE Backend Engineering",

        primaryClaimType:
            "PROJECT",

        investigationMode:
            "CLAIM_BASED",

        priority:
            "CRITICAL",

        difficulty:
            "MEDIUM",

        objectives:
            [
                "Assess backend ownership.",
                "Assess implementation.",
                "Assess database understanding.",
            ],

        investigationGoal:
            "Determine whether the candidate genuinely worked on the MYCAKEPAGE backend.",

        investigationDimensions:
            [
                "OWNERSHIP",
                "IMPLEMENTATION",
                "API",
                "DATABASE",
            ],

        claims:
            [
                {
                    claimId:
                        claim.id,

                    role:
                        "PRIMARY",
                },
            ],

        estimatedQuestions:
            6,

        adaptive:
            true,
    },


    sessionProgress: {

        currentStageIndex:
            0,

        currentQuestionIndex:
            1,

        completedQuestions:
            1,

        totalQuestions:
            6,

        candidateModel: {

            claims:
                [
                    claim,
                ],

            claimAssessments:
                [
                    assessment,
                ],
        },

        interviewState: {

            currentStage:
                "stage_mycakepage_backend",

            currentClaimId:
                claim.id,

            remainingClaimIds:
                [],

            pendingFollowUpClaimIds:
                [],

            completedClaimIds:
                [],

            claimProgress:
                [
                    {
                        claimId:
                            claim.id,

                        questionCount:
                            1,

                        weakAnswerCount:
                            1,

                        followUpCount:
                            1,

                        probeCount:
                            0,

                        investigatedAreas:
                            [
                                "OWNERSHIP",
                            ],
                    },
                ],

            investigationAttempts:
                [
                    {
                        turnId:
                            "turn_1",

                        claimId:
                            claim.id,

                        investigationArea:
                            "OWNERSHIP",

                        objective:
                            "Determine what the candidate personally implemented in the MYCAKEPAGE backend.",

                        question:
                            "What did you personally implement in the MYCAKEPAGE backend?",

                        outcome:
                            "NO_ANSWER",
                    },
                ],

            conversationState: {

                mode:
                    "GUIDED_RECOVERY",

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
                    1,

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
                        "I don't know.",
                    ],

                unresolvedContradictions:
                    [],

                candidateFrustrated:
                    false,
            },
        },
    },


    resumeContext:
        `
MYCAKEPAGE:

Developed a full-stack platform with RESTful APIs.

Used Node.js and Express.js.

Used MongoDB.

Implemented JWT authentication.

Implemented Cloudinary image uploads.

Built APIs for categories, flavours, cakes and pricing.
`,

    conversationHistory:
        [
            {
                sequenceNumber:
                    1,

                question:
                    "What did you personally implement in the MYCAKEPAGE backend?",

                answer:
                    "I don't know.",

                score:
                    0,

                feedback:
                    "Candidate did not provide evidence of backend ownership.",
            },
        ],
} as unknown as InterviewContext;


/*
 * ============================================================
 * 4. Evaluation Factory
 * ============================================================
 */

const createEvaluation = (
    behavior:
        AnswerEvaluation["answerBehavior"],
): AnswerEvaluation => {

    switch (behavior) {

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
                    "Candidate explicitly stated that they do not know.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior:
                    "NO_ANSWER",
            };


        case "DONT_REMEMBER":

            return {

                score:
                    2,

                strengths:
                    [],

                weaknesses:
                    [
                        "Candidate could not recall the implementation detail.",
                    ],

                feedback:
                    "Candidate indicated that they do not remember.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior:
                    "DONT_REMEMBER",
            };


        case "OFF_TOPIC":

            return {

                score:
                    0,

                strengths:
                    [],

                weaknesses:
                    [
                        "Answer was unrelated to the current investigation.",
                    ],

                feedback:
                    "Candidate answered a different topic.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior:
                    "OFF_TOPIC",
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
                    "Candidate objected to the current questioning.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior:
                    "FRUSTRATED",
            };


        case "CONTRADICTORY":

            return {

                score:
                    4,

                strengths:
                    [],

                weaknesses:
                    [
                        "Current answer conflicts with previous information.",
                    ],

                feedback:
                    "Candidate provided contradictory information.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior:
                    "CONTRADICTORY",
            };


        case "PARTIAL":

            return {

                score:
                    6,

                strengths:
                    [
                        "Candidate provided relevant evidence.",
                    ],

                weaknesses:
                    [
                        "Important detail remains unclear.",
                    ],

                feedback:
                    "Candidate provided a partially complete answer.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "MEDIUM",

                answerBehavior:
                    "PARTIAL",
            };


        case "STRONG":

            return {

                score:
                    9,

                strengths:
                    [
                        "Candidate demonstrated strong understanding.",
                    ],

                weaknesses:
                    [],

                feedback:
                    "Candidate provided a strong technical answer.",

                followUpRequired:
                    false,

                suggestedDifficulty:
                    "HARD",

                answerBehavior:
                    "STRONG",
            };


        case "WEAK":

            return {

                score:
                    4,

                strengths:
                    [],

                weaknesses:
                    [
                        "Candidate provided insufficient technical evidence.",
                    ],

                feedback:
                    "Candidate attempted the question but the answer was weak.",

                followUpRequired:
                    true,

                suggestedDifficulty:
                    "EASY",

                answerBehavior:
                    "WEAK",
            };


        default: {

            const exhaustiveCheck:
                never =
                behavior;

            throw new Error(
                `Unsupported answer behavior: ${exhaustiveCheck}`
            );
        }
    }
};


/*
 * ============================================================
 * 5. Decision Factory
 * ============================================================
 */

const createDecision = (
    type:
        InterviewDecisionType,
): InterviewDecision => {

    return {

        type,

        claimId:
            claim.id,

        reason:
            `Testing ${type} behavior.`,
    };
};


/*
 * ============================================================
 * 6. Test Case
 * ============================================================
 */

interface ReasoningTestCase {

    name:
        string;

    decision:
        InterviewDecisionType;

    answerBehavior:
        AnswerEvaluation["answerBehavior"];

    answer:
        string;
}


/*
 * ============================================================
 * 7. Test Cases
 * ============================================================
 */

const testCases:
    ReasoningTestCase[] = [

    {
        name:
            "Recover from NO_ANSWER",

        decision:
            InterviewDecisionType.RECOVER_CONVERSATION,

        answerBehavior:
            "NO_ANSWER",

        answer:
            "I don't know.",
    },


    {
        name:
            "Recover from DONT_REMEMBER",

        decision:
            InterviewDecisionType.RECOVER_CONVERSATION,

        answerBehavior:
            "DONT_REMEMBER",

        answer:
            "I don't remember exactly how I implemented that.",
    },


    {
        name:
            "Change angle after OFF_TOPIC",

        decision:
            InterviewDecisionType.CHANGE_ANGLE,

        answerBehavior:
            "OFF_TOPIC",

        answer:
            "I used React and Redux for the frontend.",
    },


    {
        name:
            "Clarify contradiction",

        decision:
            InterviewDecisionType.CLARIFY_CONTRADICTION,

        answerBehavior:
            "CONTRADICTORY",

        answer:
            "Earlier I said the category was embedded, but actually I used categoryId.",
    },


    {
        name:
            "Normal follow-up",

        decision:
            InterviewDecisionType.FOLLOW_UP,

        answerBehavior:
            "PARTIAL",

        answer:
            "I stored categoryId on the cake document.",
    },


    {
        name:
            "Deeper probe",

        decision:
            InterviewDecisionType.PROBE_CLAIM,

        answerBehavior:
            "STRONG",

        answer:
            "I stored the category ObjectId in categoryId and queried cakes by that reference.",
    },
];


/*
 * ============================================================
 * 8. Expected Reasoning Rules
 * ============================================================
 */

const validateReasoning = (
    testCase:
        ReasoningTestCase,

    reasoning:
        InterviewReasoning,
): string[] => {

    const failures:
        string[] = [];


    /*
     * ----------------------------------------------------------
     * All cases must stay on the current claim except transition
     * decisions, which we are not testing here.
     * ----------------------------------------------------------
     */

    if (
        !reasoning.stayOnCurrentTopic
    ) {

        failures.push(
            "Reasoning should stay on the current conversational topic."
        );
    }


    /*
     * ----------------------------------------------------------
     * RECOVER_CONVERSATION
     * ----------------------------------------------------------
     */

    if (
        testCase.decision ===
        InterviewDecisionType.RECOVER_CONVERSATION
    ) {

        if (
            reasoning.increaseDifficulty
        ) {

            failures.push(
                "RECOVER_CONVERSATION should not increase difficulty."
            );
        }


        if (
            reasoning.questionType !==
            "FOLLOW_UP"
        ) {

            failures.push(
                "RECOVER_CONVERSATION must use FOLLOW_UP question type."
            );
        }
    }


    /*
     * ----------------------------------------------------------
     * CHANGE_ANGLE
     * ----------------------------------------------------------
     */

    if (
        testCase.decision ===
        InterviewDecisionType.CHANGE_ANGLE
    ) {

        if (
            reasoning.questionType !==
            "PROBE_CLAIM"
        ) {

            failures.push(
                "CHANGE_ANGLE must use PROBE_CLAIM question type."
            );
        }
    }


    /*
     * ----------------------------------------------------------
     * CLARIFY_CONTRADICTION
     * ----------------------------------------------------------
     */

    if (
        testCase.decision ===
        InterviewDecisionType.CLARIFY_CONTRADICTION
    ) {

        if (
            reasoning.questionType !==
            "FOLLOW_UP"
        ) {

            failures.push(
                "CLARIFY_CONTRADICTION must use FOLLOW_UP question type."
            );
        }
    }


    /*
     * ----------------------------------------------------------
     * FOLLOW_UP
     * ----------------------------------------------------------
     */

    if (
        testCase.decision ===
        InterviewDecisionType.FOLLOW_UP
    ) {

        if (
            reasoning.questionType !==
            "FOLLOW_UP"
        ) {

            failures.push(
                "FOLLOW_UP must use FOLLOW_UP question type."
            );
        }
    }


    /*
     * ----------------------------------------------------------
     * PROBE_CLAIM
     * ----------------------------------------------------------
     */

    if (
        testCase.decision ===
        InterviewDecisionType.PROBE_CLAIM
    ) {

        if (
            reasoning.questionType !==
            "PROBE_CLAIM"
        ) {

            failures.push(
                "PROBE_CLAIM must use PROBE_CLAIM question type."
            );
        }
    }


    /*
     * ----------------------------------------------------------
     * Investigation Area
     * ----------------------------------------------------------
     */

    if (
        !reasoning.investigationArea
    ) {

        failures.push(
            "Reasoning must provide an investigation area."
        );
    }


    /*
     * ----------------------------------------------------------
     * Objective
     * ----------------------------------------------------------
     */

    if (
        !reasoning.objective ||
        reasoning.objective.trim().length === 0
    ) {

        failures.push(
            "Reasoning must provide an objective."
        );
    }


    return failures;
};


/*
 * ============================================================
 * 9. Run Test Case
 * ============================================================
 */

const runTest = async (
    testCase:
        ReasoningTestCase,
): Promise<boolean> => {

    console.log(
        "\n========================================"
    );

    console.log(
        `TEST: ${testCase.name}`
    );

    console.log(
        "========================================"
    );

    console.log(
        "Brain Decision:",
        testCase.decision
    );

    console.log(
        "Answer Behavior:",
        testCase.answerBehavior
    );

    console.log(
        "Candidate Answer:",
        testCase.answer
    );


    const evaluation =
        createEvaluation(
            testCase.answerBehavior
        );


    const decision =
        createDecision(
            testCase.decision
        );


    const context:
    InterviewContext = {
    ...baseInterviewContext,

    conversationHistory: [
        {
            sequenceNumber: 1,
            question:
                "What did you personally implement in the MYCAKEPAGE backend?",
            answer:
                testCase.answer,
            score:
                evaluation.score,
            feedback:
                evaluation.feedback,
        },
    ],
};


    try {

        console.log(
            "\nCalling Gemini reasoning agent...\n"
        );


        const reasoning =
            await generateInterviewReasoning({

                interviewContext:
                    context,

                evaluation,

                decision,

                claim,

                assessment,
            });


        console.log(
            "Reasoning Result:"
        );


        console.log(
            JSON.stringify(
                reasoning,
                null,
                2
            )
        );


        const failures =
            validateReasoning(
                testCase,
                reasoning
            );


        if (
            failures.length === 0
        ) {

            console.log(
                "\nResult: PASS"
            );

            return true;
        }


        console.log(
            "\nResult: FAIL"
        );


        for (
            const failure
            of failures
        ) {

            console.log(
                `- ${failure}`
            );
        }


        return false;

    } catch (error) {

        console.error(
            "\nReasoning test failed:"
        );

        console.error(
            error
        );

        return false;
    }
};


/*
 * ============================================================
 * 10. Run All Tests
 * ============================================================
 */

let passed =
    0;


for (
    const testCase
    of testCases
) {

    const success =
        await runTest(
            testCase
        );


    if (
        success
    ) {

        passed++;
    }
}


/*
 * ============================================================
 * 11. Summary
 * ============================================================
 */

console.log(
    "\n========================================"
);

console.log(
    "   INTERVIEW REASONING TEST SUMMARY"
);

console.log(
    "========================================"
);

console.log(
    `Passed: ${passed}/${testCases.length}`
);

console.log(
    `Failed: ${testCases.length - passed}/${testCases.length}`
);

console.log(
    "========================================\n"
);


if (
    passed !==
    testCases.length
) {

    process.exit(1);
}