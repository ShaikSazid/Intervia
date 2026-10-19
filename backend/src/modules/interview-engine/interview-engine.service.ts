import {
    InterviewSessionStatus,
    ConversationTurnStatus,
} from "../../generated/prisma/enums.js";

import {
    buildDeterministicReasoning,
    isAnswerEvasive,
} from "../interview-reasoning/deterministic-reasoning.js";

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

import { NotFoundError } from "../../errors/NotFoundError.js";

import * as conversationTurnService from "../conversation-turn/conversation-turn.service.js";

import { SubmitAnswerDto } from "./interview-engine.dto.js";

import { generateAnswerEvaluation } from "../answer-evaluation/answer-evaluation.agent.js";

import * as interviewSessionService from "../interview-session/session.service.js";

import * as interviewSessionRepository from "../interview-session/session.repository.js";

import { generateInterviewQuestion } from "./interview-engine.agent.js";

import { AnswerEvaluation } from "../answer-evaluation/answer-evaluation.types.js";

import { fromPrismaJson } from "../../common/utils/prisma-json.js";

import { CandidateAnalysis } from "../candidate-profile/candidate-profile.types.js";

import {
    InterviewPlan,
    InterviewStage,
} from "../interview-planner/planner.types.js";

import {
    InterviewConfiguration,
    SessionProgress,
} from "../interview-session/session.types.js";

import {
    buildQuestionContext,
    retrieveQuestionContextData,
} from "./interview-engine.context.js";

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

const generateQuestion = async (params: {
    interviewSessionId: string;
    sequenceNumber: number;
    interviewContext: Awaited<ReturnType<typeof buildQuestionContext>>;
    claim: ResumeClaim;
    assessment: ClaimAssessment;
    decision: InterviewDecision;
    interviewState: InterviewState;
    reasoning: InterviewReasoning;
    investigationIntent: InvestigationIntent;
}) => {
    const question = await generateInterviewQuestion({
        interviewContext: params.interviewContext,
        reasoning: params.reasoning,
        claim: params.claim,
        assessment: params.assessment,
        decision: params.decision,
        interviewState: params.interviewState,
        investigationIntent: params.investigationIntent,
    });

    const conversationTurn = await conversationTurnService.createConversationTurn({
        interviewSessionId: params.interviewSessionId,
        sequenceNumber: params.sequenceNumber,
        question: question.question,
        status: ConversationTurnStatus.PENDING,
        startedAt: new Date(),
        investigationIntent: params.investigationIntent,
    });

    return {
        question,
        conversationTurn,
    };
};

