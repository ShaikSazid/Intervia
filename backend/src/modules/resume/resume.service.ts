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


/*
 * ============================================================
 * Process Resume Chunks
 * ============================================================
 */

const processResumeChunks = async (
    resumeId: string,
    cleanedText: string
) => {

    console.log(
        "\n================ Resume Chunk Pipeline Started ================\n"
    );


    /*
     * ============================================================
     * Step 1 - Chunking
     * ============================================================
     */

    console.log(
        "[Chunks] Step 1/4 - Chunking resume..."
    );


    const chunks =
        await chunkText(
            cleanedText
        );


    console.log(
        `[Chunks] ✓ Chunking completed. (${chunks.length} chunks created)`
    );


    /*
     * ============================================================
     * Step 2 - Generate Gemini Embeddings
     * ============================================================
     */

    console.log(
        "[Chunks] Step 2/4 - Generating Gemini embeddings..."
    );


    const embeddings =
        await embeddingService.generateEmbeddings(
            chunks.map(
                (chunk) =>
                    chunk.content
            )
        );


    console.log(
        "[Chunks] ✓ Gemini embeddings generated."
    );


    /*
     * ============================================================
     * Defensive validation
     * ============================================================
     *
     * Every chunk must have a corresponding embedding.
     */

    if (
        embeddings.length !==
        chunks.length
    ) {

        throw new Error(
            `Embedding count mismatch. Chunks: ${chunks.length}, Embeddings: ${embeddings.length}`
        );
    }


    /*
     * ============================================================
     * Step 3 - Prepare ResumeChunk DTOs
     * ============================================================
     */

    console.log(
        "[Chunks] Step 3/4 - Preparing ResumeChunk DTOs..."
    );


    const resumeChunks:
        CreateResumeChunkDto[] =
        chunks.map(
            (chunk, index) => {

                const embedding =
                    embeddings[index];


                if (!embedding) {

                    throw new Error(
                        `Missing embedding for chunk ${index}.`
                    );
                }


                return {

                    content:
                        chunk.content,

                    chunkIndex:
                        chunk.index,

                    tokenCount:
                        chunk.tokenCount,

                    embeddingModel:
                        "gemini-embedding-001",

                    embedding,

                    resumeId,
                };
            }
        );


    console.log(
        "[Chunks] ✓ DTOs prepared."
    );


    /*
     * ============================================================
     * Step 4 - Save ResumeChunks
     * ============================================================
     */

    console.log(
        "[Chunks] Step 4/4 - Saving ResumeChunks..."
    );


    await resumeChunkRepository.createResumeChunks(
        resumeChunks
    );


    console.log(
        "[Chunks] ✓ ResumeChunks saved."
    );


    console.log(
        "\n================ Resume Chunk Pipeline Finished ================\n"
    );
};


/*
 * ============================================================
 * Resume Service
 * ============================================================
 */

