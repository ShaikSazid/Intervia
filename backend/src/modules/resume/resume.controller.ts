import { Request, Response } from "express";
import { UploadFileDto } from "../storage/storage.types.js";
import { resumeService } from "./resume.service.js";

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if(!file) {

        res.status(400).json({ message: "Resume file is requied" });
        return;
    }
    const uploadFileDto: UploadFileDto = {
        fileName: file?.originalname,
        mimeType: file?.mimetype,
        buffer: file?.buffer
    }
    const resume = await resumeService.uploadResume(req.user.id, uploadFileDto);
    console.log(resume);
    res.status(201).json({ message: "Resume uploaded successfully", data: resume });
}