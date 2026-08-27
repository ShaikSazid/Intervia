import {
    generateAnswerEvaluation,
} from "../modules/answer-evaluation/answer-evaluation.agent.js";


const runTest = async (
    name: string,
    answer: string
) => {

    console.log(
        "\n========================================"
    );

    console.log(
        `TEST: ${name}`
    );

    console.log(
        "========================================"
    );

    console.log(
        `Answer: ${answer}`
    );


    try {

        const result =
            await generateAnswerEvaluation({

                question:
                    "How did you use the category identifier to link a cake to its category in MongoDB?",

                answer,

                targetRole:
                    "Backend Developer",

                topic:
                    "MongoDB Data Modeling",

                difficulty:
                    "MEDIUM",
            });


        console.log(
            "\nEvaluation:"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

    } catch (error) {

        console.error(
            "\nEvaluation failed:"
        );

        console.error(error);
    }
};


/*
 * ============================================================
 * Run classification tests
 * ============================================================
 */

await runTest(
    "NO ANSWER",
    "I don't know."
);


await runTest(
    "DONT REMEMBER",
    "I don't remember exactly how I implemented that."
);


await runTest(
    "OFF TOPIC",
    "I used React and Redux to manage the frontend state."
);


await runTest(
    "FRUSTRATED",
    "Why do you keep asking me the same question?"
);


await runTest(
    "PARTIAL",
    "I stored the category ID in the cake document so each cake could be associated with a category."
);


await runTest(
    "STRONG",
    "I stored the category's MongoDB ObjectId in a categoryId field on the cake document. When retrieving cakes for a category, I could query the cakes collection using that categoryId. This kept category data separate and avoided duplicating the category name in every cake document."
);