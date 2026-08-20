export interface SearchChunkOptions {
    resumeId: string;
    query: string;
    topK?: number;
    minSimilarity?: number;
}

export interface SearchChunksRepositoryOptions {
    resumeId: string;
    embedding: number[];
    topK: number;
    minSimilarity?: number;
}

export interface ChunkMetadata {
    chunkIndex: number;
    tokenCount: number;
    embeddingModel: string;
}

export interface RetrievedChunk {
    id: string;
    content: string;
    metadata: ChunkMetadata;
    similarity: number;
}

export interface RetrievalResult {
    chunks: RetrievedChunk[];
    total: number;
}