import {
    generateInterviewQuestion,
} from "../modules/interview-engine/interview-engine.agent.js";

import {
    InterviewContext,
} from "../modules/interview-context/interview-context.types.js";

import {
    CandidateAnalysis,
} from "../modules/candidate-profile/candidate-profile.types.js";

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
    InterviewDecision,
} from "../modules/interview-brain/brain/interview-decision.types.js";

import {
    InterviewDecisionType,
} from "../modules/interview-brain/brain/interview-decision.enums.js";

import {
    InterviewState,
} from "../modules/interview-brain/state/interview-state.types.js";

import {
    CandidateModel,
} from "../modules/interview-brain/candidate/candidate-model.types.js";

import {
    InvestigationAttempt,
} from "../modules/interview-brain/candidate/investigation-attempt.types.js";

import {
    InterviewStage,
} from "../modules/interview-planner/planner.types.js";

import {
    InterviewType,
    InterviewDifficulty,
} from "../modules/interview/interview.enums.js";

import {
    InterviewConfiguration,
    SessionProgress,
} from "../modules/interview-session/session.types.js";

import {
    InterviewReasoning,
} from "../modules/interview-reasoning/reasoning.types.js";

import {
    InvestigationIntent,
} from "../modules/interview-brain/intent/investigation-intent.types.js";


const candidateProfile:
    CandidateAnalysis = {

    identity: {

        fullName:
            "SHAIK SAZID",

        primaryTitle:
            "Backend / Full Stack Developer",

        headline:
            "Backend / Full Stack Developer",

        executiveSummary:
            "Backend / Full Stack Developer with experience in Node.js, Express.js, React, MongoDB and PostgreSQL.",

        perceivedSeniorityLevel:
            "ENTRY",

        estimatedYearsOfExperience:
            null,

        contactChannels:
            [],

        onlinePresences:
            [],
    },

    skills: [

        {
            canonicalName:
                "Node.js",

            rawName:
                "Node.js",

            categories:
                [
                    "Backend",
                    "Runtime",
                ],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "Express.js",

            rawName:
                "Express.js",

            categories:
                [
                    "Backend",
                    "Framework",
                ],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "MongoDB",

            rawName:
                "MongoDB",

            categories:
                [
                    "Database",
                ],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },
    ],

    workExperiences:
        [],

    education:
        [],

    projects: [

        {
            id:
                "proj_1",

            title:
                "MYCAKEPAGE",

            summary:
                "Built a web application for managing cakes and categories.",

            url:
                null,

            keyContributions: [

                {
                    description:
                        "Used Node.js and Express.js for backend development.",

                    associatedSkills:
                        [
                            "Node.js",
                            "Express.js",
                        ],
                },

                {
                    description:
                        "Used MongoDB for storing application data.",

                    associatedSkills:
                        [
                            "MongoDB",
                        ],
                },

                {
                    description:
                        "Implemented REST APIs for managing cakes and categories.",

                    associatedSkills:
                        [
                            "REST API",
                        ],
                },
            ],

            technologiesUsed:
                [
                    "Node.js",
                    "Express.js",
                    "MongoDB",
                    "REST API",
                ],
        },
    ],
};


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
        "Built a web application for managing cakes and categories using Node.js, Express.js and MongoDB.",

    relatedSkillNames:
        [
            "Node.js",
            "Express.js",
            "MongoDB",
        ],

    dateRange:
        null,
};


const assessment:
    ClaimAssessment = {

    claimId:
        claim.id,

    verificationStatus:
        ClaimVerificationStatus.QUESTIONABLE,

    confidence:
        0.2,

    evidenceTurnIds:
        [
            "turn_1",
        ],

    evidence:
        [],

    needsFollowUp:
        true,
};


const investigationAttempt:
    InvestigationAttempt = {

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
};


const candidateModel:
    CandidateModel = {

    claims:
        [
            claim,
        ],

    claimAssessments:
        [
            assessment,
        ],
};