export const resumeService = {

    /*
     * ========================================================
     * Upload Resume
     * ========================================================
     */

    async uploadResume(
        userId: string,
        file: UploadFileDto
    ) {

        console.log(
            "\n======================================================"
        );

        console.log(
            "            RESUME UPLOAD PIPELINE STARTED"
        );

        console.log(
            "======================================================\n"
        );


        /*
         * ======================================================
         * Step 1 - Store File + Extract Text
         * ======================================================
         */

        console.log(
            "[Upload] Step 1/5 - Uploading file and extracting PDF text..."
        );


        const [
            storedFile,
            extractedText,
        ] =
            await Promise.all([
                storeFile(file),
                extractPdfText(file.buffer),
            ]);


        console.log(
            "[Upload] ✓ File uploaded."
        );

        console.log(
            `[Upload] ✓ File Name : ${storedFile.fileName}`
        );

        console.log(
            `[Upload] ✓ File Size : ${storedFile.fileSize} bytes`
        );


        /*
         * ======================================================
         * Step 2 - Clean Extracted Text
         * ======================================================
         */

        console.log(
            "\n[Upload] Step 2/5 - Cleaning extracted text..."
        );


        const cleanedText =
            cleanText(
                extractedText
            );


        console.log(
            "[Upload] ✓ Text cleaned."
        );

        console.log(
            `[Upload] ✓ Extracted ${cleanedText.length} characters.`
        );


        /*
         * ======================================================
         * Step 3 - Create Resume Record
         * ======================================================
         */

        console.log(
            "\n[Upload] Step 3/5 - Creating Resume record..."
        );


        const createResumeDto:
            CreateResumeDto = {

            fileName:
                storedFile.fileName,

            fileUrl:
                storedFile.fileUrl,

            mimeType:
                storedFile.mimeType,

            fileSize:
                storedFile.fileSize,

            extractedText:
                cleanedText,

            userId,
        };


        const resume =
            await resumeRepository.createResume(
                createResumeDto
            );


        console.log(
            "[Upload] ✓ Resume created."
        );

        console.log(
            `[Upload] ✓ Resume ID : ${resume.id}`
        );


        /*
         * ======================================================
         * Step 4 - Process Resume
         * ======================================================
         */

        console.log(
            "\n[Upload] Step 4/5 - Processing resume..."
        );

        console.log(
            "   ├── Candidate Profile Pipeline"
        );

        console.log(
            "   └── Resume Chunk Pipeline"
        );


        await Promise.all([

            generateCandidateProfile(
                resume.id,
                cleanedText
            ),

            processResumeChunks(
                resume.id,
                cleanedText
            ),
        ]);


        console.log(
            "\n[Upload] ✓ Candidate Profile Pipeline completed."
        );

        console.log(
            "[Upload] ✓ Resume Chunk Pipeline completed."
        );


        /*
         * ======================================================
         * Step 5 - Finish
         * ======================================================
         */

        console.log(
            "\n[Upload] Step 5/5 - Resume processing completed."
        );


        console.log(
            "\n======================================================"
        );

        console.log(
            "            RESUME UPLOAD PIPELINE FINISHED"
        );

        console.log(
            "======================================================\n"
        );


        return resume;
    },


    /*
     * ========================================================
     * Reprocess Existing Resume Chunks
     * ========================================================
     *
     * Used for migrating existing resumes from the old
     * OpenAI embedding model to Gemini embeddings.
     *
     * This does NOT create a new Resume record.
     */

    async reprocessResumeChunks(
        resumeId: string
    ) {

        console.log(
            "\n======================================================"
        );

        console.log(
            "       RESUME CHUNK REPROCESSING STARTED"
        );

        console.log(
            "======================================================\n"
        );


        /*
         * ======================================================
         * Step 1 - Load Resume
         * ======================================================
         */

        console.log(
            "[Reprocess] Step 1/3 - Loading resume..."
        );


        const resume =
            await resumeRepository.findResumeById(
                resumeId
            );


        if (!resume) {

            throw new Error(
                `Resume "${resumeId}" was not found.`
            );
        }


        console.log(
            `[Reprocess] ✓ Resume found: ${resume.fileName}`
        );


        /*
         * ======================================================
         * Step 2 - Validate Extracted Text
         * ======================================================
         */

        console.log(
            "[Reprocess] Step 2/3 - Validating extracted text..."
        );


        if (
            !resume.extractedText ||
            resume.extractedText.trim().length === 0
        ) {

            throw new Error(
                `Resume "${resumeId}" does not contain extracted text.`
            );
        }


        console.log(
            `[Reprocess] ✓ Extracted text available (${resume.extractedText.length} characters).`
        );


        /*
         * ======================================================
         * Step 3 - Generate Gemini Chunks
         * ======================================================
         */

        console.log(
            "[Reprocess] Step 3/3 - Generating Gemini embeddings and saving chunks..."
        );


        /*
         * Important:
         *
         * Existing ResumeChunks should already have been removed
         * before calling this migration function.
         *
         * We do not delete them automatically here because this
         * function should not silently destroy data.
         */

        await processResumeChunks(
            resume.id,
            resume.extractedText
        );


        console.log(
            "\n[Reprocess] ✓ Resume chunks reprocessed successfully."
        );


        console.log(
            "\n======================================================"
        );

        console.log(
            "       RESUME CHUNK REPROCESSING FINISHED"
        );

        console.log(
            "======================================================\n"
        );


        return {

            resumeId:
                resume.id,

            fileName:
                resume.fileName,

            message:
                "Resume chunks reprocessed successfully using Gemini embeddings.",
        };
    },


    /*
     * ========================================================
     * Get Resume By ID
     * ========================================================
     */

    async getResumeById(
        resumeId: string
    ) {

        return resumeRepository.findResumeById(
            resumeId
        );
    },


    /*
     * ========================================================
     * Get User Resumes
     * ========================================================
     */

    async getUserResumes(
        userId: string
    ) {

        return resumeRepository.findUserResumes(
            userId
        );
    },


    /*
     * ========================================================
     * Delete Resume
     * ========================================================
     */

    async deleteResume(
        resumeId: string
    ) {

        return resumeRepository.deleteResume(
            resumeId
        );
    },
};