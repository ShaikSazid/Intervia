import * as retrievalService
    from "../retrieval/retrieval.service.js";

import * as conversationTurnService
    from "../conversation-turn/conversation-turn.service.js";

import {
    mapConversationMemory,
} from "../interview-context/interview-memory.mapper.js";

import {
    buildInterviewContext,
} from "../interview-context/interview-context.service.js";

import {
    CandidateAnalysis,
} from "../candidate-profile/candidate-profile.types.js";

import {
    InterviewConfiguration,
    SessionProgress,
} from "../interview-session/session.types.js";

import {
    InterviewPlan,
} from "../interview-planner/planner.types.js";

import {
    ResumeClaim,
} from "../interview-brain/claims/resume-claim.types.js";


interface BuildContextParams {

    interviewSessionId: string;

    resumeId: string;

    candidateProfile: CandidateAnalysis;

    interviewConfiguration:
        InterviewConfiguration;

    interviewPlan:
        InterviewPlan;

    progress:
        SessionProgress;

    /*
     * Exact resume claim currently being
     * investigated by the Interview Brain.
     */
    claim:
        ResumeClaim;
}


export const buildQuestionContext = async (
    params: BuildContextParams
) => {

    /*
     * ============================================================
     * 1. Find current planner stage
     * ============================================================
     */

    const currentStage =
        params.interviewPlan.stages[
            params.progress.currentStageIndex
        ];


    if (!currentStage) {

        throw new Error(
            `Interview stage ${params.progress.currentStageIndex} was not found.`
        );
    }


    /*
     * ============================================================
     * 2. Build claim-driven retrieval query
     * ============================================================
     *
     * The claim is the most important retrieval signal.
     *
     * The stage provides additional context.
     *
     * We deliberately do NOT use the entire candidate profile
     * as the retrieval query because that would make retrieval
     * too broad.
     */

    const retrievalQuery = `
Resume Claim:
${params.claim.title}

Claim Type:
${params.claim.type}

Interview Stage:
${currentStage.topic}

Stage Objectives:
${currentStage.objectives.join("\n")}

Retrieve resume evidence that directly supports or describes
this claim and its implementation.
`.trim();


    /*
     * ============================================================
     * 3. Retrieve resume evidence
     * ============================================================
     */

    const retrievalResult =
        await retrievalService.searchSimilarChunks({

            resumeId:
                params.resumeId,

            query:
                retrievalQuery,

            topK:
                5,
        });


    /*
     * ============================================================
     * 4. Build evidence context
     * ============================================================
     *
     * Keep chunk boundaries visible to the LLM.
     *
     * This makes it clearer that these are retrieved pieces
     * of the actual resume rather than generated information.
     */

    const resumeContext =
        retrievalResult.chunks.length === 0

            ? "No directly relevant resume evidence was retrieved."

            : retrievalResult.chunks
                  .map(
                      (chunk, index) => `
--- Resume Evidence ${index + 1} ---

Chunk Index:
${chunk.metadata.chunkIndex}

Similarity:
${chunk.similarity.toFixed(3)}

Content:
${chunk.content}
`
                  )
                  .join(
                      "\n"
                  );


    /*
     * ============================================================
     * 5. Load conversation history
     * ============================================================
     *
     * This is needed to prevent repetitive questions and allows
     * the reasoning/question agents to understand what has
     * already been investigated.
     */

    const conversationTurns =
        await conversationTurnService
            .getConversationHistory(
                params.interviewSessionId
            );


    /*
     * ============================================================
     * 6. Convert conversation history
     * ============================================================
     */

    const conversationHistory =
        mapConversationMemory(
            conversationTurns
        );


    /*
     * ============================================================
     * 7. Build final Interview Context
     * ============================================================
     */

    return buildInterviewContext({

        candidateProfile:
            params.candidateProfile,

        interviewConfiguration:
            params.interviewConfiguration,

        interviewPlan:
            params.interviewPlan,

        sessionProgress:
            params.progress,

        resumeContext,

        conversationHistory,
    });
};