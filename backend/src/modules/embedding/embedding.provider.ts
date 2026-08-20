import { openai } from "../../lib/openai.js";
import type { Embeddings } from "./embedding.types.js";

export const generateEmbeddings = async (texts: string[]): Promise<Embeddings> => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts
    });
    return response.data.map((item) => item.embedding);
}