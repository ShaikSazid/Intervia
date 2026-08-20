import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { s3client } from "../../../lib/s3.js";
import { env } from "../../../config/env.js";
import type { UploadFileDto, StoredFileDto } from "../storage.types.js";

const generateObjectKey = (fileName: string): string => {
    return `resume/${randomUUID()}-${fileName}`
}

export const storeFile = async (data: UploadFileDto): Promise<StoredFileDto> => {
    const objectKey = generateObjectKey(data.fileName);
    const command = new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: objectKey,
        Body: data.buffer,
        ContentType: data.mimeType
    });
    await s3client.send(command);
    return {
        fileName: data.fileName,
        fileUrl: `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${objectKey}`,
        mimeType: data.mimeType,
        fileSize: data.buffer.length
    }
}