export const startInterview = async (sessionId: string) => {
    const session = await interviewSessionRepository.findInterviewSessionWithCandidateProfile(sessionId);

    if (!session) {
        throw new NotFoundError(`Interview session ${sessionId} was not found`);
    }

    if (session.status !== InterviewSessionStatus.PENDING) {
        throw new Error(`Interview session ${sessionId} is already ${session.status}`);
    }

    const candidateProfile = fromPrismaJson<CandidateAnalysis>(
        session.candidateProfile.candidateAnalysis
    );

    const configuration = fromPrismaJson<InterviewConfiguration>(
        session.interviewConfiguration
    );

    const interviewPlan = fromPrismaJson<InterviewPlan>(
        session.interviewPlan
    );

    let progress = fromPrismaJson<SessionProgress>(
        session.sessionProgress
    );

    const candidateModel: CandidateModel = progress.candidateModel;

    if (!candidateModel) {
        throw new Error("Interview session does not contain a Candidate Model.");
    }

    if (!candidateModel.claims || candidateModel.claims.length === 0) {
        throw new Error("Unable to start interview: no resume claims were found.");
    }

    let firstStageIndex = 0;
    let firstStage: InterviewStage | undefined;

    while (firstStageIndex < interviewPlan.stages.length) {
        const candidateStage = interviewPlan.stages[firstStageIndex];

        if (!candidateStage) {
            break;
        }

        const stageClaimIds = candidateStage.claims
            .map((stageClaim) => stageClaim.claimId)
            .filter((claimId) =>
                candidateModel.claims.some((claim) => claim.id === claimId)
            );

        if (stageClaimIds.length > 0) {
            firstStage = candidateStage;
            break;
        }

        console.log(
            `Skipping planner stage "${candidateStage.topic}" because it contains no valid resume claims.`
        );

        firstStageIndex++;
    }

    if (!firstStage) {
        throw new Error(
            "Unable to start interview: no planner stage contains valid resume claims."
        );
    }

    const firstStageClaimIds = firstStage.claims
        .map((stageClaim) => stageClaim.claimId)
        .filter((claimId) =>
            candidateModel.claims.some((claim) => claim.id === claimId)
        );

    const selection = selectNextClaim({
        claims: candidateModel.claims,
        claimAssessments: candidateModel.claimAssessments,
        currentClaimId: null,
        remainingClaimIds: firstStageClaimIds,
        completedClaimIds: [],
        pendingFollowUpClaimIds: [],
        currentStage: firstStage,
        targetRole: configuration.targetRole,
        claimRelationships: interviewPlan.claimRelationships,
    });

    if (!selection.claim) {
        throw new Error(
            `Unable to start interview: no eligible claim was found in planner stage "${firstStage.topic}".`
        );
    }

    const firstClaim: ResumeClaim = selection.claim;

    const interviewState: InterviewState = {
        currentStage: firstStage.id,
        currentClaimId: firstClaim.id,
        remainingClaimIds: firstStageClaimIds.filter(
            (claimId) => claimId !== firstClaim.id
        ),
        pendingFollowUpClaimIds: [],
        completedClaimIds: [],
        claimProgress: candidateModel.claims.map((claim) => ({
            claimId: claim.id,
            questionCount: 0,
            weakAnswerCount: 0,
            followUpCount: 0,
            probeCount: 0,
            investigatedAreas: [],
        })),
        investigationAttempts: [],
        conversationState: {
            mode: "CLAIM_INVESTIGATION",
            currentThread: null,
            threadStatus: "OPEN",
            demonstratedEvidence: [],
            missingEvidence: [],
            failedAttempts: 0,
            recentQuestionIds: [],
            recentQuestionTexts: [],
            recentAnswerTexts: [],
            unresolvedContradictions: [],
            candidateFrustrated: false,
        },
    };

    const firstAssessment: ClaimAssessment | undefined =
        candidateModel.claimAssessments.find(
            (assessment: ClaimAssessment) => assessment.claimId === firstClaim.id
        );

    if (!firstAssessment) {
        throw new Error(`No assessment found for claim ${firstClaim.id}`);
    }

    const initialDecision: InterviewDecision = {
        type: InterviewDecisionType.MOVE_TO_NEXT_CLAIM,
        claimId: firstClaim.id,
        reason: `Begin investigation of resume claim "${firstClaim.title}".`,
    };

    progress = {
        ...progress,
        currentStageIndex: firstStageIndex,
        currentQuestionIndex: 0,
        candidateModel,
        interviewState,
    };

    await interviewSessionService.updateSessionProgress(session.id, progress);

    const initialClaimProgress = interviewState.claimProgress.find(
        (claimProgress) => claimProgress.claimId === firstClaim.id
    );

    const initialInvestigationIntent = buildInvestigationIntent(
        initialDecision,
        DEFAULT_INTERVIEW_REASONING,
        firstClaim,
        firstAssessment,
        initialClaimProgress?.investigatedAreas ?? []
    );

    validateInvestigationIntent(initialInvestigationIntent);

    const initialContextStart = performance.now();

    const initialContextData = await retrieveQuestionContextData({
        interviewSessionId: session.id,
        resumeId: session.resumeId,
        interviewPlan,
        progress,
        claim: firstClaim,
    });

    console.log(
        `[InterviewTiming] Retrieve initial question context data: ${(performance.now() - initialContextStart).toFixed(0)}ms`
    );

    const initialInterviewContext = buildQuestionContext({
        interviewSessionId: session.id,
        resumeId: session.resumeId,
        candidateProfile,
        interviewConfiguration: configuration,
        interviewPlan,
        progress,
        claim: firstClaim,
        ...initialContextData,
    });

    const { question, conversationTurn } = await generateQuestion({
        interviewSessionId: session.id,
        sequenceNumber: 1,
        interviewContext: initialInterviewContext,
        claim: firstClaim,
        assessment: firstAssessment,
        decision: initialDecision,
        interviewState,
        reasoning: DEFAULT_INTERVIEW_REASONING,
        investigationIntent: initialInvestigationIntent,
    });

    await interviewSessionRepository.updateInterviewSession(session.id, {
        status: InterviewSessionStatus.ACTIVE,
        startedAt: new Date(),
    });

    return {
        sessionId: session.id,
        question,
        turnId: conversationTurn.id,
    };
};

