export interface CreateResumeDto {
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    extractedText: string;
    userId: string;
}

export interface GetResumeDto {
    resumeId: string;
    userId: string;
}

export interface DeleteResumeDto {
    resumeId: string;
    userId: string;
}

export interface CreateResumeChunkDto {
    content: string;
    chunkIndex: number;
    tokenCount: number;
    embeddingModel: string;
    embedding: number[];
    resumeId: string;
}