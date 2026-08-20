import { characterChunk } from "./character-chunker.service.js";
import { TextChunk } from "./text.types.js";

export const paragraphChunk = (
    text: string,
    chunkSize: number
): TextChunk[] => {

    if (chunkSize <= 0) {
        throw new Error("chunkSize must be greater than 0");
    }

    const paragraphs = text
        .split("\n\n")
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);

    const chunks: TextChunk[] = [];

    let currentChunk = "";
    let index = 0;

    for (const paragraph of paragraphs) {
        if (paragraph.length > chunkSize) {
            if (currentChunk !== "") {
                chunks.push({
                    index,
                    content: currentChunk,
                    tokenCount: 0
                });

                index++;
                currentChunk = "";
            }

            const characterChunks = characterChunk(
                paragraph,
                chunkSize,
                50
            );
            for (const chunk of characterChunks) {
                chunks.push({
                    index,
                    content: chunk.content,
                    tokenCount: 0
                });

                index++;
            }

            continue;
        }

        const candidate =
            currentChunk === ""
                ? paragraph
                : currentChunk + "\n\n" + paragraph;

        if (candidate.length <= chunkSize) {
            currentChunk = candidate;
        } else {
            chunks.push({
                index,
                content: currentChunk,
                tokenCount: 0
            });

            index++;

            currentChunk = paragraph;
        }
    }

    if (currentChunk !== "") {
        chunks.push({
            index,
            content: currentChunk,
            tokenCount: 0
        });
    }

    return chunks;
};