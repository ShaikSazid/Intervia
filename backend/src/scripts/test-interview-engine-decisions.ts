import {
    generateInterviewQuestion,
} from "../modules/interview-engine/interview-engine.agent.js";

import {
    InterviewType,
} from "../modules/interview/interview.enums.js";

import {
    GenerateQuestionInput,
} from "../modules/interview-engine/interview-engine.types.js";

import {
    InterviewContext,
} from "../modules/interview-context/interview-context.types.js";

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

import {
    InvestigationIntent,
} from "../modules/interview-brain/intent/investigation-intent.types.js";

import {
    InterviewState,
} from "../modules/interview-brain/state/interview-state.types.js";


/*
 * ============================================================
 * CLI Test Selection
 * ============================================================
 *
 * Usage:
 *
 *   npx tsx src/scripts/test-interview-engine-decisions.ts
 *
 *   npx tsx src/scripts/test-interview-engine-decisions.ts recover
 *
 *   npx tsx src/scripts/test-interview-engine-decisions.ts angle
 *
 *   npx tsx src/scripts/test-interview-engine-decisions.ts contradiction
 *
 * ============================================================
 */

const requestedTest =
    process.argv[2]?.trim().toLowerCase();


/*
 * ============================================================
 * 1. Resume Claim
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
        "Built a full-stack platform with RESTful APIs, JWT authentication, MongoDB, and Cloudinary.",

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
 * 2. Claim Assessment
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
 * 3. Current Interview Stage
 * ============================================================
 */

const currentStage = {

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
            "Assess REST API implementation.",
            "Assess database understanding.",
        ],

    investigationGoal:
        "Determine whether the candidate genuinely implemented the MYCAKEPAGE backend.",

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
};


/*
 * ============================================================
 * 4. Base Interview State
 * ============================================================
 */

const createInterviewState =
    (): InterviewState => {

        return {

            currentStage:
                currentStage.id,

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
                            2,

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
                        "Determine what the candidate personally implemented.",
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
        };
    };


/*
 * ============================================================
 * 5. Base Interview Context
 * ============================================================
 */

