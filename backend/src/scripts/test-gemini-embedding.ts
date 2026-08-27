import { openai } from "../lib/openai.js";

try {
    const response =
        await openai.embeddings.create({

            model:
                "gemini-embedding-001",

            input: [
                "Node.js backend development",
                "PostgreSQL database design",
            ],
        });


    console.log(
        "Number of embeddings:",
        response.data.length
    );


    console.log(
        "Embedding dimensions:",
        response.data[0]?.embedding.length
    );


    console.log(
        "First 10 values:",
        response.data[0]?.embedding.slice(0, 10)
    );

} catch (error) {

    console.error(
        "Gemini embedding test failed:"
    );

    console.error(error);
}