export interface UploadFileDto {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
}

export interface StoredFileDto {
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
}