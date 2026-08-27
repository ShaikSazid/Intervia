import { analyzeResume } from "../modules/candidate-profile/candidate-understanding.agent.js";

const sampleResume = `
SHAIK SAZID

Backend / Full Stack Developer

Skills:
JavaScript, TypeScript, Node.js, Express.js, React, PostgreSQL, Prisma

Projects:

MYCAKEPAGE
Built a web application for managing cakes and categories.
Used Node.js and Express.js for backend development.
Used MongoDB for storing application data.
Implemented REST APIs for managing cakes and categories.

CHATTERBOX
Built a chat application using React, Node.js and Google Gemini.
Stored conversation history in MongoDB Atlas.
`;

try {

    const result =
        await analyzeResume(
            sampleResume
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
        "Candidate Understanding Test Failed:"
    );

    console.error(error);
}