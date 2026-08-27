import api from "@/lib/axios";


export interface VoiceTranscriptionResponse {

    success: boolean;

    transcript: string;
}


export const voiceApi = {

    async transcribe(
        audio: Blob
    ): Promise<string> {

        const formData =
            new FormData();


        formData.append(
            "audio",
            audio,
            "candidate-answer.wav"
        );


        const response =
            await api.post<VoiceTranscriptionResponse>(
                "/voice/transcribe",
                formData,
                {
                    timeout:
                        90_000,
                }
            );


        return response.data.transcript;
    },
};