const createInterviewContext =
    (
        answer: string,
        score: number,
        feedback: string,
    ): InterviewContext => {

        return {

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
                    InterviewType.TECHNICAL,

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


            currentStage:
                currentStage as any,


            sessionProgress: {

                currentStageIndex:
                    0,

                currentQuestionIndex:
                    2,

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

                interviewState:
                    createInterviewState(),
            },


            resumeContext:
                `
MYCAKEPAGE:

Developed a full-stack platform for bakery owners.

Built RESTful APIs for categories, flavours, cakes and pricing.

Used Node.js and Express.js for backend development.

Used MongoDB for data storage.

Implemented JWT authentication.

Implemented Cloudinary image uploads.
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

                    {
                        sequenceNumber:
                            2,

                        question:
                            "Can you tell me what part of the backend you worked on?",

                        answer,

                        score,

                        feedback,
                    },
                ],
        };
    };


/*
 * ============================================================
 * 6. Reasoning Factory
 * ============================================================
 */

const createReasoning =
    (
        investigationArea:
            string,

        questionType:
            "FOLLOW_UP" | "PROBE_CLAIM",

        increaseDifficulty:
            boolean,

        objective:
            string,
    ): InterviewReasoning => {

        return {

            reasoning:
                objective,

            objective,

            investigationArea:
                investigationArea as any,

            questionType:
                questionType as any,

            stayOnCurrentTopic:
                true,

            increaseDifficulty,

            referenceResume:
                true,

            askImplementationQuestion:
                true,
        };
    };


/*
 * ============================================================
 * 7. Decision Factory
 * ============================================================
 */

const createDecision =
    (
        type:
            InterviewDecisionType,
    ): InterviewDecision => {

        return {

            type,

            claimId:
                claim.id,

            reason:
                `Testing ${type} for MYCAKEPAGE.`,
        };
    };


/*
 * ============================================================
 * 8. Investigation Intent Factory
 * ============================================================
 */

const createInvestigationIntent =
    (
        decision:
            InterviewDecisionType,

        area:
            string,

        objective:
            string,

        directive:
            "CLARIFY" | "DEEPEN",
    ): InvestigationIntent => {

        return {

            decision,

            claimId:
                claim.id,

            objective,

            investigationArea:
                area as any,

            requiredEvidence:
                [
                    objective,
                    `Evidence related to ${area}`,
                ],

            investigatedAreas:
                [
                    "OWNERSHIP",
                ],

            conversationDirective:
                directive,

            assessment,

            claim,
        } as InvestigationIntent;
    };


/*
 * ============================================================
 * 9. Build Input
 * ============================================================
 */

const buildInput =
    (
        decisionType:
            InterviewDecisionType,

        answer:
            string,

        score:
            number,

        feedback:
            string,

        reasoning:
            InterviewReasoning,

        investigationIntent:
            InvestigationIntent,
    ): GenerateQuestionInput => {

        const decision =
            createDecision(
                decisionType
            );


        const interviewContext =
            createInterviewContext(
                answer,
                score,
                feedback,
            );


        return {

            interviewContext,

            reasoning,

            claim,

            assessment,

            decision,

            interviewState:
                interviewContext
                    .sessionProgress
                    .interviewState,

            investigationIntent,
        };
    };


/*
 * ============================================================
 * 10. Test Case
 * ============================================================
 */

interface TestCase {

    name:
        string;

    decision:
        InterviewDecisionType;

    answer:
        string;

    score:
        number;

    feedback:
        string;

    reasoning:
        InterviewReasoning;

    investigationIntent:
        InvestigationIntent;
}


/*
 * ============================================================
 * 11. Test Cases
 * ============================================================
 */

const testCases:
    TestCase[] = [

    /*
     * ----------------------------------------------------------
     * RECOVER_CONVERSATION
     * ----------------------------------------------------------
     */

    {
        name:
            "Recover after I don't know",

        decision:
            InterviewDecisionType.RECOVER_CONVERSATION,

        answer:
            "I don't know.",

        score:
            0,

        feedback:
            "Candidate did not know the answer.",

        reasoning:
            createReasoning(

                "API",

                "FOLLOW_UP",

                false,

                "Obtain one concrete example of a backend API endpoint the candidate personally worked on.",
            ),

        investigationIntent:
            createInvestigationIntent(

                InterviewDecisionType.RECOVER_CONVERSATION,

                "API",

                "Obtain one concrete example of a backend API endpoint the candidate personally worked on.",

                "CLARIFY",
            ),
    },


    /*
     * ----------------------------------------------------------
     * CHANGE_ANGLE
     * ----------------------------------------------------------
     */

    {
        name:
            "Change angle after off-topic answer",

        decision:
            InterviewDecisionType.CHANGE_ANGLE,

        answer:
            "I used React and Redux for the frontend.",

        score:
            0,

        feedback:
            "The candidate's answer was off-topic.",

        reasoning:
            createReasoning(

                "API",

                "PROBE_CLAIM",

                false,

                "Change from the failed ownership angle to API implementation while remaining on MYCAKEPAGE.",
            ),

        investigationIntent:
            createInvestigationIntent(

                InterviewDecisionType.CHANGE_ANGLE,

                "API",

                "Determine one concrete REST API implementation detail from MYCAKEPAGE.",

                "DEEPEN",
            ),
    },


    /*
     * ----------------------------------------------------------
     * CLARIFY_CONTRADICTION
     * ----------------------------------------------------------
     */

    {
        name:
            "Clarify contradictory database answers",

        decision:
            InterviewDecisionType.CLARIFY_CONTRADICTION,

        answer:
            "Earlier I said the category was embedded, but actually I used categoryId.",

        score:
            4,

        feedback:
            "The candidate provided conflicting database modeling information.",

        reasoning:
            createReasoning(

                "DATABASE",

                "FOLLOW_UP",

                false,

                "Resolve whether MYCAKEPAGE used embedded category data or a categoryId reference.",
            ),

        investigationIntent:
            createInvestigationIntent(

                InterviewDecisionType.CLARIFY_CONTRADICTION,

                "DATABASE",

                "Clarify whether the category relationship was embedded or represented using categoryId.",

                "CLARIFY",
            ),
    },
];


/*
 * ============================================================
 * 12. Select Tests
 * ============================================================
 */

const selectTests = (
    tests:
        TestCase[],
    requested:
        string | undefined,
): TestCase[] => {

    if (!requested) {
        return tests;
    }


    switch (requested) {

        case "recover":

            return tests.filter(
                (test) =>
                    test.decision ===
                    InterviewDecisionType.RECOVER_CONVERSATION
            );


        case "angle":

            return tests.filter(
                (test) =>
                    test.decision ===
                    InterviewDecisionType.CHANGE_ANGLE
            );


        case "contradiction":

            return tests.filter(
                (test) =>
                    test.decision ===
                    InterviewDecisionType.CLARIFY_CONTRADICTION
            );


        case "all":

            return tests;


        default:

            return [];
    }
};


/*
 * ============================================================
 * 13. Validate Generated Question
 * ============================================================
 */

const validateQuestion =
    (
        testCase:
            TestCase,

        result: {
            question?: string;
            claimId?: string;
            reasoning?: string;
            expectedTopics?: string[];
        },
    ): string[] => {

        const failures:
            string[] = [];


        /*
         * ------------------------------------------------------
         * Question must exist
         * ------------------------------------------------------
         */

        if (
            !result.question ||
            result.question.trim().length === 0
        ) {

            failures.push(
                "No question was generated."
            );
        }


        /*
         * ------------------------------------------------------
         * Claim must remain the same
         * ------------------------------------------------------
         */

        if (
            result.claimId !==
            claim.id
        ) {

            failures.push(
                `Expected claimId "${claim.id}" but received "${result.claimId}".`
            );
        }


        /*
         * ------------------------------------------------------
         * Exactly one question
         * ------------------------------------------------------
         */

        if (
            result.question
        ) {

            const questionMarks =
                (
                    result.question
                        .match(/\?/g)
                    ?? []
                ).length;


            if (
                questionMarks !== 1
            ) {

                failures.push(
                    `Expected exactly one question mark, found ${questionMarks}.`
                );
            }
        }


        /*
         * ------------------------------------------------------
         * RECOVER_CONVERSATION
         * ------------------------------------------------------
         */

        if (
            testCase.decision ===
            InterviewDecisionType.RECOVER_CONVERSATION
        ) {

            if (
                result.question &&
                result.question
                    .toLowerCase()
                    .includes(
                        "don't know"
                    )
            ) {

                failures.push(
                    "Recovery question should not repeat the candidate's failure."
                );
            }
        }


        /*
         * ------------------------------------------------------
         * CHANGE_ANGLE
         * ------------------------------------------------------
         */

        if (
            testCase.decision ===
            InterviewDecisionType.CHANGE_ANGLE
        ) {

            const text =
                (
                    result.question ??
                    ""
                )
                    .toLowerCase();


            const appearsToBeApiFocused =
                text.includes(
                    "api"
                )
                ||
                text.includes(
                    "endpoint"
                )
                ||
                text.includes(
                    "rest"
                )
                ||
                text.includes(
                    "route"
                );


            if (
                !appearsToBeApiFocused
            ) {

                failures.push(
                    "CHANGE_ANGLE question does not appear to investigate the requested API angle."
                );
            }


            const repeatsOwnershipAngle =
                text.includes(
                    "what did you personally implement"
                )
                ||
                text.includes(
                    "what did you implement"
                );


            if (
                repeatsOwnershipAngle
            ) {

                failures.push(
                    "CHANGE_ANGLE question appears to return to the failed ownership angle."
                );
            }
        }


        /*
         * ------------------------------------------------------
         * CLARIFY_CONTRADICTION
         * ------------------------------------------------------
         */

        if (
            testCase.decision ===
            InterviewDecisionType.CLARIFY_CONTRADICTION
        ) {

            const text =
                (
                    result.question ??
                    ""
                )
                    .toLowerCase();


            const mentionsRelevantConcept =
                text.includes(
                    "category"
                )
                ||
                text.includes(
                    "categoryid"
                )
                ||
                text.includes(
                    "embedded"
                )
                ||
                text.includes(
                    "reference"
                );


            if (
                !mentionsRelevantConcept
            ) {

                failures.push(
                    "Contradiction question does not appear to address the database contradiction."
                );
            }
        }


        return failures;
    };


/*
 * ============================================================
 * 14. Run Test
 * ============================================================
 */

const runTest =
    async (
        testCase:
            TestCase,
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
            "Decision:",
            testCase.decision
        );

        console.log(
            "Candidate:",
            testCase.answer
        );

        console.log(
            "Reasoning Area:",
            testCase.reasoning.investigationArea
        );


        try {

            console.log(
                "\nCalling Gemini question generator...\n"
            );


            const input =
                buildInput(

                    testCase.decision,

                    testCase.answer,

                    testCase.score,

                    testCase.feedback,

                    testCase.reasoning,

                    testCase.investigationIntent,
                );


            const result =
                await generateInterviewQuestion(
                    input
                );


            console.log(
                "Generated Question:"
            );


            console.log(
                result.question
            );


            console.log(
                "\nFull Result:"
            );


            console.log(
                JSON.stringify(
                    result,
                    null,
                    2
                )
            );


            const failures =
                validateQuestion(
                    testCase,
                    result
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
                "\nQuestion generation failed:"
            );

            console.error(
                error
            );

            return false;
        }
    };


/*
 * ============================================================
 * 15. Select Requested Tests
 * ============================================================
 */

const selectedTests =
    selectTests(
        testCases,
        requestedTest
    );


/*
 * ============================================================
 * Invalid CLI Argument
 * ============================================================
 */

if (
    requestedTest &&
    selectedTests.length === 0
) {

    console.error(
        `
Unknown test: "${requestedTest}"

Usage:

npx tsx src/scripts/test-interview-engine-decisions.ts

npx tsx src/scripts/test-interview-engine-decisions.ts recover

npx tsx src/scripts/test-interview-engine-decisions.ts angle

npx tsx src/scripts/test-interview-engine-decisions.ts contradiction

npx tsx src/scripts/test-interview-engine-decisions.ts all
`
    );

    process.exit(1);
}


/*
 * ============================================================
 * 16. Run Selected Tests
 * ============================================================
 */

let passed =
    0;


for (
    const testCase
    of selectedTests
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
 * 17. Summary
 * ============================================================
 */

console.log(
    "\n========================================"
);

console.log(
    " QUESTION GENERATOR TEST SUMMARY"
);

console.log(
    "========================================"
);

console.log(
    `Requested Test: ${requestedTest ?? "all"}`
);

console.log(
    `Passed: ${passed}/${selectedTests.length}`
);

console.log(
    `Failed: ${selectedTests.length - passed}/${selectedTests.length}`
);

console.log(
    "========================================\n"
);


/*
 * ============================================================
 * 18. Exit With Failure
 * ============================================================
 */

if (
    passed !==
    selectedTests.length
) {

    process.exit(1);
}