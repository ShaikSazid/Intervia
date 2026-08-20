import { TextChunk } from "./text.types.js";

export const characterChunk  = (
    text: string,
    chunkSize: number,
    overlap: number
): TextChunk[] => {

    if (chunkSize <= 0) {
        throw new Error("chunkSize must be greater than 0");
    }

    if (overlap >= chunkSize) {
        throw new Error("overlap must be smaller than chunkSize");
    }

    const chunks: TextChunk[] = [];

    let start = 0;
    let index = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);

        chunks.push({
            index,
            content: text.slice(start, end),
            tokenCount: 0
        });
        index++;

        if(end === text.length) {
            break;
        }

        start = end - overlap;
    }

    return chunks;
};