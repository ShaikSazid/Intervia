import { storeFile } from "../storage/storage.service.js";
import { UploadFileDto } from "../storage/storage.types.js";
import { CreateResumeChunkDto, CreateResumeDto } from "./resume.types.js";
import * as resumeRepository from "./resume.repository.js";
import * as resumeChunkRepository from "./resume-chunk.repository.js";
import { extractPdfText } from "./resume.parser.service.js";
import { cleanText } from "../text-processing/text.cleaner.service.js";
import { chunkText } from "../text-processing/text-chunker.service.js";
import { embeddingService } from "../embedding/embedding.service.js";
import { generateCandidateProfile } from "../candidate-profile/candidate-profile.service.js";

const processResumeChunks = async (
    resumeId: string,
    cleanedText: string
) => {
    console.log("\n================ Resume Chunk Pipeline Started ================\n");

    console.log("[Chunks] Step 1/4 - Chunking resume...");
    const chunks = await chunkText(cleanedText);
    console.log(
        `[Chunks] ✓ Chunking completed. (${chunks.length} chunks created)`
    );

    console.log("[Chunks] Step 2/4 - Generating embeddings...");
    const embeddings = await embeddingService.generateEmbeddings(
        chunks.map((chunk) => chunk.content)
    );
    console.log("[Chunks] ✓ Embeddings generated.");

    console.log("[Chunks] Step 3/4 - Preparing ResumeChunk DTOs...");
    const resumeChunks: CreateResumeChunkDto[] = chunks.map(
        (chunk, index) => ({
            content: chunk.content,
            chunkIndex: chunk.index,
            tokenCount: chunk.tokenCount,
            embeddingModel: "text-embedding-3-small",
            embedding: embeddings[index],
            resumeId,
        })
    );
    console.log("[Chunks] ✓ DTOs prepared.");

    console.log("[Chunks] Step 4/4 - Saving ResumeChunks...");
    await resumeChunkRepository.createResumeChunks(resumeChunks);
    console.log("[Chunks] ✓ ResumeChunks saved.");

    console.log(
        "\n================ Resume Chunk Pipeline Finished ================\n"
    );
};

export const resumeService = {
    async uploadResume(userId: string, file: UploadFileDto) {
        console.log("\n======================================================");
        console.log("            RESUME UPLOAD PIPELINE STARTED");
        console.log("======================================================\n");

        console.log(
            "[Upload] Step 1/5 - Uploading file and extracting PDF text..."
        );

        const [storedFile, extractedText] = await Promise.all([
            storeFile(file),
            extractPdfText(file.buffer),
        ]);

        console.log("[Upload] ✓ File uploaded.");
        console.log(`[Upload] ✓ File Name : ${storedFile.fileName}`);
        console.log(`[Upload] ✓ File Size : ${storedFile.fileSize} bytes`);

        console.log("\n[Upload] Step 2/5 - Cleaning extracted text...");
        const cleanedText = cleanText(extractedText);

        console.log("[Upload] ✓ Text cleaned.");
        console.log(
            `[Upload] ✓ Extracted ${cleanedText.length} characters.`
        );

        console.log("\n[Upload] Step 3/5 - Creating Resume record...");

        const createResumeDto: CreateResumeDto = {
            fileName: storedFile.fileName,
            fileUrl: storedFile.fileUrl,
            mimeType: storedFile.mimeType,
            fileSize: storedFile.fileSize,
            extractedText: cleanedText,
            userId,
        };

        const resume = await resumeRepository.createResume(createResumeDto);

        console.log("[Upload] ✓ Resume created.");
        console.log(`[Upload] ✓ Resume ID : ${resume.id}`);

        console.log("\n[Upload] Step 4/5 - Processing resume...");
        console.log("   ├── Candidate Profile Pipeline");
        console.log("   └── Resume Chunk Pipeline");

        await Promise.all([
            generateCandidateProfile(resume.id, cleanedText),
            processResumeChunks(resume.id, cleanedText),
        ]);

        console.log("\n[Upload] ✓ Candidate Profile Pipeline completed.");
        console.log("[Upload] ✓ Resume Chunk Pipeline completed.");

        console.log("\n[Upload] Step 5/5 - Resume processing completed.");

        console.log("\n======================================================");
        console.log("            RESUME UPLOAD PIPELINE FINISHED");
        console.log("======================================================\n");

        return resume;
    },

    async getResumeById(resumeId: string) {
        return resumeRepository.findResumeById(resumeId);
    },

    async getUserResumes(userId: string) {
        return resumeRepository.findUserResumes(userId);
    },

    async deleteResume(resumeId: string) {
        return resumeRepository.deleteResume(resumeId);
    },
};