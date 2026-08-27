import {
    useState,
} from "react";

import axios from "axios";

import {
    resumeApi,
    type Resume,
} from "../api/resume.api";


interface UseResumeUploadResult {

    uploadResume: (
        file: File
    ) => Promise<Resume | null>;

    resume: Resume | null;

    isUploading: boolean;

    error: string | null;

    reset: () => void;
}


export function useResumeUpload():
    UseResumeUploadResult {

    const [
        resume,
        setResume,
    ] = useState<Resume | null>(
        null
    );


    const [
        isUploading,
        setIsUploading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    const uploadResume =
        async (
            file: File
        ): Promise<Resume | null> => {

            setIsUploading(true);

            setError(null);


            try {

                const uploadedResume =
                    await resumeApi.upload(
                        file
                    );


                setResume(
                    uploadedResume
                );


                return uploadedResume;

            } catch (error) {

                console.error(
                    "Resume upload failed:",
                    error
                );


                if (
                    axios.isAxiosError(
                        error
                    )
                ) {

                    console.error(
                        "Status:",
                        error.response?.status
                    );


                    console.error(
                        "Response:",
                        error.response?.data
                    );


                    setError(
                        error.response?.data?.message ??
                        `Upload failed (${error.response?.status ?? "unknown error"})`
                    );

                } else {

                    setError(
                        "Unable to upload your resume."
                    );
                }


                return null;

            } finally {

                setIsUploading(false);
            }
        };


    const reset =
        () => {

            setResume(null);

            setError(null);
        };


    return {

        uploadResume,

        resume,

        isUploading,

        error,

        reset,
    };
}