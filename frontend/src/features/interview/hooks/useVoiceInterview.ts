import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    voiceApi,
} from "../api/voice.api";

export interface InterviewAudioConfig {

    inputDeviceId: string;

    inputDeviceLabel: string;

    outputDeviceId: string | null;

    outputDeviceLabel: string | null;
}


interface UseVoiceInterviewOptions {

    language?: string;

    audioConfig:
        InterviewAudioConfig | null;

    onTranscript: (
        transcript: string
    ) => Promise<void>;
}


export type VoiceStatus =
    | "IDLE"
    | "SPEAKING"
    | "LISTENING"
    | "PROCESSING"
    | "ERROR";


export function useVoiceInterview({
    language = "en-US",
    audioConfig,
    onTranscript,
}: UseVoiceInterviewOptions) {

    /*
     * ============================================================
     * Media references
     * ============================================================
     */

    const mediaRecorderRef =
        useRef<MediaRecorder | null>(
            null
        );


    const mediaStreamRef =
        useRef<MediaStream | null>(
            null
        );


    const audioChunksRef =
        useRef<Blob[]>(
            []
        );


    /*
     * ============================================================
     * State
     * ============================================================
     */

    const [
        status,
        setStatus,
    ] = useState<VoiceStatus>(
        "IDLE"
    );


    const [
        transcript,
        setTranscript,
    ] = useState(
        ""
    );


    const [
        interimTranscript,
        setInterimTranscript,
    ] = useState(
        ""
    );


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    const [
        isSupported,
        setIsSupported,
    ] = useState(
        true
    );


    /*
     * ============================================================
     * Browser support
     * ============================================================
     */

    useEffect(() => {

        const supported =
            typeof navigator !== "undefined" &&
            !!navigator.mediaDevices?.getUserMedia &&
            typeof MediaRecorder !== "undefined";


        setIsSupported(
            supported
        );


        if (!supported) {

            setError(
                "Your browser does not support microphone recording."
            );
        }

    }, []);


    /*
     * ============================================================
     * Stop microphone
     * ============================================================
     */

    const stopMicrophone =
        useCallback(
            () => {

                const stream =
                    mediaStreamRef.current;


                if (stream) {

                    for (
                        const track of
                        stream.getTracks()
                    ) {

                        track.stop();
                    }
                }


                mediaStreamRef.current =
                    null;


                mediaRecorderRef.current =
                    null;

            },
            []
        );


    /*
     * ============================================================
     * Convert recorded audio to WAV
     * ============================================================
     */

    const convertToWav =
        useCallback(
            async (
                blob: Blob
            ): Promise<Blob> => {

                const arrayBuffer =
                    await blob.arrayBuffer();


                const AudioContextClass =
                    window.AudioContext ??
                    (
                        window as typeof window & {
                            webkitAudioContext?:
                                typeof AudioContext;
                        }
                    ).webkitAudioContext;


                if (!AudioContextClass) {

                    throw new Error(
                        "Web Audio API is not supported."
                    );
                }


                const audioContext =
                    new AudioContextClass();


                try {

                    const audioBuffer =
                        await audioContext.decodeAudioData(
                            arrayBuffer.slice(0)
                        );


                    console.log(
                        "[Voice] Decoded buffer:",
                        {
                            channels:
                                audioBuffer.numberOfChannels,

                            sampleRate:
                                audioBuffer.sampleRate,

                            duration:
                                audioBuffer.duration,

                            peakAmplitude:
                                peakOf(
                                    audioBuffer
                                ),
                        }
                    );


                    return encodeWav(
                        audioBuffer
                    );

                } finally {

                    await audioContext.close();
                }

            },
            []
        );


    /*
     * ============================================================
     * Start microphone recording
     * ============================================================
     */

    const startListening =
        useCallback(
            async () => {

                if (!isSupported) {

                    setStatus(
                        "ERROR"
                    );


                    setError(
                        "Microphone recording is not available."
                    );


                    return;
                }


                /*
                 * ----------------------------------------------------
                 * Stop current AI speech
                 * ----------------------------------------------------
                 */

                window.speechSynthesis.cancel();


                /*
                 * ----------------------------------------------------
                 * Clear previous answer
                 * ----------------------------------------------------
                 */

                setTranscript(
                    ""
                );


                setInterimTranscript(
                    ""
                );


                setError(
                    null
                );


                audioChunksRef.current =
                    [];


                try {

                    /*
                     * A previous failed attempt may have left a stream
                     * open. Always release it before acquiring the
                     * selected device again.
                     */

                    stopMicrophone();


                    /*
                     * ------------------------------------------------
                     * Use the microphone explicitly selected by the
                     * candidate during the audio setup step.
                     *
                     * We no longer guess between devices here. The
                     * selected device has already been tested before
                     * the interview begins.
                     * ------------------------------------------------
                     */

                    if (!audioConfig) {

                        throw new Error(
                            "Please complete the microphone setup before answering."
                        );
                    }


                    const constraints:
                        MediaTrackConstraints =
                        {

                            echoCancellation:
                                true,

                            noiseSuppression:
                                true,

                            autoGainControl:
                                true,
                        };


                    if (
                        audioConfig.inputDeviceId &&
                        audioConfig.inputDeviceId !== "default"
                    ) {

                        constraints.deviceId = {

                            exact:
                                audioConfig.inputDeviceId,
                        };
                    }


                    const stream =
                        await navigator.mediaDevices
                            .getUserMedia({

                                audio:
                                    constraints,

                                video:
                                    false,
                            });


                    const audioTrack =
                        stream.getAudioTracks()[0];


                    const settings =
                        audioTrack?.getSettings();


                    console.log(
                        "[Voice] Using selected microphone:",
                        {
                            configuredDevice:
                                audioConfig.inputDeviceLabel,

                            actualDevice:
                                audioTrack?.label,

                            requestedDeviceId:
                                audioConfig.inputDeviceId,

                            actualDeviceId:
                                settings.deviceId,

                            muted:
                                audioTrack?.muted,

                            readyState:
                                audioTrack?.readyState,
                        }
                    );


                    if (
                        !audioTrack ||
                        audioTrack.readyState !== "live"
                    ) {

                        for (
                            const track of
                            stream.getTracks()
                        ) {

                            track.stop();
                        }


                        throw new Error(
                            `The selected microphone "${audioConfig.inputDeviceLabel}" is no longer available.`
                        );
                    }



                    mediaStreamRef.current =
                        stream;


                    /*
                     * ------------------------------------------------
                     * Log selected microphone
                     * ------------------------------------------------
                     */


                    /*
                     * ------------------------------------------------
                     * Choose recording format
                     * ------------------------------------------------
                     */

                    const mimeTypes = [

                        "audio/webm;codecs=opus",

                        "audio/webm",

                        "audio/ogg;codecs=opus",

                        "audio/ogg",

                    ];


                    const supportedMimeType =
                        mimeTypes.find(
                            mimeType =>
                                MediaRecorder.isTypeSupported(
                                    mimeType
                                )
                        );


                    /*
                     * ------------------------------------------------
                     * Create recorder
                     * ------------------------------------------------
                     */

                    const recorder =
                        supportedMimeType

                            ? new MediaRecorder(
                                stream,
                                {
                                    mimeType:
                                        supportedMimeType,
                                }
                            )

                            : new MediaRecorder(
                                stream
                            );


                    mediaRecorderRef.current =
                        recorder;


                    /*
                     * ------------------------------------------------
                     * Receive recorded chunks
                     * ------------------------------------------------
                     */

                    recorder.ondataavailable =
                        event => {

                            if (
                                event.data.size >
                                0
                            ) {

                                audioChunksRef.current.push(
                                    event.data
                                );
                            }
                        };


                    /*
                     * ------------------------------------------------
                     * Recorder error
                     * ------------------------------------------------
                     */

                    recorder.onerror =
                        () => {

                            console.error(
                                "[Voice] MediaRecorder error"
                            );


                            setStatus(
                                "ERROR"
                            );


                            setError(
                                "Microphone recording failed."
                            );


                            stopMicrophone();
                        };


                    /*
                     * ------------------------------------------------
                     * Recorder stopped
                     * ------------------------------------------------
                     */

                    recorder.onstop =
                        async () => {

                            try {

                                /*
                                 * ------------------------------------
                                 * Processing state
                                 * ------------------------------------
                                 */

                                setStatus(
                                    "PROCESSING"
                                );


                                /*
                                 * ------------------------------------
                                 * Build recorded blob
                                 * ------------------------------------
                                 */

                                const recordedBlob =
                                    new Blob(
                                        audioChunksRef.current,
                                        {
                                            type:
                                                recorder.mimeType ||
                                                "audio/webm",
                                        }
                                    );


                                if (
                                    recordedBlob.size ===
                                    0
                                ) {

                                    throw new Error(
                                        "No audio was recorded."
                                    );
                                }


                                console.log(
                                    "[Voice] Recorded audio:",
                                    {
                                        type:
                                            recordedBlob.type,

                                        size:
                                            recordedBlob.size,
                                    }
                                );


                                /*
                                 * ------------------------------------
                                 * Convert to WAV
                                 * ------------------------------------
                                 */

                                const wavBlob =
                                    await convertToWav(
                                        recordedBlob
                                    );


                                console.log(
                                    "[Voice] WAV audio:",
                                    {
                                        type:
                                            wavBlob.type,

                                        size:
                                            wavBlob.size,
                                    }
                                );


                                /*
                                 * ------------------------------------
                                 * Transcribe audio
                                 * ------------------------------------
                                 */

                                const text =
                                    await voiceApi.transcribe(
                                        wavBlob
                                    );


                                const cleanTranscript =
                                    text.trim();


                                if (
                                    !cleanTranscript
                                ) {

                                    throw new Error(
                                        "No speech was detected."
                                    );
                                }


                                console.log(
                                    "[Voice] Transcript:",
                                    cleanTranscript
                                );


                                /*
                                 * ------------------------------------
                                 * Show transcript
                                 * ------------------------------------
                                 */

                                setTranscript(
                                    cleanTranscript
                                );


                                /*
                                 * ------------------------------------
                                 * Send transcript to interview engine
                                 * ------------------------------------
                                 */

                                await onTranscript(
                                    cleanTranscript
                                );


                                /*
                                 * ------------------------------------
                                 * Ready for next question
                                 * ------------------------------------
                                 */

                                setStatus(
                                    "IDLE"
                                );

                            } catch (
                                processingError
                            ) {

                                console.error(
                                    "[Voice] Audio processing failed:",
                                    processingError
                                );


                                setStatus(
                                    "ERROR"
                                );


                                setError(
                                    processingError instanceof Error

                                        ? processingError.message

                                        : "Unable to process your voice answer."
                                );

                            } finally {

                                stopMicrophone();
                            }

                        };


                    /*
                     * ------------------------------------------------
                     * Start recording
                     * ------------------------------------------------
                     */

                    recorder.start();


                    setStatus(
                        "LISTENING"
                    );


                    console.log(
                        "[Voice] Recording started"
                    );

                } catch (
                    microphoneError
                ) {

                    /*
                     * ==================================================
                     * IMPORTANT MICROPHONE ERROR DIAGNOSTICS
                     * ==================================================
                     *
                     * Previously every failure became:
                     *
                     *     "Unable to access your microphone."
                     *
                     * That hid the actual browser error.
                     *
                     * Now we expose the actual reason.
                     */

                    console.error(
                        "[Voice] Microphone error:",
                        microphoneError
                    );


                    console.error(
                        "[Voice] Microphone error details:",
                        {
                            name:
                                microphoneError instanceof
                                    DOMException
                                    ? microphoneError.name
                                    : undefined,

                            message:
                                microphoneError instanceof
                                    Error
                                    ? microphoneError.message
                                    : String(
                                        microphoneError
                                    ),

                            stack:
                                microphoneError instanceof
                                    Error
                                    ? microphoneError.stack
                                    : undefined,
                        }
                    );


                    setStatus(
                        "ERROR"
                    );


                    /*
                     * ------------------------------------------------
                     * Permission denied
                     * ------------------------------------------------
                     */

                    if (
                        microphoneError instanceof
                            DOMException &&

                        microphoneError.name ===
                            "NotAllowedError"
                    ) {

                        setError(
                            "Microphone permission was denied. Check Chrome's microphone permission for this site."
                        );


                    /*
                     * ------------------------------------------------
                     * No microphone
                     * ------------------------------------------------
                     */

                    } else if (
                        microphoneError instanceof
                            DOMException &&

                        microphoneError.name ===
                            "NotFoundError"
                    ) {

                        setError(
                            "No microphone was found. Check that your microphone or Bluetooth headset is connected."
                        );


                    /*
                     * ------------------------------------------------
                     * Device unavailable
                     * ------------------------------------------------
                     */

                    } else if (
                        microphoneError instanceof
                            DOMException &&

                        microphoneError.name ===
                            "NotReadableError"
                    ) {

                        setError(
                            "The microphone is currently unavailable or being used by another application."
                        );


                    /*
                     * ------------------------------------------------
                     * Device constraints
                     * ------------------------------------------------
                     */

                    } else if (
                        microphoneError instanceof
                            DOMException &&

                        microphoneError.name ===
                            "OverconstrainedError"
                    ) {

                        setError(
                            "The selected microphone is no longer available. Please reconnect your headset or choose another microphone."
                        );


                    /*
                     * ------------------------------------------------
                     * Browser aborted microphone request
                     * ------------------------------------------------
                     */

                    } else if (
                        microphoneError instanceof
                            DOMException &&

                        microphoneError.name ===
                            "AbortError"
                    ) {

                        setError(
                            "Microphone access was interrupted. Please try Answer again."
                        );


                    /*
                     * ------------------------------------------------
                     * Generic error
                     * ------------------------------------------------
                     */

                    } else {

                        setError(
                            microphoneError instanceof Error

                                ? microphoneError.message

                                : "Unable to access your microphone."
                        );
                    }
                }

            },
            [
                audioConfig,
                convertToWav,
                isSupported,
                onTranscript,
                stopMicrophone,
            ]
        );


    /*
     * ============================================================
     * Stop recording
     * ============================================================
     */

    const stopListening =
        useCallback(
            () => {

                const recorder =
                    mediaRecorderRef.current;


                if (
                    recorder &&
                    recorder.state !==
                        "inactive"
                ) {

                    console.log(
                        "[Voice] Stopping recording"
                    );


                    recorder.stop();


                    return;
                }


                stopMicrophone();

            },
            [
                stopMicrophone,
            ]
        );


    /*
     * ============================================================
     * Speak AI question
     * ============================================================
     */

    const speak =
        useCallback(
            (
                text: string
            ) => {

                if (
                    !text.trim()
                ) {

                    return;
                }


                /*
                 * Stop previous speech
                 */

                window.speechSynthesis.cancel();


                const utterance =
                    new SpeechSynthesisUtterance(
                        text
                    );


                utterance.lang =
                    language;


                utterance.rate =
                    0.95;


                utterance.pitch =
                    1;


                /*
                 * ----------------------------------------------------
                 * Interviewer starts speaking
                 * ----------------------------------------------------
                 */

                utterance.onstart =
                    () => {

                        setStatus(
                            "SPEAKING"
                        );


                        setError(
                            null
                        );


                        console.log(
                            "[Voice] Interviewer started speaking."
                        );
                    };


                /*
                 * ----------------------------------------------------
                 * Interviewer finishes speaking
                 * ----------------------------------------------------
                 */

                utterance.onend =
                    () => {

                        setStatus(
                            "IDLE"
                        );


                        console.log(
                            "[Voice] Interviewer finished speaking."
                        );
                    };


                /*
                 * ----------------------------------------------------
                 * TTS error
                 * ----------------------------------------------------
                 */

                utterance.onerror =
                    event => {

                        console.error(
                            "[Voice] TTS error:",
                            event
                        );


                        setStatus(
                            "ERROR"
                        );


                        setError(
                            "Unable to play the interviewer voice."
                        );
                    };


                window.speechSynthesis.speak(
                    utterance
                );

            },
            [
                language,
            ]
        );


    /*
     * ============================================================
     * Stop interviewer speech
     * ============================================================
     */

    const stopSpeaking =
        useCallback(
            () => {

                window.speechSynthesis.cancel();


                setStatus(
                    "IDLE"
                );

            },
            []
        );


    /*
     * ============================================================
     * Cleanup
     * ============================================================
     */

    useEffect(() => {

        return () => {

            window.speechSynthesis.cancel();


            stopMicrophone();

        };

    }, [
        stopMicrophone,
    ]);


    /*
     * ============================================================
     * Public API
     * ============================================================
     */

    return {

        status,

        transcript,

        interimTranscript,

        error,

        isSupported,

        startListening,

        stopListening,

        speak,

        stopSpeaking,

    };
}


