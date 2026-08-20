import { NotFoundError } from "../../errors/NotFoundError.js";

import { CandidateAnalysis } from "../candidate-profile/candidate-profile.types.js";

import * as candidateProfileRepository
    from "../candidate-profile/candidate-profile.repository.js";

import { generateInterviewPlan }
    from "../interview-planner/planner.service.js";

import { CreateInterviewDto }
    from "./interview.dto.js";

import * as resumeRepository
    from "../resume/resume.repository.js";

import * as interviewSessionRepository
    from "../interview-session/session.repository.js";

import {
    InterviewConfiguration,
    SessionProgress,
} from "../interview-session/session.types.js";

import { CreateInterviewSessionDto }
    from "../interview-session/session.dto.js";

import { fromPrismaJson }
    from "../../common/utils/prisma-json.js";

import { extractResumeClaims }
    from "../interview-brain/claims/claim-extraction.agent.js";

import { buildCandidateModel }
    from "../interview-brain/candidate/candidate-model.builder.js";

import { InterviewState }
    from "../interview-brain/state/interview-state.types.js";


export const createInterview = async (
    data: CreateInterviewDto
) => {

    /*
     * ============================================================
     * 1. Find Resume
     * ============================================================
     */

    const resume =
        await resumeRepository.findResumeById(
            data.resumeId
        );

    if (!resume) {

        throw new NotFoundError(
            `Resume "${data.resumeId}" was not found.`
        );
    }


    /*
     * ============================================================
     * 2. Find Candidate Profile
     * ============================================================
     */

    const candidateProfile =
        await candidateProfileRepository
            .findCandidateProfileByResumeId(
                data.resumeId
            );

    if (!candidateProfile) {

        throw new NotFoundError(
            `Candidate Profile for resume "${data.resumeId}" was not found.`
        );
    }


    /*
     * ============================================================
     * 3. Convert Prisma JSON → CandidateAnalysis
     * ============================================================
     */

    const candidateAnalysis =
        fromPrismaJson<CandidateAnalysis>(
            candidateProfile.candidateAnalysis
        );


    /*
     * ============================================================
     * 4. Extract Resume Claims
     * ============================================================
     *
     * This is the ONLY place where resume claims are extracted.
     *
     * The same claims are then passed to:
     *
     * 1. Candidate Model
     * 2. Interview Planner
     *
     */

    const claimResult =
        await extractResumeClaims({
            candidateAnalysis,
        });

    const resumeClaims =
        claimResult.claims;


    const candidateModel =
        buildCandidateModel(
            resumeClaims
        );


    const interviewPlan =
        await generateInterviewPlan({

            candidateProfile:
                candidateAnalysis,

            resumeClaims,

            targetRole:
                data.targetRole,

            durationMinutes:
                data.durationMinutes,

            interviewType:
                data.interviewType,

            language:
                data.language,
        });


    const interviewConfiguration:
        InterviewConfiguration = {

        targetRole:
            data.targetRole,

        interviewType:
            data.interviewType,

        durationMinutes:
            data.durationMinutes,

        language:
            data.language,
    };

    const totalQuestions =
        interviewPlan.stages.reduce(
            (
                total,
                stage
            ) =>
                total +
                stage.estimatedQuestions,
            0
        );

    const interviewState: InterviewState = {

        currentStage:
            "TECHNICAL",

        currentClaimId:
            null,

        remainingClaimIds:
            candidateModel.claims.map(
                claim => claim.id
            ),

        pendingFollowUpClaimIds:
            [],

        completedClaimIds:
            [],

        claimProgress:
            candidateModel.claims.map(
                claim => ({
                    claimId:
                        claim.id,

                    questionCount:
                        0,

                    weakAnswerCount:
                        0,

                    followUpCount:
                        0,

                    probeCount:
                        0,

                    investigatedAreas:
                        []
                })
            ),

        investigationAttempts:
            [],
        conversationState: {

            mode:
                "CLAIM_INVESTIGATION",

            currentThread:
                null,

            threadStatus:
                "OPEN",

            demonstratedEvidence:
                [],

            missingEvidence:
                [],

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
        },
    };


    /*
     * ============================================================
     * 10. Initialize Session Progress
     * ============================================================
     */

    const sessionProgress:
        SessionProgress = {

        currentStageIndex:
            0,

        currentQuestionIndex:
            0,

        completedQuestions:
            0,

        totalQuestions,

        candidateModel,

        interviewState,
    };


    /*
     * ============================================================
     * 11. Create Interview Session DTO
     * ============================================================
     */

    const createInterviewSessionDto:
        CreateInterviewSessionDto = {

        resumeId:
            resume.id,

        candidateProfileId:
            candidateProfile.id,

        interviewConfiguration,

        interviewPlan,

        sessionProgress,
    };


    /*
     * ============================================================
     * 12. Persist Interview Session
     * ============================================================
     */

    const interviewSession =
        await interviewSessionRepository
            .createInterviewSession(
                createInterviewSessionDto
            );


    /*
     * ============================================================
     * 13. Return Session
     * ============================================================
     */

    return interviewSession;
};