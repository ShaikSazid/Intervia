import {
    InterviewSessionStatus,
    ConversationTurnStatus,
} from "../../generated/prisma/enums.js";

import {
    updateConversationState,
} from "../interview-brain/conversation/conversation-state.service.js";

import {
    createInvestigationAttempt,
} from "../interview-brain/candidate/investigation-attempt.service.js";

import {
    recordInvestigationArea,
    recordQuestion,
    recordWeakAnswer,
} from "../interview-brain/candidate/claim-progress.service.js";

import {
    InterviewDecisionType,
} from "../interview-brain/brain/interview-decision.enums.js";

import { NotFoundError }
    from "../../errors/NotFoundError.js";

import * as conversationTurnService
    from "../conversation-turn/conversation-turn.service.js";

import { SubmitAnswerDto }
    from "./interview-engine.dto.js";

import { generateAnswerEvaluation }
    from "../answer-evaluation/answer-evaluation.agent.js";

import * as interviewSessionService
    from "../interview-session/session.service.js";

import { generateInterviewReasoning }
    from "../interview-reasoning/reasoning.agent.js";

import * as interviewSessionRepository
    from "../interview-session/session.repository.js";

import { generateInterviewQuestion }
    from "./interview-engine.agent.js";

import { AnswerEvaluation }
    from "../answer-evaluation/answer-evaluation.types.js";

import { fromPrismaJson }
    from "../../common/utils/prisma-json.js";

import { CandidateAnalysis }
    from "../candidate-profile/candidate-profile.types.js";

import {
    InterviewPlan,
    InterviewStage,
} from "../interview-planner/planner.types.js";

import {
    InterviewConfiguration,
    SessionProgress,
} from "../interview-session/session.types.js";

import { buildQuestionContext }
    from "./interview-engine.context.js";

import {
    updateCandidateModel,
} from "../interview-brain/candidate/candidate-model.service.js";

import {
    selectNextClaim,
} from "../interview-brain/claim-selection/claim-selection.service.js";

import {
    decideNextAction,
} from "../interview-brain/brain/interview-brain.service.js";

import {
    applyInterviewDecision,
} from "../interview-brain/state/interview-state.service.js";

import {
    InterviewDecision,
} from "../interview-brain/brain/interview-decision.types.js";

import {
    ClaimAssessment,
} from "../interview-brain/claims/claim-assessment.types.js";

import {
    createClaimAssessment,
} from "../interview-brain/claims/claim-assessment.service.js";

import {
    ResumeClaim,
} from "../interview-brain/claims/resume-claim.types.js";

import {
    InterviewState,
} from "../interview-brain/state/interview-state.types.js";

import {
    CandidateModel,
} from "../interview-brain/candidate/candidate-model.types.js";

import {
    InterviewReasoning,
} from "../interview-reasoning/reasoning.types.js";

import {
    DEFAULT_INTERVIEW_REASONING,
} from "../interview-reasoning/default-reasoning.js";

import {
    InvestigationIntent,
} from "../interview-brain/intent/investigation-intent.types.js";

import {
    buildInvestigationIntent,
} from "../interview-brain/intent/investigation-intent.builder.js";

import {
    validateInvestigationIntent,
} from "../interview-brain/intent/investigation-intent.validator.js";


/*
|--------------------------------------------------------------------------
| Helper: Generate Question
|--------------------------------------------------------------------------
*/

const generateQuestion = async (params: {
    interviewSessionId: string;
    sequenceNumber: number;

    resumeId: string;

    candidateProfile: CandidateAnalysis;

    interviewConfiguration: InterviewConfiguration;

    interviewPlan: InterviewPlan;

    progress: SessionProgress;

    claim: ResumeClaim;

    assessment: ClaimAssessment;

    decision: InterviewDecision;

    interviewState: InterviewState;

    reasoning: InterviewReasoning;

    investigationIntent: InvestigationIntent;
}) => {

    const interviewContext =
        await buildQuestionContext({

            interviewSessionId:
                params.interviewSessionId,

            resumeId:
                params.resumeId,

            candidateProfile:
                params.candidateProfile,

            interviewConfiguration:
                params.interviewConfiguration,

            interviewPlan:
                params.interviewPlan,

            progress:
                params.progress,

            claim:
                params.claim,
        });


    const question =
        await generateInterviewQuestion({

            interviewContext,

            reasoning:
                params.reasoning,

            claim:
                params.claim,

            assessment:
                params.assessment,

            decision:
                params.decision,

            interviewState:
                params.interviewState,

            investigationIntent:
                params.investigationIntent,
        });


    const conversationTurn =
        await conversationTurnService
            .createConversationTurn({

                interviewSessionId:
                    params.interviewSessionId,

                sequenceNumber:
                    params.sequenceNumber,

                question:
                    question.question,

                status:
                    ConversationTurnStatus.PENDING,

                startedAt:
                    new Date(),

                investigationIntent:
                    params.investigationIntent,
            });


    return {
        question,
        conversationTurn,
    };
};