export const submitAnswer = async (data: SubmitAnswerDto) => {
    const totalStart = performance.now();

    const session = await interviewSessionRepository.findInterviewSessionWithCandidateProfile(
        data.sessionId
    );

    if (!session) {
        throw new NotFoundError(`Interview session ${data.sessionId} was not found.`);
    }

    if (session.status !== InterviewSessionStatus.ACTIVE) {
        throw new Error(`Interview session ${data.sessionId} is not active.`);
    }

    const configuration = fromPrismaJson<InterviewConfiguration>(
        session.interviewConfiguration
    );

    const interviewPlan = fromPrismaJson<InterviewPlan>(
        session.interviewPlan
    );

    const progress = fromPrismaJson<SessionProgress>(
        session.sessionProgress
    );

    const currentStage: InterviewStage | undefined =
        interviewPlan.stages[progress.currentStageIndex];

    if (!currentStage) {
        throw new Error(
            `Interview stage ${progress.currentStageIndex} was not found.`
        );
    }

    const interviewState: InterviewState = progress.interviewState;

    const answeredClaimId: string | null = interviewState.currentClaimId;

    if (!answeredClaimId) {
        throw new Error("Interview Brain has no current claim to evaluate.");
    }

    const currentClaim: ResumeClaim | undefined =
        progress.candidateModel.claims.find(
            (claim: ResumeClaim) => claim.id === answeredClaimId
        );

    if (!currentClaim) {
        throw new Error(
            `Current claim ${answeredClaimId} was not found in Candidate Model.`
        );
    }

    const conversationTurn = await conversationTurnService.getConversationTurnById(
        data.turnId
    );

    if (!conversationTurn) {
        throw new NotFoundError(
            `Conversation turn "${data.turnId}" was not found.`
        );
    }

    if (conversationTurn.interviewSessionId !== session.id) {
        throw new Error(
            `Conversation turn "${data.turnId}" does not belong to interview session "${session.id}".`
        );
    }

    if (conversationTurn.status !== ConversationTurnStatus.PENDING) {
        throw new Error(
            `Conversation turn "${data.turnId}" has already been processed.`
        );
    }

    const previousInvestigationIntent = conversationTurn.investigationIntent
        ? fromPrismaJson<InvestigationIntent>(conversationTurn.investigationIntent)
        : null;

    if (!previousInvestigationIntent) {
        throw new Error(
            `Conversation turn ${conversationTurn.id} does not contain an InvestigationIntent.`
        );
    }

    const saveAnswerStart = performance.now();

    const updatedConversationTurn = await conversationTurnService.submitAnswer(
        conversationTurn.id,
        data.answer
    );

    console.log(
        `[InterviewTiming] Save answer: ${(performance.now() - saveAnswerStart).toFixed(0)}ms`
    );

    const candidateAnswer = updatedConversationTurn.answer || "";
    const isEvasive = isAnswerEvasive(candidateAnswer);

    const evaluation: AnswerEvaluation = {
        score: isEvasive ? 2 : 7,
        strengths: isEvasive ? [] : ["Answered prompt directly"],
        weaknesses: isEvasive ? ["Indicated lack of recall or evasive response"] : [],
        feedback: isEvasive ? "Candidate did not remember." : "Conversational turn processed.",
        followUpRequired: isEvasive,
        suggestedDifficulty: isEvasive ? "EASY" : "MEDIUM",
        answerBehavior: isEvasive ? "DONT_REMEMBER" : "STRONG",
    };

    setImmediate(async () => {
        try {
            const deepEvaluation = await generateAnswerEvaluation({
                targetRole: configuration.targetRole,
                topic: currentStage.topic,
                difficulty: currentStage.difficulty,
                question: updatedConversationTurn.question,
                answer: candidateAnswer,
            });
            await conversationTurnService.saveEvaluation(
                updatedConversationTurn.id,
                deepEvaluation
            );
        } catch (err) {
            console.error("[Background Evaluation Failed]:", err);
        }
    });

    const investigationAttempt = createInvestigationAttempt({
        turnId: updatedConversationTurn.id,
        claimId: previousInvestigationIntent.claimId,
        investigationArea: previousInvestigationIntent.investigationArea,
        objective: previousInvestigationIntent.objective,
        question: updatedConversationTurn.question,
        answer: candidateAnswer,
        evaluation,
    });

    const updatedConversationState = updateConversationState(
        interviewState.conversationState,
        {
            questionId: updatedConversationTurn.id,
            question: updatedConversationTurn.question,
            answer: candidateAnswer,
            evaluation,
            attempt: investigationAttempt,
        }
    );

    let updatedClaimProgress = recordQuestion(
        interviewState.claimProgress,
        currentClaim.id
    );

    if (evaluation.score < 5) {
        updatedClaimProgress = recordWeakAnswer(
            updatedClaimProgress,
            currentClaim.id
        );
    }

    updatedClaimProgress = recordInvestigationArea(
        updatedClaimProgress,
        previousInvestigationIntent.claimId,
        previousInvestigationIntent.investigationArea
    );

    const assessment: ClaimAssessment = createClaimAssessment({
        claimId: currentClaim.id,
        turnId: updatedConversationTurn.id,
        evaluation,
    });

    const updatedCandidateModel: CandidateModel = updateCandidateModel(
        progress.candidateModel,
        assessment
    );

    const stateBeforeDecision: InterviewState = {
        ...interviewState,
        claimProgress: updatedClaimProgress,
        investigationAttempts: [
            ...interviewState.investigationAttempts,
            investigationAttempt,
        ],
        conversationState: updatedConversationState,
    };

    const progressBeforeDecision: SessionProgress = {
        ...progress,
        candidateModel: updatedCandidateModel,
        interviewState: stateBeforeDecision,
    };

    const currentClaimStatus = updatedClaimProgress.find(
        (cp) => cp.claimId === currentClaim.id
    );

    let decision: InterviewDecision;

    if (isEvasive && (currentClaimStatus?.weakAnswerCount ?? 0) >= 2) {
        decision = {
            type: InterviewDecisionType.MOVE_TO_NEXT_CLAIM,
            claimId: currentClaim.id,
            reason: "Candidate indicated lack of recall multiple times; gracefully moving to next claim.",
        };
    } else {
        decision = decideNextAction({
            candidateModel: updatedCandidateModel,
            interviewState: stateBeforeDecision,
            latestEvaluation: evaluation,
            currentStage,
            targetRole: configuration.targetRole,
            claimRelationships: interviewPlan.claimRelationships,
        });
    }

    let updatedInterviewState: InterviewState = applyInterviewDecision(
        stateBeforeDecision,
        decision
    );

    if (decision.type === InterviewDecisionType.FINISH_INTERVIEW) {
        const finishedProgress: SessionProgress = {
            ...progressBeforeDecision,
            currentStageIndex: progress.currentStageIndex,
            currentQuestionIndex: progress.currentQuestionIndex + 1,
            completedQuestions: progress.completedQuestions + 1,
            candidateModel: updatedCandidateModel,
            interviewState: updatedInterviewState,
        };

        await interviewSessionService.updateSessionProgress(
            session.id,
            finishedProgress
        );

        await interviewSessionService.completeInterview(session.id);

        return {
            evaluation,
            assessment,
            decision,
            interviewCompleted: true,
            progress: finishedProgress,
        };
    }

    let nextStageIndex: number = progress.currentStageIndex;
    let nextInterviewState: InterviewState = updatedInterviewState;

    if (decision.type === InterviewDecisionType.MOVE_TO_NEXT_STAGE) {
        nextStageIndex = progress.currentStageIndex + 1;

        let nextStage: InterviewStage | undefined;
        let nextStageClaimIds: string[] = [];

        while (nextStageIndex < interviewPlan.stages.length) {
            const candidateStage = interviewPlan.stages[nextStageIndex];

            if (!candidateStage) {
                nextStageIndex++;
                continue;
            }

            const candidateStageClaimIds = candidateStage.claims
                .map((stageClaim) => stageClaim.claimId)
                .filter((claimId) =>
                    updatedCandidateModel.claims.some(
                        (claim) => claim.id === claimId
                    )
                );

            if (candidateStageClaimIds.length === 0) {
                console.log(
                    `Skipping planner stage "${candidateStage.topic}" because it contains no valid resume claims.`
                );
                nextStageIndex++;
                continue;
            }

            nextStage = candidateStage;
            nextStageClaimIds = candidateStageClaimIds;
            break;
        }

        if (!nextStage) {
            const finishedProgress: SessionProgress = {
                ...progressBeforeDecision,
                currentStageIndex: nextStageIndex,
                currentQuestionIndex: progress.currentQuestionIndex + 1,
                completedQuestions: progress.completedQuestions + 1,
                candidateModel: updatedCandidateModel,
                interviewState: updatedInterviewState,
            };

            await interviewSessionService.updateSessionProgress(
                session.id,
                finishedProgress
            );

            await interviewSessionService.completeInterview(session.id);

            return {
                evaluation,
                assessment,
                decision,
                interviewCompleted: true,
                progress: finishedProgress,
            };
        }

        const nextStageSelection = selectNextClaim({
            claims: updatedCandidateModel.claims,
            claimAssessments: updatedCandidateModel.claimAssessments,
            currentClaimId: null,
            remainingClaimIds: nextStageClaimIds,
            completedClaimIds: updatedInterviewState.completedClaimIds,
            pendingFollowUpClaimIds: updatedInterviewState.pendingFollowUpClaimIds,
            currentStage: nextStage,
            targetRole: configuration.targetRole,
            claimRelationships: interviewPlan.claimRelationships,
        });

        if (!nextStageSelection.claim) {
            let fallbackStageIndex = nextStageIndex + 1;
            let fallbackStage: InterviewStage | undefined;
            let fallbackClaimIds: string[] = [];

            while (fallbackStageIndex < interviewPlan.stages.length) {
                const candidateStage = interviewPlan.stages[fallbackStageIndex];

                if (!candidateStage) {
                    fallbackStageIndex++;
                    continue;
                }

                const candidateClaimIds = candidateStage.claims
                    .map((stageClaim) => stageClaim.claimId)
                    .filter((claimId) =>
                        updatedCandidateModel.claims.some(
                            (claim) => claim.id === claimId
                        )
                    );

                if (candidateClaimIds.length === 0) {
                    fallbackStageIndex++;
                    continue;
                }

                const fallbackSelection = selectNextClaim({
                    claims: updatedCandidateModel.claims,
                    claimAssessments: updatedCandidateModel.claimAssessments,
                    currentClaimId: null,
                    remainingClaimIds: candidateClaimIds,
                    completedClaimIds: updatedInterviewState.completedClaimIds,
                    pendingFollowUpClaimIds: updatedInterviewState.pendingFollowUpClaimIds,
                    currentStage: candidateStage,
                    targetRole: configuration.targetRole,
                    claimRelationships: interviewPlan.claimRelationships,
                });

                if (fallbackSelection.claim) {
                    fallbackStage = candidateStage;
                    fallbackClaimIds = candidateClaimIds;
                    nextStageIndex = fallbackStageIndex;
                    break;
                }

                fallbackStageIndex++;
            }

            if (!fallbackStage) {
                const finishedProgress: SessionProgress = {
                    ...progressBeforeDecision,
                    currentStageIndex: interviewPlan.stages.length,
                    currentQuestionIndex: progress.currentQuestionIndex + 1,
                    completedQuestions: progress.completedQuestions + 1,
                    candidateModel: updatedCandidateModel,
                    interviewState: updatedInterviewState,
                };

                await interviewSessionService.updateSessionProgress(
                    session.id,
                    finishedProgress
                );

                await interviewSessionService.completeInterview(session.id);

                return {
                    evaluation,
                    assessment,
                    decision,
                    interviewCompleted: true,
                    progress: finishedProgress,
                };
            }

            nextStage = fallbackStage;
            nextStageClaimIds = fallbackClaimIds;
        }

        const selectedNextClaim = selectNextClaim({
            claims: updatedCandidateModel.claims,
            claimAssessments: updatedCandidateModel.claimAssessments,
            currentClaimId: null,
            remainingClaimIds: nextStageClaimIds,
            completedClaimIds: updatedInterviewState.completedClaimIds,
            pendingFollowUpClaimIds: updatedInterviewState.pendingFollowUpClaimIds,
            currentStage: nextStage,
            targetRole: configuration.targetRole,
            claimRelationships: interviewPlan.claimRelationships,
        });

        if (!selectedNextClaim.claim) {
            throw new Error(
                `Unable to select a claim for planner stage "${nextStage.topic}".`
            );
        }

        const nextStageClaim: ResumeClaim = selectedNextClaim.claim;

        const nextRemainingClaimIds = nextStageClaimIds.filter(
            (claimId) => claimId !== nextStageClaim.id
        );

        nextInterviewState = {
            ...updatedInterviewState,
            currentStage: nextStage.id,
            currentClaimId: nextStageClaim.id,
            remainingClaimIds: nextRemainingClaimIds,
            pendingFollowUpClaimIds: [],
            completedClaimIds: updatedInterviewState.completedClaimIds,
        };
    }

    const updatedProgress: SessionProgress = {
        ...progressBeforeDecision,
        currentStageIndex: nextStageIndex,
        currentQuestionIndex: progress.currentQuestionIndex + 1,
        completedQuestions: progress.completedQuestions + 1,
        candidateModel: updatedCandidateModel,
        interviewState: nextInterviewState,
    };

    const nextClaimId: string | null = nextInterviewState.currentClaimId;

    if (!nextClaimId) {
        throw new Error("Brain decision produced no current claim.");
    }

    const nextClaim: ResumeClaim | undefined =
        updatedCandidateModel.claims.find(
            (claim: ResumeClaim) => claim.id === nextClaimId
        );

    if (!nextClaim) {
        throw new Error(`Next claim ${nextClaimId} was not found.`);
    }

    const nextAssessment: ClaimAssessment | undefined =
        updatedCandidateModel.claimAssessments.find(
            (assessment: ClaimAssessment) => assessment.claimId === nextClaim.id
        );

    if (!nextAssessment) {
        throw new Error(`No assessment found for claim ${nextClaim.id}`);
    }

    const candidateProfile = fromPrismaJson<CandidateAnalysis>(
        session.candidateProfile.candidateAnalysis
    );

    const contextStart = performance.now();

    const questionContextData = await retrieveQuestionContextData({
        interviewSessionId: session.id,
        resumeId: session.resumeId,
        interviewPlan,
        progress: updatedProgress,
        claim: nextClaim,
    });

    console.log(
        `[InterviewTiming] Retrieve question context data: ${(performance.now() - contextStart).toFixed(0)}ms`
    );

    const finalInterviewContext = buildQuestionContext({
        interviewSessionId: session.id,
        resumeId: session.resumeId,
        candidateProfile,
        interviewConfiguration: configuration,
        interviewPlan,
        progress: updatedProgress,
        claim: nextClaim,
        ...questionContextData,
    });

    const reasoningStart = performance.now();

    const reasoning: InterviewReasoning = buildDeterministicReasoning({
        interviewContext: finalInterviewContext,
        evaluation,
        decision,
        claim: nextClaim,
        assessment: nextAssessment,
    });

    console.log(
        `[InterviewTiming] Deterministic reasoning: ${(performance.now() - reasoningStart).toFixed(0)}ms`
    );

    const nextClaimProgress = updatedClaimProgress.find(
        (claimProgress) => claimProgress.claimId === nextClaim.id
    );

    const investigationIntent: InvestigationIntent = buildInvestigationIntent(
        decision,
        reasoning,
        nextClaim,
        nextAssessment,
        nextClaimProgress?.investigatedAreas ?? []
    );

    validateInvestigationIntent(investigationIntent);

    nextInterviewState = {
        ...nextInterviewState,
        conversationState: {
            ...nextInterviewState.conversationState,
            missingEvidence: investigationIntent.requiredEvidence,
        },
    };

    nextInterviewState = {
        ...nextInterviewState,
        claimProgress: updatedClaimProgress,
    };

    const finalProgress: SessionProgress = {
        ...updatedProgress,
        interviewState: nextInterviewState,
    };

    await interviewSessionService.updateSessionProgress(
        session.id,
        finalProgress
    );

    const finalRebuiltContext = buildQuestionContext({
        interviewSessionId: session.id,
        resumeId: session.resumeId,
        candidateProfile,
        interviewConfiguration: configuration,
        interviewPlan,
        progress: finalProgress,
        claim: nextClaim,
        ...questionContextData,
    });

    const questionStart = performance.now();

    const {
        question: nextQuestion,
        conversationTurn: nextConversationTurn,
    } = await generateQuestion({
        interviewSessionId: session.id,
        sequenceNumber: conversationTurn.sequenceNumber + 1,
        interviewContext: finalRebuiltContext,
        claim: nextClaim,
        assessment: nextAssessment,
        decision,
        interviewState: nextInterviewState,
        reasoning,
        investigationIntent,
    });

    console.log(
        `[InterviewTiming] Generate next question: ${(performance.now() - questionStart).toFixed(0)}ms`
    );

    console.log(
        `[InterviewTiming] TOTAL submitAnswer: ${(performance.now() - totalStart).toFixed(0)}ms`
    );

    return {
        evaluation,
        assessment,
        decision,
        nextQuestion,
        nextTurnId: nextConversationTurn.id,
        progress: finalProgress,
        interviewCompleted: false,
    };
};