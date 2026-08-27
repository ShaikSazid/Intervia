import {
    buildInvestigationIntent,
} from "../modules/interview-brain/intent/investigation-intent.builder.js";

import {
    validateInvestigationIntent,
} from "../modules/interview-brain/intent/investigation-intent.validator.js";

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
 * Claim
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


/*
 * ============================================================
 * Assessment
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
 * Reasoning Factory
 * ============================================================
 */

const createReasoning = (
    investigationArea:
        InterviewReasoning["investigationArea"]
): InterviewReasoning => ({

    reasoning:
        "Test reasoning for the current conversational move.",

    objective:
        "Determine one concrete piece of evidence about the candidate's MYCAKEPAGE experience.",

    investigationArea,

    questionType:
        "FOLLOW_UP",

    stayOnCurrentTopic:
        true,

    increaseDifficulty:
        false,

    referenceResume:
        true,

    askImplementationQuestion:
        false,
});


/*
 * ============================================================
 * Decision Factory
 * ============================================================
 */

const createDecision = (
    type:
        InterviewDecisionType
): InterviewDecision => ({

    type,

    claimId:
        claim.id,

    reason:
        `Testing ${type} investigation intent.`,
});


/*
 * ============================================================
 * Expected Directive
 * ============================================================
 */

const expectedDirective = (
    decision:
        InterviewDecisionType
): string => {

    switch (decision) {

        case InterviewDecisionType.FOLLOW_UP:

            return "CLARIFY";


        case InterviewDecisionType.RECOVER_CONVERSATION:

            return "CLARIFY";


        case InterviewDecisionType.PROBE_CLAIM:

            return "DEEPEN";


        case InterviewDecisionType.CHANGE_ANGLE:

            return "DEEPEN";


        case InterviewDecisionType.CLARIFY_CONTRADICTION:

            return "CLARIFY";


        case InterviewDecisionType.MOVE_TO_NEXT_CLAIM:

            return "TRANSITION";


        case InterviewDecisionType.MOVE_TO_NEXT_STAGE:

            return "TRANSITION";


        case InterviewDecisionType.FINISH_INTERVIEW:

            return "TRANSITION";


        default: {

            const exhaustiveCheck:
                never =
                decision;

            return exhaustiveCheck;
        }
    }
};


/*
 * ============================================================
 * Run One Test
 * ============================================================
 */

const runTest = (
    decisionType:
        InterviewDecisionType,

    investigationArea:
        InterviewReasoning["investigationArea"]
): boolean => {

    try {

        const decision =
            createDecision(
                decisionType
            );


        const reasoning =
            createReasoning(
                investigationArea
            );


        const intent =
            buildInvestigationIntent(
                decision,
                reasoning,
                claim,
                assessment,
                [
                    "OWNERSHIP",
                ]
            );


        validateInvestigationIntent(
            intent
        );


        const expected =
            expectedDirective(
                decisionType
            );


        const passed =
            intent.conversationDirective ===
            expected;


        console.log(
            "\n========================================"
        );

        console.log(
            `TEST: ${decisionType}`
        );

        console.log(
            "========================================"
        );

        console.log(
            "Decision:",
            intent.decision
        );

        console.log(
            "Claim ID:",
            intent.claimId
        );

        console.log(
            "Conversation Directive:",
            intent.conversationDirective
        );

        console.log(
            "Expected Directive:",
            expected
        );

        console.log(
            "Investigation Area:",
            intent.investigationArea
        );

        console.log(
            "Required Evidence:",
            intent.requiredEvidence
        );

        console.log(
            "Result:",
            passed
                ? "PASS"
                : "FAIL"
        );


        return passed;

    } catch (error) {

        console.error(
            "\nTEST FAILED:"
        );

        console.error(
            error
        );

        return false;
    }
};


/*
 * ============================================================
 * Test All Conversational Decisions
 * ============================================================
 */

const tests: Array<{
    decision:
        InterviewDecisionType;

    area:
        InterviewReasoning["investigationArea"];
}> = [

    {
        decision:
            InterviewDecisionType.FOLLOW_UP,

        area:
            "OWNERSHIP",
    },

    {
        decision:
            InterviewDecisionType.RECOVER_CONVERSATION,

        area:
            "OWNERSHIP",
    },

    {
        decision:
            InterviewDecisionType.CHANGE_ANGLE,

        area:
            "API",
    },

    {
        decision:
            InterviewDecisionType.CLARIFY_CONTRADICTION,

        area:
            "DATABASE",
    },

    {
        decision:
            InterviewDecisionType.PROBE_CLAIM,

        area:
            "IMPLEMENTATION",
    },

    {
        decision:
            InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

        area:
            "OWNERSHIP",
    },

    {
        decision:
            InterviewDecisionType.MOVE_TO_NEXT_STAGE,

        area:
            "GENERAL",
    },
];


let passed =
    0;


for (
    const test
    of tests
) {

    if (
        runTest(
            test.decision,
            test.area
        )
    ) {

        passed++;
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
    " INVESTIGATION INTENT TEST SUMMARY"
);

console.log(
    "========================================"
);

console.log(
    `Passed: ${passed}/${tests.length}`
);

console.log(
    `Failed: ${tests.length - passed}/${tests.length}`
);

console.log(
    "========================================\n"
);


if (
    passed !==
    tests.length
) {

    process.exit(1);
}