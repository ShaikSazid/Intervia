
import { storeFile } from "../storage/storage.service.js";
import { UploadFileDto } from "../storage/storage.types.js";

import {
    CreateResumeChunkDto,
    CreateResumeDto,
} from "./resume.types.js";

import * as resumeRepository
    from "./resume.repository.js";

import * as resumeChunkRepository
    from "./resume-chunk.repository.js";

import { extractPdfText }
    from "./resume.parser.service.js";

import { cleanText }
    from "../text-processing/text.cleaner.service.js";

import { chunkText }
    from "../text-processing/text-chunker.service.js";

import { embeddingService }
    from "../embedding/embedding.service.js";

import { generateCandidateProfile }
    from "../candidate-profile/candidate-profile.service.js";


const processResumeChunks = async (
    resumeId: string,
    cleanedText: string
) => {

    console.log("[Chunks] Pipeline started");

    console.log("[Chunks] Step 1/4 - Chunking resume...");

    const chunks = await chunkText(cleanedText);

    console.log(
        `[Chunks] Chunking completed. (${chunks.length} chunks created)`
    );

    console.log("[Chunks] Step 2/4 - Generating Gemini embeddings...");

    const embeddings = await embeddingService.generateEmbeddings(
        chunks.map((chunk) => chunk.content)
    );

    console.log("[Chunks] Gemini embeddings generated.");

    if (embeddings.length !== chunks.length) {
        throw new Error(
            `Embedding count mismatch. Chunks: ${chunks.length}, Embeddings: ${embeddings.length}`
        );
    }

    console.log("[Chunks] Step 3/4 - Preparing ResumeChunk DTOs...");

    const resumeChunks: CreateResumeChunkDto[] = chunks.map(
        (chunk, index) => {

            const embedding = embeddings[index];

            if (!embedding) {
                throw new Error(
                    `Missing embedding for chunk ${index}.`
                );
            }

            return {
                content: chunk.content,
                chunkIndex: chunk.index,
                tokenCount: chunk.tokenCount,
                embeddingModel: "gemini-embedding-001",
                embedding,
                resumeId,
            };
        }
    );

    console.log("[Chunks] DTOs prepared.");

    console.log("[Chunks] Step 4/4 - Saving ResumeChunks...");

    await resumeChunkRepository.createResumeChunks(resumeChunks);

    console.log("[Chunks] ResumeChunks saved.");

    console.log("[Chunks] Pipeline finished.");
};


export const resumeService = {

    async uploadResume(
        userId: string,
        file: UploadFileDto
    ) {

        console.log("[Upload] Pipeline started");

        console.log("[Upload] Step 1/5 - Uploading file and extracting PDF text...");

        const [storedFile, extractedText] = await Promise.all([
            storeFile(file),
            extractPdfText(file.buffer),
        ]);

        console.log("[Upload] File uploaded.");
        console.log(`[Upload] File Name: ${storedFile.fileName}`);
        console.log(`[Upload] File Size: ${storedFile.fileSize} bytes`);

        console.log("[Upload] Step 2/5 - Cleaning extracted text...");

        const cleanedText = cleanText(extractedText);

        console.log("[Upload] Text cleaned.");
        console.log(`[Upload] Extracted ${cleanedText.length} characters.`);

        console.log("[Upload] Step 3/5 - Creating Resume record...");

        const createResumeDto: CreateResumeDto = {
            fileName: storedFile.fileName,
            fileUrl: storedFile.fileUrl,
            mimeType: storedFile.mimeType,
            fileSize: storedFile.fileSize,
            extractedText: cleanedText,
            userId,
        };

        const resume = await resumeRepository.createResume(
            createResumeDto
        );

        console.log("[Upload] Resume created.");
        console.log(`[Upload] Resume ID: ${resume.id}`);

        console.log("[Upload] Step 4/5 - Processing resume...");

        await Promise.all([

            (async () => {
                console.log("[Upload] Candidate Profile started");

                try {
                    await generateCandidateProfile(
                        resume.id,
                        cleanedText
                    );

                    console.log("[Upload] Candidate Profile completed");

                } catch (error) {
                    console.error(
                        "[Upload] Candidate Profile failed:",
                        error
                    );

                    throw error;
                }
            })(),

            (async () => {
                console.log("[Upload] Resume Chunk Pipeline started");

                try {
                    await processResumeChunks(
                        resume.id,
                        cleanedText
                    );

                    console.log("[Upload] Resume Chunk Pipeline completed");

                } catch (error) {
                    console.error(
                        "[Upload] Resume Chunk Pipeline failed:",
                        error
                    );

                    throw error;
                }
            })(),

        ]);

        console.log("[Upload] Both processing pipelines completed.");

        console.log("[Upload] Step 5/5 - Resume processing completed.");

        console.log("[Upload] Pipeline finished.");

        return resume;
    },


    async reprocessResumeChunks(
        resumeId: string
    ) {

        console.log("[Reprocess] Pipeline started");

        console.log("[Reprocess] Step 1/3 - Loading resume...");

        const resume = await resumeRepository.findResumeById(
            resumeId
        );

        if (!resume) {
            throw new Error(
                `Resume "${resumeId}" was not found.`
            );
        }

        console.log(`[Reprocess] Resume found: ${resume.fileName}`);

        console.log("[Reprocess] Step 2/3 - Validating extracted text...");

        if (
            !resume.extractedText ||
            resume.extractedText.trim().length === 0
        ) {
            throw new Error(
                `Resume "${resumeId}" does not contain extracted text.`
            );
        }

        console.log(
            `[Reprocess] Extracted text available (${resume.extractedText.length} characters).`
        );

        console.log("[Reprocess] Step 3/3 - Generating Gemini chunks...");

        await processResumeChunks(
            resume.id,
            resume.extractedText
        );

        console.log("[Reprocess] Resume chunks reprocessed successfully.");

        return {
            resumeId: resume.id,
            fileName: resume.fileName,
            message: "Resume chunks reprocessed successfully using Gemini embeddings.",
        };
    },


    async getResumeById(
        resumeId: string
    ) {

        return resumeRepository.findResumeById(resumeId);
    },


    async getUserResumes(
        userId: string
    ) {

        return resumeRepository.findUserResumes(userId);
    },


    async deleteResume(
        resumeId: string
    ) {

        return resumeRepository.deleteResume(resumeId);
    },
};
