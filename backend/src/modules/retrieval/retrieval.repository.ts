import { prisma } from "../../lib/prisma.js";

import {
    RetrievalResult,
    RetrievedChunk,
    SearchChunksRepositoryOptions,
} from "./retrieval.types.js";


interface ResumeChunkSearchRow {

    id: string;

    content: string;

    chunkIndex: number;

    tokenCount: number;

    embeddingModel: string;

    similarity: number;
}


export const searchSimilarChunks = async (
    options: SearchChunksRepositoryOptions
): Promise<RetrievalResult> => {

    const {
        resumeId,
        embedding,
        topK,
        minSimilarity,
    } = options;


    /*
     * ============================================================
     * 1. Convert embedding to pgvector format
     * ============================================================
     */

    const queryVector =
        `[${embedding.join(",")}]`;


    /*
     * ============================================================
     * 2. Similarity threshold
     * ============================================================
     *
     * If no threshold is supplied, do not filter by similarity.
     *
     * The caller remains responsible for deciding whether
     * a threshold is appropriate.
     */

    const similarityThreshold =
        minSimilarity ?? 0;


    /*
     * ============================================================
     * 3. Vector similarity search
     * ============================================================
     *
     * Important:
     *
     * Filtering happens BEFORE LIMIT.
     *
     * This ensures that weak chunks do not consume the
     * topK result slots.
     */

    const rows =
        await prisma.$queryRaw<ResumeChunkSearchRow[]>`

            SELECT
                id,
                content,
                "chunkIndex",
                "tokenCount",
                "embeddingModel",
                similarity

            FROM (

                SELECT

                    id,
                    content,
                    "chunkIndex",
                    "tokenCount",
                    "embeddingModel",

                    1 - (
                        embedding <=> ${queryVector}::vector
                    ) AS similarity

                FROM "ResumeChunk"

                WHERE "resumeId" = ${resumeId}

            ) AS ranked_chunks

            WHERE similarity >= ${similarityThreshold}

            ORDER BY similarity DESC

            LIMIT ${topK}
        `;


    /*
     * ============================================================
     * 4. Convert database rows to domain objects
     * ============================================================
     */

    const chunks:
        RetrievedChunk[] =
        rows.map(
            (row) => ({

                id:
                    row.id,

                content:
                    row.content,

                similarity:
                    row.similarity,

                metadata: {

                    chunkIndex:
                        row.chunkIndex,

                    tokenCount:
                        row.tokenCount,

                    embeddingModel:
                        row.embeddingModel,
                },
            })
        );


    /*
     * ============================================================
     * 5. Return retrieval result
     * ============================================================
     */

    return {

        chunks,

        total:
            chunks.length,
    };
};