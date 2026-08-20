import { storeFile as storeFileToS3 } from "./providers/s3.provider.js";
import type { UploadFileDto, StoredFileDto } from "./storage.types.js";

export const storeFile = async (data: UploadFileDto): Promise<StoredFileDto> => {
    return storeFileToS3(data);
}