/*
|--------------------------------------------------------------------------
| Start Interview
|--------------------------------------------------------------------------
*/

export const startInterview = async (
    sessionId: string
) => {

    const session =
        await interviewSessionRepository
            .findInterviewSessionWithCandidateProfile(
                sessionId
            );


    if (!session) {

        throw new NotFoundError(
            `Interview session ${sessionId} was not found`
        );
    }


    if (
        session.status !==
        InterviewSessionStatus.PENDING
    ) {

        throw new Error(
            `Interview session ${sessionId} is already ${session.status}`
        );
    }


    const candidateProfile =
        fromPrismaJson<CandidateAnalysis>(
            session
                .candidateProfile
                .candidateAnalysis
        );


    const configuration =
        fromPrismaJson<InterviewConfiguration>(
            session.interviewConfiguration
        );


    const interviewPlan =
        fromPrismaJson<InterviewPlan>(
            session.interviewPlan
        );


    let progress =
        fromPrismaJson<SessionProgress>(
            session.sessionProgress
        );


    const candidateModel:
        CandidateModel =
        progress.candidateModel;


    if (!candidateModel) {

        throw new Error(
            "Interview session does not contain a Candidate Model."
        );
    }


    if (
        !candidateModel.claims ||
        candidateModel.claims.length === 0
    ) {

        throw new Error(
            "Unable to start interview: no resume claims were found."
        );
    }


    let firstStageIndex = 0;

    let firstStage:
        InterviewStage | undefined;


    /*
     * ============================================================
     * 4. Find first valid planner stage
     * ============================================================
     */

    while (
        firstStageIndex <
        interviewPlan.stages.length
    ) {

        const candidateStage =
            interviewPlan.stages[
                firstStageIndex
            ];


        if (!candidateStage) {
            break;
        }


        const stageClaimIds =
            candidateStage.claims
                .map(
                    (stageClaim) =>
                        stageClaim.claimId
                )
                .filter(
                    (claimId) =>
                        candidateModel.claims.some(
                            (claim) =>
                                claim.id === claimId
                        )
                );


        if (
            stageClaimIds.length > 0
        ) {

            firstStage =
                candidateStage;

            break;
        }


        console.log(
            `Skipping planner stage "${candidateStage.topic}" because it contains no valid resume claims.`
        );


        firstStageIndex++;
    }


    /*
     * ============================================================
     * 5. Validate planner
     * ============================================================
     */

    if (!firstStage) {

        throw new Error(
            "Unable to start interview: no planner stage contains valid resume claims."
        );
    }


    /*
     * ============================================================
     * 6. Get valid claims for first stage
     * ============================================================
     */

    const firstStageClaimIds =
        firstStage.claims
            .map(
                (stageClaim) =>
                    stageClaim.claimId
            )
            .filter(
                (claimId) =>
                    candidateModel.claims.some(
                        (claim) =>
                            claim.id === claimId
                    )
            );


    /*
     * ============================================================
     * 7. Select first claim
     * ============================================================
     */

    const selection =
        selectNextClaim({

            claims:
                candidateModel.claims,

            claimAssessments:
                candidateModel.claimAssessments,

            currentClaimId:
                null,

            remainingClaimIds:
                firstStageClaimIds,

            completedClaimIds:
                [],

            pendingFollowUpClaimIds:
                [],

            currentStage:
                firstStage,

            targetRole:
                configuration.targetRole,

            claimRelationships:
                interviewPlan.claimRelationships,
        });


    if (!selection.claim) {

        throw new Error(
            `Unable to start interview: no eligible claim was found in planner stage "${firstStage.topic}".`
        );
    }


    const firstClaim:
        ResumeClaim =
        selection.claim;


    /*
     * ============================================================
     * 8. Initialize Brain State
     * ============================================================
     */

    const interviewState:
        InterviewState = {

        currentStage:
            firstStage.id,

        currentClaimId:
            firstClaim.id,

        remainingClaimIds:
            firstStageClaimIds.filter(
                (claimId) =>
                    claimId !==
                    firstClaim.id
            ),

        pendingFollowUpClaimIds:
            [],

        completedClaimIds:
            [],

        claimProgress:
            candidateModel.claims.map(
                (claim) => ({

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
                        [],
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
     * 9. Get first claim assessment
     * ============================================================
     */

    const firstAssessment:
        ClaimAssessment | undefined =
        candidateModel.claimAssessments.find(
            (assessment: ClaimAssessment) =>
                assessment.claimId ===
                firstClaim.id
        );


    if (!firstAssessment) {

        throw new Error(
            `No assessment found for claim ${firstClaim.id}`
        );
    }


    /*
     * ============================================================
     * 10. Initial Decision
     * ============================================================
     */

    const initialDecision:
        InterviewDecision = {

        type:
            InterviewDecisionType.MOVE_TO_NEXT_CLAIM,

        claimId:
            firstClaim.id,

        reason:
            `Begin investigation of resume claim "${firstClaim.title}".`,
    };


    /*
     * ============================================================
     * 11. Persist initialized Brain state
     * ============================================================
     */

    progress = {

        ...progress,

        currentStageIndex:
            firstStageIndex,

        currentQuestionIndex:
            0,

        candidateModel,

        interviewState,
    };


    await interviewSessionService
        .updateSessionProgress(
            session.id,
            progress
        );


    /*
     * ============================================================
     * 12. Build Initial Investigation Intent
     * ============================================================
     */

    const initialClaimProgress =
        interviewState.claimProgress.find(
            (claimProgress) =>
                claimProgress.claimId ===
                firstClaim.id
        );


    const initialInvestigationIntent =
        buildInvestigationIntent(

            initialDecision,

            DEFAULT_INTERVIEW_REASONING,

            firstClaim,

            firstAssessment,

            initialClaimProgress?.investigatedAreas ?? []
        );


    validateInvestigationIntent(
        initialInvestigationIntent
    );


    /*
     * ============================================================
     * 13. Generate first question
     * ============================================================
     */

    const {
        question, conversationTurn
    } = await generateQuestion({

        interviewSessionId:
            session.id,

        sequenceNumber:
            1,

        resumeId:
            session.resumeId,

        candidateProfile,

        interviewConfiguration:
            configuration,

        interviewPlan,

        progress,

        claim:
            firstClaim,

        assessment:
            firstAssessment,

        decision:
            initialDecision,

        interviewState,

        reasoning:
            DEFAULT_INTERVIEW_REASONING,

        investigationIntent:
            initialInvestigationIntent,
    });


    /*
     * ============================================================
     * 14. Activate interview
     * ============================================================
     */

    await interviewSessionRepository
        .updateInterviewSession(
            session.id,
            {
                status:
                    InterviewSessionStatus.ACTIVE,

                startedAt:
                    new Date(),
            }
        );


    /*
     * ============================================================
     * 15. Return first question
     * ============================================================
     */

    return {

        sessionId:
            session.id,

        question,

        turnId: conversationTurn.id
    };
};


/*
|--------------------------------------------------------------------------
| Submit Answer
|--------------------------------------------------------------------------
*/

export const submitAnswer = async (
    data: SubmitAnswerDto
) => {

    /*
     * ============================================================
     * 1. Load Session
     * ============================================================
     */

    const session =
        await interviewSessionRepository
            .findInterviewSessionWithCandidateProfile(
                data.sessionId
            );


    if (!session) {

        throw new NotFoundError(
            `Interview session ${data.sessionId} was not found.`
        );
    }


    if (
        session.status !==
        InterviewSessionStatus.ACTIVE
    ) {

        throw new Error(
            `Interview session ${data.sessionId} is not active.`
        );
    }


    /*
     * ============================================================
     * 2. Load Session State
     * ============================================================
     */

    const configuration =
        fromPrismaJson<InterviewConfiguration>(
            session.interviewConfiguration
        );


    const interviewPlan =
        fromPrismaJson<InterviewPlan>(
            session.interviewPlan
        );


    const progress =
        fromPrismaJson<SessionProgress>(
            session.sessionProgress
        );


    /*
     * ============================================================
     * 3. Find Current Stage
     * ============================================================
     */

    const currentStage:
        InterviewStage | undefined =
        interviewPlan.stages[
            progress.currentStageIndex
        ];


    if (!currentStage) {

        throw new Error(
            `Interview stage ${progress.currentStageIndex} was not found.`
        );
    }


    /*
     * ============================================================
     * 4. Get Current Brain State
     * ============================================================
     */

    const interviewState:
        InterviewState =
        progress.interviewState;


    /*
     * IMPORTANT:
     *
     * This is the claim that produced the question being answered.
     * It must remain stable for the entire submitAnswer() operation.
     */

    const answeredClaimId:
        string | null =
        interviewState.currentClaimId;


    if (!answeredClaimId) {

        throw new Error(
            "Interview Brain has no current claim to evaluate."
        );
    }


    /*
     * ============================================================
     * 5. Find Answered Claim
     * ============================================================
     */

    const currentClaim:
        ResumeClaim | undefined =
        progress
            .candidateModel
            .claims
            .find(
                (claim: ResumeClaim) =>
                    claim.id ===
                    answeredClaimId
            );


    if (!currentClaim) {

        throw new Error(
            `Current claim ${answeredClaimId} was not found in Candidate Model.`
        );
    }


    /*
     * ============================================================
     * 6. Find Pending Conversation Turn
     * ============================================================
     */

    const conversationTurn =
    await conversationTurnService
        .getConversationTurnById(
            data.turnId
        );


if (!conversationTurn) {

    throw new NotFoundError(
        `Conversation turn "${data.turnId}" was not found.`
    );
}


/*
 * The turn must belong to this interview session.
 */

if (
    conversationTurn.interviewSessionId !==
    session.id
) {

    throw new Error(
        `Conversation turn "${data.turnId}" does not belong to interview session "${session.id}".`
    );
}


/*
 * A turn may only be answered once.
 *
 * This prevents duplicate voice/text submissions from
 * processing the same question twice.
 */

if (
    conversationTurn.status !==
    ConversationTurnStatus.PENDING
) {

    throw new Error(
        `Conversation turn "${data.turnId}" has already been processed.`
    );
}

    /*
     * ============================================================
     * 7. Restore Investigation Intent
     * ============================================================
     */

    const previousInvestigationIntent =
        conversationTurn.investigationIntent
            ? fromPrismaJson<InvestigationIntent>(
                conversationTurn.investigationIntent
            )
            : null;


    if (!previousInvestigationIntent) {

        throw new Error(
            `Conversation turn ${conversationTurn.id} does not contain an InvestigationIntent.`
        );
    }


    /*
     * ============================================================
     * 8. Save Candidate Answer
     * ============================================================
     */

    const updatedConversationTurn =
        await conversationTurnService
            .submitAnswer(
                conversationTurn.id,
                data.answer
            );


    /*
     * ============================================================
     * 9. Evaluate Answer
     * ============================================================
     */

    const evaluation:
        AnswerEvaluation =
        await generateAnswerEvaluation({

            targetRole:
                configuration.targetRole,

            topic:
                currentStage.topic,

            difficulty:
                currentStage.difficulty,

            question:
                updatedConversationTurn.question,

            answer:
                updatedConversationTurn.answer!,
        });


    await conversationTurnService
        .saveEvaluation(
            updatedConversationTurn.id,
            evaluation
        );


    /*
     * ============================================================
     * 10. Create Investigation Attempt
     * ============================================================
     *
     * This represents the question that was just answered.
     */

    const investigationAttempt =
        createInvestigationAttempt({

            turnId:
                updatedConversationTurn.id,

            claimId:
                previousInvestigationIntent.claimId,

            investigationArea:
                previousInvestigationIntent.investigationArea,

            objective:
                previousInvestigationIntent.objective,

            question:
                updatedConversationTurn.question,

            answer:
                updatedConversationTurn.answer!,

            evaluation,
        });


    /*
     * ============================================================
     * 11. Update Conversation State
     * ============================================================
     *
     * This describes the answer that was just evaluated.
     */

    const updatedConversationState =
        updateConversationState(

            interviewState.conversationState,

            {
                questionId:
                    updatedConversationTurn.id,

                question:
                    updatedConversationTurn.question,

                answer:
                    updatedConversationTurn.answer!,

                evaluation,

                attempt:
                    investigationAttempt,
            }
        );


    /*
     * ============================================================
     * 12. Update Claim Progress
     * ============================================================
     */

    let updatedClaimProgress =
        recordQuestion(
            interviewState.claimProgress,
            currentClaim.id
        );


    if (
        evaluation.score < 5
    ) {

        updatedClaimProgress =
            recordWeakAnswer(
                updatedClaimProgress,
                currentClaim.id
            );
    }


    /*
     * IMPORTANT:
     *
     * Record the area of the question that the candidate actually
     * answered. Do NOT record the next question's investigation
     * area here.
     */

    updatedClaimProgress =
        recordInvestigationArea(
            updatedClaimProgress,
            previousInvestigationIntent.claimId,
            previousInvestigationIntent.investigationArea
        );


    /*
     * ============================================================
     * 13. Create Claim Assessment
     * ============================================================
     */

    const assessment:
        ClaimAssessment =
        createClaimAssessment({

            claimId:
                currentClaim.id,

            turnId:
                updatedConversationTurn.id,

            evaluation,
        });


    /*
     * ============================================================
     * 14. Update Candidate Model
     * ============================================================
     */

    const updatedCandidateModel:
        CandidateModel =
        updateCandidateModel(

            progress.candidateModel,

            assessment
        );


    /*
     * ============================================================
     * 15. Create State Before Brain Decision
     * ============================================================
     */

    const stateBeforeDecision:
        InterviewState = {

        ...interviewState,

        claimProgress:
            updatedClaimProgress,

        investigationAttempts: [
            ...interviewState.investigationAttempts,

            investigationAttempt,
        ],

        conversationState:
            updatedConversationState,
    };


    /*
     * ============================================================
     * 16. Create Progress Before Brain Decision
     * ============================================================
     */

    const progressBeforeDecision:
        SessionProgress = {

        ...progress,

        candidateModel:
            updatedCandidateModel,

        interviewState:
            stateBeforeDecision,
    };


    /*
     * ============================================================
     * 17. Brain Decision
     * ============================================================
     */

    const decision:
        InterviewDecision =
        decideNextAction({

            candidateModel:
                updatedCandidateModel,

            interviewState:
                stateBeforeDecision,

            latestEvaluation:
                evaluation,

            currentStage,

            targetRole:
                configuration.targetRole,

            claimRelationships:
                interviewPlan.claimRelationships,
        });


    /*
     * ============================================================
     * 18. Apply Brain Decision
     * ============================================================
     */

    let updatedInterviewState:
        InterviewState =
        applyInterviewDecision(

            stateBeforeDecision,

            decision
        );


    /*
     * ============================================================
     * 19. Finish Interview
     * ============================================================
     */

    if (
        decision.type ===
        InterviewDecisionType.FINISH_INTERVIEW
    ) {

        const finishedProgress:
            SessionProgress = {

            ...progressBeforeDecision,

            currentStageIndex:
                progress.currentStageIndex,

            currentQuestionIndex:
                progress.currentQuestionIndex + 1,

            completedQuestions:
                progress.completedQuestions + 1,

            candidateModel:
                updatedCandidateModel,

            interviewState:
                updatedInterviewState,
        };


        await interviewSessionService
            .updateSessionProgress(
                session.id,
                finishedProgress
            );


        await interviewSessionService
            .completeInterview(
                session.id
            );


        return {

            evaluation,

            assessment,

            decision,

            interviewCompleted:
                true,

            progress:
                finishedProgress,
        };
    }


    /*
     * ============================================================
     * 20. Determine Next Stage
     * ============================================================
     */

    let nextStageIndex:
        number =
        progress.currentStageIndex;


    let nextInterviewState:
        InterviewState =
        updatedInterviewState;


    if (
        decision.type ===
        InterviewDecisionType.MOVE_TO_NEXT_STAGE
    ) {

        nextStageIndex =
            progress.currentStageIndex + 1;


        let nextStage:
            InterviewStage | undefined;


        let nextStageClaimIds:
            string[] = [];


        while (
            nextStageIndex <
            interviewPlan.stages.length
        ) {

            const candidateStage =
                interviewPlan.stages[
                    nextStageIndex
                ];


            if (!candidateStage) {

                nextStageIndex++;

                continue;
            }


            const candidateStageClaimIds =
                candidateStage.claims
                    .map(
                        (stageClaim) =>
                            stageClaim.claimId
                    )
                    .filter(
                        (claimId) =>
                            updatedCandidateModel
                                .claims
                                .some(
                                    (claim) =>
                                        claim.id ===
                                        claimId
                                )
                    );


            if (
                candidateStageClaimIds.length === 0
            ) {

                console.log(
                    `Skipping planner stage "${candidateStage.topic}" because it contains no valid resume claims.`
                );


                nextStageIndex++;

                continue;
            }


            nextStage =
                candidateStage;


            nextStageClaimIds =
                candidateStageClaimIds;


            break;
        }


        /*
         * ==========================================================
         * No stages remain
         * ==========================================================
         */

        if (!nextStage) {

            const finishedProgress:
                SessionProgress = {

                ...progressBeforeDecision,

                currentStageIndex:
                    nextStageIndex,

                currentQuestionIndex:
                    progress.currentQuestionIndex + 1,

                completedQuestions:
                    progress.completedQuestions + 1,

                candidateModel:
                    updatedCandidateModel,

                interviewState:
                    updatedInterviewState,
            };


            await interviewSessionService
                .updateSessionProgress(
                    session.id,
                    finishedProgress
                );


            await interviewSessionService
                .completeInterview(
                    session.id
                );


            return {

                evaluation,

                assessment,

                decision,

                interviewCompleted:
                    true,

                progress:
                    finishedProgress,
            };
        }


        /*
         * ==========================================================
         * Select first claim in next stage
         * ==========================================================
         */

        const nextStageSelection =
            selectNextClaim({

                claims:
                    updatedCandidateModel.claims,

                claimAssessments:
                    updatedCandidateModel.claimAssessments,

                currentClaimId:
                    null,

                remainingClaimIds:
                    nextStageClaimIds,

                completedClaimIds:
                    updatedInterviewState.completedClaimIds,

                pendingFollowUpClaimIds:
                    updatedInterviewState.pendingFollowUpClaimIds,

                currentStage:
                    nextStage,

                targetRole:
                    configuration.targetRole,

                claimRelationships:
                    interviewPlan.claimRelationships,
            });


        /*
         * ==========================================================
         * Defensive fallback
         * ==========================================================
         */

        if (!nextStageSelection.claim) {

            let fallbackStageIndex =
                nextStageIndex + 1;


            let fallbackStage:
                InterviewStage | undefined;


            let fallbackClaimIds:
                string[] = [];


            while (
                fallbackStageIndex <
                interviewPlan.stages.length
            ) {

                const candidateStage =
                    interviewPlan.stages[
                        fallbackStageIndex
                    ];


                if (!candidateStage) {

                    fallbackStageIndex++;

                    continue;
                }


                const candidateClaimIds =
                    candidateStage.claims
                        .map(
                            (stageClaim) =>
                                stageClaim.claimId
                        )
                        .filter(
                            (claimId) =>
                                updatedCandidateModel
                                    .claims
                                    .some(
                                        (claim) =>
                                            claim.id ===
                                            claimId
                                    )
                        );


                if (
                    candidateClaimIds.length === 0
                ) {

                    fallbackStageIndex++;

                    continue;
                }


                const fallbackSelection =
                    selectNextClaim({

                        claims:
                            updatedCandidateModel.claims,

                        claimAssessments:
                            updatedCandidateModel
                                .claimAssessments,

                        currentClaimId:
                            null,

                        remainingClaimIds:
                            candidateClaimIds,

                        completedClaimIds:
                            updatedInterviewState
                                .completedClaimIds,

                        pendingFollowUpClaimIds:
                            updatedInterviewState
                                .pendingFollowUpClaimIds,

                        currentStage:
                            candidateStage,

                        targetRole:
                            configuration.targetRole,

                        claimRelationships:
                            interviewPlan.claimRelationships,
                    });


                if (
                    fallbackSelection.claim
                ) {

                    fallbackStage =
                        candidateStage;


                    fallbackClaimIds =
                        candidateClaimIds;


                    nextStageIndex =
                        fallbackStageIndex;


                    break;
                }


                fallbackStageIndex++;
            }


            /*
             * No fallback stage.
             */

            if (
                !fallbackStage
            ) {

                const finishedProgress:
                    SessionProgress = {

                    ...progressBeforeDecision,

                    currentStageIndex:
                        interviewPlan.stages.length,

                    currentQuestionIndex:
                        progress.currentQuestionIndex + 1,

                    completedQuestions:
                        progress.completedQuestions + 1,

                    candidateModel:
                        updatedCandidateModel,

                    interviewState:
                        updatedInterviewState,
                };


                await interviewSessionService
                    .updateSessionProgress(
                        session.id,
                        finishedProgress
                    );


                await interviewSessionService
                    .completeInterview(
                        session.id
                    );


                return {

                    evaluation,

                    assessment,

                    decision,

                    interviewCompleted:
                        true,

                    progress:
                        finishedProgress,
                };
            }


            nextStage =
                fallbackStage;


            nextStageClaimIds =
                fallbackClaimIds;
        }


        /*
         * ==========================================================
         * Re-select after fallback
         * ==========================================================
         */

        const selectedNextClaim =
            selectNextClaim({

                claims:
                    updatedCandidateModel.claims,

                claimAssessments:
                    updatedCandidateModel.claimAssessments,

                currentClaimId:
                    null,

                remainingClaimIds:
                    nextStageClaimIds,

                completedClaimIds:
                    updatedInterviewState.completedClaimIds,

                pendingFollowUpClaimIds:
                    updatedInterviewState.pendingFollowUpClaimIds,

                currentStage:
                    nextStage,

                targetRole:
                    configuration.targetRole,

                claimRelationships:
                    interviewPlan.claimRelationships,
            });


        if (!selectedNextClaim.claim) {

            throw new Error(
                `Unable to select a claim for planner stage "${nextStage.topic}".`
            );
        }


        const nextStageClaim:
            ResumeClaim =
            selectedNextClaim.claim;


        /*
         * Remove selected claim from remaining claims.
         */

        const nextRemainingClaimIds =
            nextStageClaimIds.filter(
                (claimId) =>
                    claimId !==
                    nextStageClaim.id
            );


        /*
         * Initialize state for new stage.
         */

        nextInterviewState = {

            ...updatedInterviewState,

            currentStage:
                nextStage.id,

            currentClaimId:
                nextStageClaim.id,

            remainingClaimIds:
                nextRemainingClaimIds,

            pendingFollowUpClaimIds:
                [],

            completedClaimIds:
                updatedInterviewState.completedClaimIds,
        };
    }


    /*
     * ============================================================
     * 21. Update Question Progress
     * ============================================================
     */

    const updatedProgress:
        SessionProgress = {

        ...progressBeforeDecision,

        currentStageIndex:
            nextStageIndex,

        currentQuestionIndex:
            progress.currentQuestionIndex + 1,

        completedQuestions:
            progress.completedQuestions + 1,

        candidateModel:
            updatedCandidateModel,

        interviewState:
            nextInterviewState,
    };


    /*
     * ============================================================
     * 22. Determine Next Claim
     * ============================================================
     */

    const nextClaimId:
        string | null =
        nextInterviewState.currentClaimId;


    if (!nextClaimId) {

        throw new Error(
            "Brain decision produced no current claim."
        );
    }


    /*
     * ============================================================
     * 23. Find Next Claim
     * ============================================================
     */

    const nextClaim:
        ResumeClaim | undefined =
        updatedCandidateModel
            .claims
            .find(
                (claim: ResumeClaim) =>
                    claim.id ===
                    nextClaimId
            );


    if (!nextClaim) {

        throw new Error(
            `Next claim ${nextClaimId} was not found.`
        );
    }


    /*
     * ============================================================
     * 24. Get Assessment for Next Claim
     * ============================================================
     */

    const nextAssessment:
        ClaimAssessment | undefined =
        updatedCandidateModel
            .claimAssessments
            .find(
                (assessment: ClaimAssessment) =>
                    assessment.claimId ===
                    nextClaim.id
            );


    if (!nextAssessment) {

        throw new Error(
            `No assessment found for claim ${nextClaim.id}`
        );
    }


    /*
     * ============================================================
     * 25. Load Candidate Profile
     * ============================================================
     */

    const candidateProfile =
        fromPrismaJson<CandidateAnalysis>(
            session
                .candidateProfile
                .candidateAnalysis
        );


    /*
     * ============================================================
     * 26. Build Question Context
     * ============================================================
     */

    const interviewContext =
        await buildQuestionContext({

            interviewSessionId:
                session.id,

            resumeId:
                session.resumeId,

            candidateProfile:
                candidateProfile,

            interviewConfiguration:
                configuration,

            interviewPlan,

            progress:
                updatedProgress,

            claim:
                nextClaim,
        });


    /*
     * ============================================================
     * 27. Generate Interview Reasoning
     * ============================================================
     */

    const reasoning =
        await generateInterviewReasoning({

            interviewContext,

            evaluation,

            decision,

            claim:
                nextClaim,

            assessment:
                nextAssessment,
        });


    /*
     * ============================================================
     * 28. Build Investigation Intent
     * ============================================================
     */

    const nextClaimProgress =
        updatedClaimProgress.find(
            (claimProgress) =>
                claimProgress.claimId ===
                nextClaim.id
        );


    const investigationIntent =
        buildInvestigationIntent(

            decision,

            reasoning,

            nextClaim,

            nextAssessment,

            nextClaimProgress?.investigatedAreas ?? []
        );


    validateInvestigationIntent(
        investigationIntent
    );


    /*
     * ============================================================
     * 29. Sync Conversation State With Next Investigation
     * ============================================================
     *
     * updateConversationState() describes the answer that was
     * just evaluated.
     *
     * investigationIntent describes what the next question is
     * intended to investigate.
     *
     * Therefore missingEvidence now advances to the next intent.
     */

    nextInterviewState = {

        ...nextInterviewState,

        conversationState: {

            ...nextInterviewState.conversationState,

            missingEvidence:
                investigationIntent.requiredEvidence,
        },
    };


    /*
     * ============================================================
     * 30. Final Interview State
     * ============================================================
     */

    nextInterviewState = {

        ...nextInterviewState,

        claimProgress:
            updatedClaimProgress,
    };


    /*
     * ============================================================
     * 31. Create Final Progress
     * ============================================================
     */

    const finalProgress:
        SessionProgress = {

        ...updatedProgress,

        interviewState:
            nextInterviewState,
    };


    /*
     * ============================================================
     * 32. Persist Final State
     * ============================================================
     */

    await interviewSessionService
        .updateSessionProgress(
            session.id,
            finalProgress
        );


    /*
     * ============================================================
     * 33. Generate Next Question
     * ============================================================
     */

    const {
        question: nextQuestion, conversationTurn: nextConversationTurn
    } = await generateQuestion({

        interviewSessionId:
            session.id,

        sequenceNumber:
            conversationTurn.sequenceNumber + 1,

        resumeId:
            session.resumeId,

        candidateProfile:
            candidateProfile,

        interviewConfiguration:
            configuration,

        interviewPlan,

        progress:
            finalProgress,

        claim:
            nextClaim,

        assessment:
            nextAssessment,

        decision,

        interviewState:
            nextInterviewState,

        reasoning,

        investigationIntent,
    });


    /*
     * ============================================================
     * 34. Return Result
     * ============================================================
     */

    return {

        evaluation,

        assessment,

        decision,

        nextQuestion,

        nextTurnId: nextConversationTurn.id,

        progress:
            finalProgress,

        interviewCompleted:
            false,
    };
};