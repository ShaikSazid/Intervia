import { TextChunk } from "./text.types.js";

const DEFAULT_SEPARATORS = [
    "\n\n",
    "\n",
    " ",
    ""
]

export const recursiveChunk = (
    text: string,
    chunkSize: number,
    overlap: number,
    separators = DEFAULT_SEPARATORS
): TextChunk[] => {

    if (chunkSize <= 0) {
        throw new Error("Chunk size must be greater than 0");
    }

    if (overlap >= chunkSize) {
        throw new Error("Overlap must be smaller than chunk size");
    }

    const separator = separators[0];
    const remainingSeparators = separators.slice(1);

    const parts =
        separator === ""
            ? text.split("")
            : text.split(separator);

    const chunks: TextChunk[] = [];
    let index = 0;

    for(const part of parts) {
        if(part.trim() === "") {
            continue;
        }
        if(part.length <= chunkSize) {
            chunks.push({ index, content: part, tokenCount: 0 });
            index++;
        } else {
            if(remainingSeparators.length > 0) {
                const childChunks = recursiveChunk(part, chunkSize, overlap, remainingSeparators)
                for(const childChunk of childChunks) {
                    chunks.push({ index, content: childChunk.content, tokenCount: 0 });
                    index++;
                }
            } else {
                chunks.push({ index, content: part, tokenCount: 0 });
                index++;
            }
        }
    }

    return [];
};

export const mergeChunks = (pieces: string[], chunkSize: number): TextChunk[] => {
    const chunks: TextChunk[] = [];
    let currentChunk = "";
    let index = 0;
    for(const piece of pieces) {
        const candidate = currentChunk === "" ? piece : currentChunk + "\n\n" + piece;
        if(candidate.length <= chunkSize) {
            currentChunk = candidate;
        } else {
            chunks.push({ index, content: currentChunk, tokenCount: 0 });
            index++;
            currentChunk = piece;
        }
    }
    if(currentChunk !== "") {
        chunks.push({ index, content: currentChunk, tokenCount: 0 });
    }
    return chunks;
}