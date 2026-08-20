import {
    generateEmbeddings,
} from "../embedding/embedding.provider.js";

import {
    SearchChunkOptions,
} from "./retrieval.types.js";

import * as retrievalRepository
    from "./retrieval.repository.js";


export const searchSimilarChunks = async (
    options: SearchChunkOptions
) => {

    const {
        resumeId,
        query,
        topK,
        minSimilarity,
    } = options;


    /*
     * ============================================================
     * 1. Generate query embedding
     * ============================================================
     */

    const embeddings =
        await generateEmbeddings([
            query,
        ]);


    const queryEmbedding =
        embeddings[0];


    if (!queryEmbedding) {

        throw new Error(
            "RetrievalService: Failed to generate query embedding."
        );
    }


    /*
     * ============================================================
     * 2. Search vector database
     * ============================================================
     */

    const retrievalResult =
        await retrievalRepository.searchSimilarChunks({

            resumeId,

            embedding:
                queryEmbedding,

            topK:
                topK ?? 5,

            minSimilarity,
        });


    return retrievalResult;
};