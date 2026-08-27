import {
    extractResumeClaims,
} from "../modules/interview-brain/claims/claim-extraction.agent.js";

import {
    CandidateAnalysis,
} from "../modules/candidate-profile/candidate-profile.types.js";


const candidateAnalysis:
    CandidateAnalysis = {

    identity: {
        fullName:
            "SHAIK SAZID",

        primaryTitle:
            "Backend / Full Stack Developer",

        headline:
            "Backend / Full Stack Developer",

        executiveSummary:
            "Backend / Full Stack Developer with experience in Node.js, Express.js, React, PostgreSQL, Prisma, MongoDB, and AI integrations.",

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
                "JavaScript",

            rawName:
                "JavaScript",

            categories:
                ["Languages"],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "TypeScript",

            rawName:
                "TypeScript",

            categories:
                ["Languages"],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "Node.js",

            rawName:
                "Node.js",

            categories:
                ["Backend", "Runtime"],

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
                ["Backend", "Framework"],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "React",

            rawName:
                "React",

            categories:
                ["Frontend", "Framework"],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "PostgreSQL",

            rawName:
                "PostgreSQL",

            categories:
                ["Database"],

            proficiencyLevel:
                null,

            yearsOfExperience:
                null,
        },

        {
            canonicalName:
                "Prisma",

            rawName:
                "Prisma",

            categories:
                ["ORM", "Database"],

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
                ["Database"],

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
                        ["Node.js", "Express.js"],
                },

                {
                    description:
                        "Used MongoDB for storing application data.",

                    associatedSkills:
                        ["MongoDB"],
                },

                {
                    description:
                        "Implemented REST APIs for managing cakes and categories.",

                    associatedSkills:
                        ["REST API"],
                },
            ],

            technologiesUsed: [
                "Node.js",
                "Express.js",
                "MongoDB",
                "REST API",
            ],
        },

        {
            id:
                "proj_2",

            title:
                "CHATTERBOX",

            summary:
                "Built a chat application using React, Node.js and Google Gemini.",

            url:
                null,

            keyContributions: [
                {
                    description:
                        "Built a chat application using React, Node.js and Google Gemini.",

                    associatedSkills:
                        ["React", "Node.js", "Google Gemini"],
                },

                {
                    description:
                        "Stored conversation history in MongoDB Atlas.",

                    associatedSkills:
                        ["MongoDB"],
                },
            ],

            technologiesUsed: [
                "React",
                "Node.js",
                "Google Gemini",
                "MongoDB",
            ],
        },
    ],
};


try {

    const result =
        await extractResumeClaims({
            candidateAnalysis,
        });


    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

} catch (error) {

    console.error(
        "Claim Extraction Test Failed:"
    );

    console.error(error);
}