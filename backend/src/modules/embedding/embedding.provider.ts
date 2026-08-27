import { openai } from "../../lib/openai.js";
import type { Embeddings } from "./embedding.types.js";

const MODEL_NAME = "gemini-embedding-001";

export const generateEmbeddings = async (
    texts: string[]
): Promise<Embeddings> => {

    if (texts.length === 0) {
        return [];
    }

    const response =
        await openai.embeddings.create({
            model: MODEL_NAME,
            input: texts,
        });

    return response.data.map(
        (item) => item.embedding
    );
};