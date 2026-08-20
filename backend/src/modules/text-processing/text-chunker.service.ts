import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextChunk } from "./text.types.js";

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
});

export const chunkText = async (text: string): Promise<TextChunk[]> => {
    const chunks = await textSplitter.splitText(text);
    return chunks.map((content, index) => ({
        index, content, tokenCount: 0
    }));
}