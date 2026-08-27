import {
    generateAnswerEvaluation,
} from "../modules/answer-evaluation/answer-evaluation.agent.js";

try {

    const result =
        await generateAnswerEvaluation({

            question:
                "How did you design the REST API for your project?",

            answer:
                "I separated the controllers, services, and repositories. " +
                "The controller handled the HTTP request, the service contained " +
                "business logic, and the repository handled database operations.",

            targetRole:
                "Backend Developer",

            topic:
                "Backend API Design",

            difficulty:
                "MEDIUM",
        });


    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

} catch (error) {

    console.error(error);
}