/*
|--------------------------------------------------------------------------
| AudioBuffer peak diagnostic
|--------------------------------------------------------------------------
*/

function peakOf(
    audioBuffer: AudioBuffer
): number {

    let peak =
        0;


    for (
        let channel = 0;
        channel <
        audioBuffer.numberOfChannels;
        channel++
    ) {

        const data =
            audioBuffer.getChannelData(
                channel
            );


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            peak =
                Math.max(
                    peak,
                    Math.abs(
                        data[i]
                    )
                );
        }
    }


    return peak;
}


/*
|--------------------------------------------------------------------------
| WAV encoder
|--------------------------------------------------------------------------
*/

function encodeWav(
    audioBuffer: AudioBuffer
): Blob {

    const channelCount =
        audioBuffer.numberOfChannels;


    const sampleRate =
        audioBuffer.sampleRate;


    const sampleCount =
        audioBuffer.length;


    /*
     * Mix channels into mono.
     */

    const mono =
        new Float32Array(
            sampleCount
        );


    for (
        let channel = 0;
        channel < channelCount;
        channel++
    ) {

        const channelData =
            audioBuffer.getChannelData(
                channel
            );


        for (
            let index = 0;
            index < sampleCount;
            index++
        ) {

            mono[index] +=
                channelData[index] /
                channelCount;
        }
    }


    const bytesPerSample =
        2;


    const blockAlign =
        bytesPerSample;


    const byteRate =
        sampleRate *
        blockAlign;


    const dataSize =
        sampleCount *
        bytesPerSample;


    const buffer =
        new ArrayBuffer(
            44 + dataSize
        );


    const view =
        new DataView(
            buffer
        );


    writeAscii(
        view,
        0,
        "RIFF"
    );


    view.setUint32(
        4,
        36 + dataSize,
        true
    );


    writeAscii(
        view,
        8,
        "WAVE"
    );


    writeAscii(
        view,
        12,
        "fmt "
    );


    view.setUint32(
        16,
        16,
        true
    );


    /*
     * PCM
     */

    view.setUint16(
        20,
        1,
        true
    );


    /*
     * Mono
     */

    view.setUint16(
        22,
        1,
        true
    );


    view.setUint32(
        24,
        sampleRate,
        true
    );


    view.setUint32(
        28,
        byteRate,
        true
    );


    view.setUint16(
        32,
        blockAlign,
        true
    );


    /*
     * 16-bit PCM
     */

    view.setUint16(
        34,
        16,
        true
    );


    writeAscii(
        view,
        36,
        "data"
    );


    view.setUint32(
        40,
        dataSize,
        true
    );


    let offset =
        44;


    for (
        let index = 0;
        index < mono.length;
        index++
    ) {

        const sample =
            Math.max(
                -1,
                Math.min(
                    1,
                    mono[index]
                )
            );


        const pcm =
            sample < 0

                ? Math.round(
                    sample *
                    0x8000
                )

                : Math.round(
                    sample *
                    0x7fff
                );


        view.setInt16(
            offset,
            pcm,
            true
        );


        offset +=
            bytesPerSample;
    }


    return new Blob(
        [
            buffer,
        ],
        {
            type:
                "audio/wav",
        }
    );
}


/*
|--------------------------------------------------------------------------
| ASCII writer
|--------------------------------------------------------------------------
*/

function writeAscii(
    view: DataView,
    offset: number,
    value: string
) {

    for (
        let index = 0;
        index < value.length;
        index++
    ) {

        view.setUint8(
            offset + index,
            value.charCodeAt(
                index
            )
        );
    }
}