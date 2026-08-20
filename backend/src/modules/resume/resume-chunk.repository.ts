import { randomUUID } from "node:crypto";
import { postgres } from "../../lib/postgres.js";
import { CreateResumeChunkDto } from "./resume.types.js";

export const createResumeChunks = async (resumeChunks: CreateResumeChunkDto[]) => {
    if(resumeChunks.length === 0) return;
    const placeholders: string[] = [];
    const parameters: (string | number | Date)[] = [];
    let parameterIndex = 1;
    for(const chunk of resumeChunks) {
        const id = randomUUID();
        const now = new Date();
        const vector = `[${chunk.embedding.join(",")}]`;
        placeholders.push(
            `($${parameterIndex},
            $${parameterIndex + 1},
            $${parameterIndex + 2},
            $${parameterIndex + 3},
            $${parameterIndex + 4},
            $${parameterIndex + 5}::vector,
            $${parameterIndex + 6},
            $${parameterIndex + 7},
            $${parameterIndex + 8})`
        );
        parameters.push(
            id,
            chunk.content,
            chunk.chunkIndex,
            chunk.tokenCount,
            chunk.embeddingModel,
            vector,
            now,
            now,
            chunk.resumeId
        );
        parameterIndex += 9;
    }
    const sql = `
    INSERT INTO "ResumeChunk" (
        "id",
        "content",
        "chunkIndex",
        "tokenCount",
        "embeddingModel",
        "embedding",
        "createdAt",
        "updatedAt",
        "resumeId"
    )
        VALUES ${placeholders.join(",")}`
        try {
            await postgres.query(sql, parameters);
            console.log("Resume chunks inserted successfully")
        } catch (error) {
            console.error("Failed into insert resume chunks:", error);
            throw error;
        }
}