const conversationState:
    InterviewState["conversationState"] = {

    mode:
        "GUIDED_RECOVERY",

    currentThread:
        "backend ownership",

    threadStatus:
        "OPEN",

    demonstratedEvidence:
        [],

    missingEvidence:
        [
            "Determine what the candidate personally implemented in the MYCAKEPAGE backend.",
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
            "I don't know",
        ],

    unresolvedContradictions:
        [],

    candidateFrustrated:
        false,
};


const interviewState:
    InterviewState = {

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
            investigationAttempt,
        ],

    conversationState,
};


const sessionProgress:
    SessionProgress = {

    currentStageIndex:
        0,

    currentQuestionIndex:
        1,

    completedQuestions:
        1,

    totalQuestions:
        6,

    candidateModel,

    interviewState,
};


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
            "Understand implementation.",
        ],

    investigationGoal:
        "Determine whether the candidate genuinely worked on the MYCAKEPAGE backend.",

    investigationDimensions:
        [
            "OWNERSHIP",
            "IMPLEMENTATION",
            "ARCHITECTURE",
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


const interviewContext:
    InterviewContext = {

    candidateProfile,

    interviewConfiguration: {

        targetRole:
            "Backend Developer",

        interviewType:
            InterviewType.TECHNICAL,

        durationMinutes:
            30,

        language:
            "English",
    } as InterviewConfiguration,

    interviewPlan: {

        stages:
            [
                currentStage,
            ],

        claimRelationships:
            [],

        totalQuestions:
            6,

        estimatedDurationMinutes:
            30,
    },

    sessionProgress,

    currentStage,

    resumeContext:
        `
MYCAKEPAGE:

Built a web application for managing cakes and categories.

Used Node.js and Express.js for backend development.

Used MongoDB for storing application data.

Implemented REST APIs for managing cakes and categories.
`,

    conversationHistory:
        [
            {
                sequenceNumber:
                    1,

                question:
                    "What did you personally implement in the MYCAKEPAGE backend?",

                answer:
                    "I don't know",

                score:
                    2,

                feedback:
                    "The candidate could not explain their backend contribution.",
            },
        ],
};


const reasoning:
    InterviewReasoning = {

    reasoning:
        "The candidate could not establish ownership, so the next question should narrow the request to one concrete responsibility.",

    objective:
        "Elicit a specific, concrete detail about the backend functionality the candidate worked on, to establish basic ownership.",

    investigationArea:
        "OWNERSHIP",

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
};


const decision:
    InterviewDecision = {

    type:
        InterviewDecisionType.FOLLOW_UP,

    claimId:
        claim.id,

    reason:
        "The candidate has not provided enough evidence of backend ownership.",
};


const interviewStateForQuestion:
    InterviewState =
        interviewState;


const investigationIntent:
    InvestigationIntent = {

    decision:
        InterviewDecisionType.FOLLOW_UP,

    claimId:
        claim.id,

    objective:
        "Elicit a specific, concrete detail about the backend functionality the candidate worked on, to establish basic ownership.",

    investigationArea:
        "OWNERSHIP",

    requiredEvidence:
        [
            "One concrete example of the candidate's personal backend responsibility.",
            "Evidence of actual ownership rather than general project knowledge.",
        ],

    investigatedAreas:
        [
            "OWNERSHIP",
        ],

    conversationDirective:
        "CLARIFY",

    assessment,

    claim,
};


try {

    console.log(
        "\n========================================"
    );

    console.log(
        "      INTERVIEW QUESTION TEST"
    );

    console.log(
        "========================================\n"
    );

    console.log(
        "Scenario:"
    );

    console.log(
        'Candidate answer: "I don\'t know"'
    );

    console.log(
        "Mode: GUIDED_RECOVERY"
    );

    console.log(
        "Decision: FOLLOW_UP"
    );

    console.log(
        "Area: OWNERSHIP"
    );

    console.log(
        "\nCalling Gemini...\n"
    );


    const result =
        await generateInterviewQuestion({

            interviewContext,

            reasoning,

            claim,

            assessment,

            decision,

            interviewState:
                interviewStateForQuestion,

            investigationIntent,
        });


    console.log(
        "Gemini question result:"
    );

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );


    console.log(
        "\n========================================"
    );

} catch (error) {

    console.error(
        "\nInterview Question Test Failed:\n"
    );

    console.error(
        error
    );
}