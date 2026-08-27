import { searchSimilarChunks } from "../modules/retrieval/retrieval.service.js";

const resumeId =
    "cmt13ftc00001r2t50ohljuwr";

try {

    const result =
        await searchSimilarChunks({

            resumeId,

            query:
                "MYCAKEPAGE backend Node.js Express API",

            topK:
                5,
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
        "Retrieval test failed:"
    );

    console.error(error);
}