import { generateEmbeddings } from "./embedding.provider.js";

export const embeddingService = {
    async generateEmbeddings(texts: string[]) {
        return generateEmbeddings(texts);
    }
}