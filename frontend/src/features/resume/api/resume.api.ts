import api from "@/lib/axios";


export interface Resume {

    id: string;

    fileName: string;

    fileUrl?: string | null;

    mimeType?: string;

    fileSize?: number;

    extractedText?: string | null;

    createdAt?: string;

    updatedAt?: string;

    userId?: string;
}


export interface ResumeUploadResponse {

    message: string;

    data: Resume;
}


export const resumeApi = {

    async upload(
        file: File
    ): Promise<Resume> {

        const formData =
            new FormData();


        formData.append(
            "resume",
            file
        );


        const response =
            await api.post<ResumeUploadResponse>(
                "/resumes/upload",
                formData,
                {
                    timeout: 60_000,
                }
            );


        return response.data.data;
    },
};