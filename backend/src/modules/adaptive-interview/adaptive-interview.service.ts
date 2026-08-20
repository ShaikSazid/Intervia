import { InterviewDifficulty } from "../interview/interview.enums.js";
import { AdaptiveInterviewDecision, AdaptiveInterviewInput  } from "./adaptive-interview.types.js";

export const decideNextStep = (input: AdaptiveInterviewInput): AdaptiveInterviewDecision => {
    if(input.followUpRequired) {
        return {
            action: "FOLLOW_UP",
            nextStageIndex: input.currentStageIndex,
            nextQuestionIndex: input.currentQuestionIndex,
            difficulty: InterviewDifficulty.EASY
        }
    }
    const hashMoreQuestions = input.currentQuestionIndex + 1 < input.questionsInCurrentStage;
    if(hashMoreQuestions) {
        return {
            action: "NEXT_QUESTION",
            nextStageIndex: input.currentStageIndex,
            nextQuestionIndex: input.currentQuestionIndex + 1,
            difficulty: InterviewDifficulty.MEDIUM
        }
    }

    const hashMoreStages = input.currentStageIndex + 1 < input.totalStages;
    if(hashMoreStages) {
        return {
            action: "NEXT_STAGE",
            nextStageIndex: input.currentStageIndex + 1,
            nextQuestionIndex: 0,
            difficulty: InterviewDifficulty.MEDIUM
        }
    }
    return {
        action: "FINISH_INTERVIEW",
        nextStageIndex: input.currentStageIndex,
        nextQuestionIndex: input.currentQuestionIndex,
        difficulty: InterviewDifficulty.HARD
    }
}