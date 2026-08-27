import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    Button,
} from "@/components/ui/button";

import {
    useInterview,
} from "../hooks/useInterview";

import {
    useVoiceInterview,
} from "../hooks/useVoiceInterview";

import type {
    InterviewAudioConfig,
} from "../hooks/useVoiceInterview";

import type {
    InterviewMode,
    InterviewQuestion,
} from "../api/interview.api";



interface InterviewLocationState {

    question?:
    InterviewQuestion;

    turnId?:
    string;

    mode?:
    InterviewMode;
}


/*
|--------------------------------------------------------------------------
| Shared chrome
|--------------------------------------------------------------------------
*/

function PageChrome({
    children,
}: {
    children: React.ReactNode;
}) {

    return (

        <div className="relative min-h-screen w-full text-[#EDEAE4] antialiased selection:bg-[#C9A24B]/30 selection:text-[#C9A24B] font-sans">

            <style>{`

                @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

                .font-display {
                    font-family: 'Newsreader', ui-serif, Georgia, serif;
                    font-style: italic;
                }

                .font-body {
                    font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
                }

                .font-data {
                    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
                }

                @keyframes eqBar {
                    0%, 100% {
                        transform: scaleY(0.25);
                    }

                    50% {
                        transform: scaleY(1);
                    }
                }

                .eq-bar {
                    animation:
                        eqBar 1s ease-in-out infinite;
                    transform-origin:
                        center;
                }

                @keyframes breathe {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.55;
                    }

                    50% {
                        transform: scale(1.15);
                        opacity: 1;
                    }
                }

                .breathe-ring {
                    animation:
                        breathe 1.8s ease-in-out infinite;
                }

                @keyframes spinSlow {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                .spin-slow {
                    animation:
                        spinSlow 1.4s linear infinite;
                }

            `}</style>


            <div className="fixed inset-0 -z-10 bg-[#111214]">

                <div className="absolute -top-40 left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-[#C9A24B]/[0.05] blur-3xl" />

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1d21_1px,transparent_1px),linear-gradient(to_bottom,#1c1d21_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_45%_at_50%_30%,#000_50%,transparent_100%)]" />

            </div>


            {children}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Brand
|--------------------------------------------------------------------------
*/

function BrandMark() {

    return (

        <div className="flex items-center gap-2.5">

            <div className="relative flex h-6 w-6 items-center justify-center rounded-sm border border-[#C9A24B]/50">

                <div className="absolute inset-[2px] border border-[#C9A24B]/30 rounded-[1px]" />

                <span className="font-data text-[9px] text-[#C9A24B]">
                    IA
                </span>

            </div>


            <span className="font-body text-sm font-medium text-[#EDEAE4]">
                AI Interviewer
            </span>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Audio indicator
|--------------------------------------------------------------------------
*/

function VoiceIndicator({
    status,
}: {
    status:
    | "IDLE"
    | "SPEAKING"
    | "LISTENING"
    | "PROCESSING"
    | "ERROR";
}) {

    const ringClass =

        status === "SPEAKING"

            ? "bg-[#C9A24B]/15 ring-8 ring-[#C9A24B]/10"

            : status === "LISTENING"

                ? "bg-[#5E8869]/15 ring-8 ring-[#5E8869]/10"

                : status === "PROCESSING"

                    ? "bg-[#C9A24B]/10 ring-8 ring-[#C9A24B]/5"

                    : status === "ERROR"

                        ? "bg-[#C0665A]/10 ring-8 ring-[#C0665A]/10"

                        : "bg-[#C9A24B]/10 ring-8 ring-[#C9A24B]/5";


    const barColor =
        status === "LISTENING"
            ? "bg-[#5E8869]"
            : "bg-[#C9A24B]";


    return (

        <div
            className={`relative flex size-28 items-center justify-center rounded-full transition-all duration-500 ${status === "LISTENING"
                    ? "breathe-ring"
                    : ""
                } ${ringClass}`}
        >

            {(status === "SPEAKING" ||
                status === "LISTENING") && (

                    <div className="flex items-end justify-center gap-1.5 h-12">

                        {[0, 1, 2, 3, 4].map(
                            (i) => (

                                <span
                                    key={i}
                                    className={`eq-bar w-1.5 rounded-full ${barColor}`}
                                    style={{
                                        height:
                                            "100%",

                                        animationDelay:
                                            `${i * 110}ms`,
                                    }}
                                />

                            )
                        )}

                    </div>
                )}


            {status === "PROCESSING" && (

                <div className="spin-slow h-14 w-14 rounded-full border-2 border-[#C9A24B]/20 border-t-[#C9A24B]" />

            )}


            {status === "ERROR" && (

                <svg
                    className="h-10 w-10 text-[#C0665A]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />

                </svg>
            )}


            {status === "IDLE" && (

                <span className="h-3 w-3 rounded-full bg-[#C9A24B]" />

            )}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Question normalization
|--------------------------------------------------------------------------
*/

const normalizeInterviewQuestion = (
    value: unknown
): InterviewQuestion => {

    if (
        !value ||
        typeof value !== "object"
    ) {

        throw new Error(
            "Invalid interview question."
        );
    }


    const candidate =
        value as Record<string, unknown>;


    /*
     * Normal shape
     */

    if (
        typeof candidate.question ===
        "string"
    ) {

        return {

            question:
                candidate.question,

            claimId:
                typeof candidate.claimId ===
                    "string"
                    ? candidate.claimId
                    : undefined,

            reasoning:
                typeof candidate.reasoning ===
                    "string"
                    ? candidate.reasoning
                    : undefined,

            expectedTopics:
                Array.isArray(
                    candidate.expectedTopics
                )

                    ? candidate.expectedTopics.filter(
                        (
                            topic
                        ): topic is string =>
                            typeof topic ===
                            "string"
                    )

                    : undefined,
        };
    }


    /*
     * Nested runtime shape
     */

    if (
        candidate.question &&
        typeof candidate.question ===
        "object"
    ) {

        return normalizeInterviewQuestion(
            candidate.question
        );
    }


    throw new Error(
        "Interview question text is missing."
    );
};


/*
|--------------------------------------------------------------------------
| Interview Page
|--------------------------------------------------------------------------
*/

export default function InterviewPage() {

    const {
        sessionId,
    } = useParams<{
        sessionId: string;
    }>();


    const navigate =
        useNavigate();


    const location =
        useLocation();


    const locationState =
        location.state as
        | InterviewLocationState
        | null;


    const mode:
        InterviewMode =
        locationState?.mode ===
            "VIDEO"
            ? "VIDEO"
            : "VOICE";


    const initialQuestion =
        locationState?.question;


    const initialTurnId =
        locationState?.turnId;


    const [
        answer,
        setAnswer,
    ] = useState("");


    /*
     * ------------------------------------------------------------
     * Validate session information
     * ------------------------------------------------------------
     */

    if (
        !sessionId ||
        !initialQuestion ||
        !initialTurnId
    ) {

        return (

            <PageChrome>

                <div className="flex min-h-screen items-center justify-center p-6">

                    <Card className="w-full max-w-md border-[#26272C] bg-[#16171A] rounded-lg overflow-hidden">

                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C0665A]/70 to-transparent" />

                        <CardContent className="space-y-5 p-8 text-center font-body">

                            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#C0665A]/30 bg-[#C0665A]/10 text-[#C0665A]">

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />

                                </svg>

                            </div>


                            <h1 className="font-display text-xl font-medium text-[#F5F3EE]">
                                Interview session unavailable
                            </h1>


                            <p className="text-sm text-[#8B8A85] leading-relaxed">
                                This interview session could not be restored.
                                Please start a new interview from the dashboard.
                            </p>


                            <Button
                                className="w-full rounded-md bg-[#C9A24B] hover:bg-[#DAB768] text-[#111214] font-semibold"
                                onClick={() =>
                                    navigate(
                                        "/dashboard",
                                        {
                                            replace:
                                                true,
                                        }
                                    )
                                }
                            >
                                Back to Dashboard
                            </Button>

                        </CardContent>

                    </Card>

                </div>

            </PageChrome>
        );
    }


    return (

        <InterviewSession

            sessionId={
                sessionId
            }

            initialQuestion={
                initialQuestion
            }

            initialTurnId={
                initialTurnId
            }

            mode={
                mode
            }

            answer={
                answer
            }

            setAnswer={
                setAnswer
            }

        />
    );
}


/*
|--------------------------------------------------------------------------
| Interview Session
|--------------------------------------------------------------------------
*/

interface InterviewSessionProps {

    sessionId:
    string;

    initialQuestion:
    InterviewQuestion;

    initialTurnId:
    string;

    mode:
    InterviewMode;

    answer:
    string;

    setAnswer:
    (
        value: string
    ) => void;
}


function InterviewSession({
    sessionId,
    initialQuestion,
    initialTurnId,
    mode,
    answer,
    setAnswer,
}: InterviewSessionProps) {

    const navigate =
        useNavigate();


    const {
        question,

        turnId,

        isSubmitting,

        isCompleted,

        error:
        interviewError,

        submitTurn,

        endInterview,

    } =
        useInterview({

            sessionId,

            initialQuestion,

            initialTurnId,
        });


    /*
     * ------------------------------------------------------------
     * Audio configuration
     * ------------------------------------------------------------
     *
     * The candidate explicitly selects and tests the microphone
     * before the voice interview begins.
     */

    const [
        audioConfig,
        setAudioConfig,
    ] = useState<InterviewAudioConfig | null>(
        null
    );


    /*
     * ------------------------------------------------------------
     * Normalize current question
     * ------------------------------------------------------------
     */

    const currentQuestion =
        normalizeInterviewQuestion(
            question ??
            initialQuestion
        );


    /*
     * ------------------------------------------------------------
     * Voice started
     * ------------------------------------------------------------
     */

    const [
        voiceStarted,
        setVoiceStarted,
    ] = useState(false);


    /*
     * ------------------------------------------------------------
     * Submit voice transcript
     * ------------------------------------------------------------
     */

    const handleVoiceTranscript =
        useCallback(
            async (
                transcript: string
            ) => {

                await submitTurn(
                    transcript,
                    "VOICE"
                );

            },
            [
                submitTurn,
            ]
        );


    /*
     * ------------------------------------------------------------
     * Voice hook
     * ------------------------------------------------------------
     */

    const {
        status:
        voiceStatus,

        transcript,

        interimTranscript,

        error:
        voiceError,

        isSupported,

        startListening,

        stopListening,

        speak,

        stopSpeaking,

    } =
        useVoiceInterview({

            language:
                "en-US",

            audioConfig:
                audioConfig,

            onTranscript:
                handleVoiceTranscript,
        });


    /*
     * ------------------------------------------------------------
     * Automatically speak current question
     * ------------------------------------------------------------
     */

    useEffect(() => {

        if (
            mode !== "VOICE" ||
            !voiceStarted
        ) {

            return;
        }


        speak(
            currentQuestion.question
        );

    }, [
        mode,
        voiceStarted,
        currentQuestion.question,
        speak,
    ]);


    /*
     * ------------------------------------------------------------
     * Text answer submission
     * ------------------------------------------------------------
     */

    const handleTextSubmit =
        async () => {

            const trimmed =
                answer.trim();


            if (
                !trimmed ||
                isSubmitting
            ) {

                return;
            }


            try {

                await submitTurn(
                    trimmed,
                    "TEXT"
                );


                setAnswer("");

            } catch {
                /*
                 * useInterview already stores
                 * the error.
                 */
            }
        };


    /*
     * ------------------------------------------------------------
     * Begin voice interview
     * ------------------------------------------------------------
     */

    const handleBeginVoice =
        () => {

            setVoiceStarted(
                true
            );
        };


    /*
     * ------------------------------------------------------------
     * Change audio setup
     * ------------------------------------------------------------
     */

    const handleChangeAudio =
        () => {

            stopSpeaking();

            stopListening();

            setVoiceStarted(
                false
            );

            setAudioConfig(
                null
            );
        };


    /*
     * ------------------------------------------------------------
     * End interview
     * ------------------------------------------------------------
     */

    const handleEndInterview =
        async () => {

            stopSpeaking();

            stopListening();


            try {

                await endInterview();

            } finally {

                navigate(
                    "/dashboard",
                    {
                        replace:
                            true,
                    }
                );
            }
        };


    /*
     * ------------------------------------------------------------
     * Interview complete
     * ------------------------------------------------------------
     */

    if (isCompleted) {

        return (

            <PageChrome>

                <div className="flex min-h-screen items-center justify-center p-6">

                    <Card className="w-full max-w-md border-[#26272C] bg-[#16171A] rounded-lg overflow-hidden">

                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#5E8869]/70 to-transparent" />

                        <CardContent className="space-y-6 p-8 text-center font-body">

                            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#3F5B44] bg-[#3F5B44]/10 text-[#5E8869]">

                                <svg
                                    className="h-7 w-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.75}
                                        d="M4.5 12.75l6 6 9-13.5"
                                    />

                                </svg>

                            </div>


                            <div>

                                <h1 className="font-display text-2xl font-medium text-[#F5F3EE]">
                                    Interview complete
                                </h1>


                                <p className="mt-2 text-sm text-[#8B8A85]">
                                    Your interview session has ended.
                                </p>

                            </div>


                            <div className="mx-auto inline-flex -rotate-6 rounded-sm border-2 border-[#3F5B44] px-3 py-1.5">

                                <span className="font-data text-[11px] tracking-[0.15em] text-[#5E8869] font-medium uppercase">
                                    Session Logged
                                </span>

                            </div>


                            <Button
                                className="w-full rounded-md bg-[#C9A24B] hover:bg-[#DAB768] text-[#111214] font-semibold"
                                onClick={() =>
                                    navigate(
                                        "/dashboard",
                                        {
                                            replace:
                                                true,
                                        }
                                    )
                                }
                            >
                                Back to Dashboard
                            </Button>

                        </CardContent>

                    </Card>

                </div>

            </PageChrome>
        );
    }


    /*
     * ------------------------------------------------------------
     * Voice mode - audio setup
     * ------------------------------------------------------------
     */

    if (
        mode ===
        "VOICE" &&
        !audioConfig
    ) {

        return (

            <AudioSetup

                onComplete={
                    setAudioConfig
                }

                onCancel={
                    handleEndInterview
                }

            />
        );
    }


    /*
     * ------------------------------------------------------------
     * Voice mode
     * ------------------------------------------------------------
     */

    if (
        mode ===
        "VOICE"
    ) {

        return (

            <VoiceInterviewUI

                question={
                    currentQuestion.question
                }

                turnId={
                    turnId
                }

                status={
                    voiceStatus
                }

                transcript={
                    transcript
                }

                interimTranscript={
                    interimTranscript
                }

                isSupported={
                    isSupported
                }

                error={
                    voiceError ??
                    interviewError
                }

                voiceStarted={
                    voiceStarted
                }

                isSubmitting={
                    isSubmitting
                }

                onBegin={
                    handleBeginVoice
                }

                onListen={
                    startListening
                }

                onStopListening={
                    stopListening
                }

                onStopSpeaking={
                    stopSpeaking
                }

                onChangeAudio={
                    handleChangeAudio
                }

                onEnd={
                    handleEndInterview
                }

            />
        );
    }


    /*
     * ------------------------------------------------------------
     * Video mode
     * ------------------------------------------------------------
     */

    return (

        <PageChrome>

            <div className="min-h-screen p-4 sm:p-6">

                <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center">

                    <Card className="w-full overflow-hidden border-[#26272C] bg-[#16171A] rounded-lg">

                        <CardContent className="p-0">

                            <div className="flex min-h-[520px] flex-col font-body">

                                <header className="flex items-center justify-between border-b border-[#26272C] px-5 py-4 sm:px-7">

                                    <BrandMark />

                                    <div className="rounded-full border border-[#3A3B41] bg-[#1D1E23] px-3 py-1.5 font-data text-[10px] tracking-wide text-[#8B8A85] uppercase">
                                        Video mode
                                    </div>

                                </header>


                                <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10">

                                    <div className="relative mx-auto flex h-64 w-full max-w-2xl items-center justify-center rounded-2xl border border-[#26272C] bg-[#111214]">

                                        <span className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l border-t border-[#C9A24B]/40" />

                                        <span className="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r border-t border-[#C9A24B]/40" />

                                        <span className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b border-l border-[#C9A24B]/40" />

                                        <span className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b border-r border-[#C9A24B]/40" />


                                        <div className="text-center">

                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#26272C] bg-[#16171A] text-[#C9A24B]">

                                                <svg
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M15.75 10.5l4.72-4.72a.75.75 0 01.28-.72V18.87a.75.75 0 01-.28-.72L15.75 13.5M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                                                    />

                                                </svg>

                                            </div>


                                            <p className="mt-3 font-data text-[10.5px] tracking-wide text-[#5C5B57] uppercase">
                                                Camera implementation comes next
                                            </p>

                                        </div>

                                    </div>


                                    <div className="mx-auto mt-8 w-full max-w-3xl text-center">

                                        <p className="mb-3 font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase">
                                            AI Interviewer
                                        </p>


                                        <h1 className="text-xl font-semibold leading-relaxed text-[#F5F3EE] sm:text-2xl">
                                            {currentQuestion.question}
                                        </h1>

                                    </div>


                                    <div className="mx-auto mt-10 w-full max-w-2xl">

                                        <textarea
                                            value={
                                                answer
                                            }

                                            onChange={(
                                                event
                                            ) =>
                                                setAnswer(
                                                    event.target.value
                                                )
                                            }

                                            placeholder="Type your answer here for now..."

                                            disabled={
                                                isSubmitting
                                            }

                                            className="min-h-36 w-full resize-none rounded-xl border border-[#26272C] bg-[#111214] p-4 text-sm text-[#EDEAE4] placeholder:text-[#4A4B51] outline-none focus:border-[#C9A24B]"

                                            onKeyDown={(
                                                event
                                            ) => {

                                                if (
                                                    event.key ===
                                                    "Enter" &&
                                                    !event.shiftKey
                                                ) {

                                                    event.preventDefault();

                                                    void handleTextSubmit();
                                                }

                                            }}
                                        />


                                        {interviewError && (

                                            <p className="mt-4 text-sm text-[#D89A8D]">
                                                {interviewError}
                                            </p>

                                        )}


                                        <div className="mt-5 flex justify-between gap-3">

                                            <Button
                                                variant="destructive"
                                                disabled={
                                                    isSubmitting
                                                }
                                                onClick={
                                                    handleEndInterview
                                                }
                                                className="rounded-md bg-[#C0665A] hover:bg-[#B75B50]"
                                            >
                                                End Interview
                                            </Button>


                                            <Button
                                                disabled={
                                                    !answer.trim() ||
                                                    isSubmitting
                                                }
                                                onClick={
                                                    handleTextSubmit
                                                }
                                                className="rounded-md bg-[#C9A24B] hover:bg-[#DAB768] text-[#111214] font-semibold"
                                            >
                                                {isSubmitting
                                                    ? "Thinking..."
                                                    : "Send Answer"}
                                            </Button>

                                        </div>

                                    </div>

                                </main>

                            </div>

                        </CardContent>

                    </Card>

                </div>

            </div>

        </PageChrome>
    );
}



/*
|--------------------------------------------------------------------------
| Audio setup
|--------------------------------------------------------------------------
*/

interface RawAudioDevice {
    deviceId: string;
    label: string;
    groupId: string;
}

interface AudioDeviceOption {
    deviceId: string;
    label: string;
    aliases: string[];
}

type AudioSetupChoice =
    | "BLUETOOTH"
    | "WIRED"
    | "COMPUTER";

function AudioSetup({
    onComplete,
    onCancel,
}: {
    onComplete: (config: InterviewAudioConfig) => void;
    onCancel: () => Promise<void>;
}) {
    const [microphones, setMicrophones] =
        useState<AudioDeviceOption[]>([]);

    const [speakers, setSpeakers] =
        useState<AudioDeviceOption[]>([]);

    const [selectedMicrophone, setSelectedMicrophone] =
        useState("");

    const [selectedSpeaker, setSelectedSpeaker] =
        useState("");

    const [selectedSetup, setSelectedSetup] =
        useState<AudioSetupChoice>("COMPUTER");

    const [microphoneReady, setMicrophoneReady] =
        useState(false);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [notice, setNotice] =
        useState<string | null>(null);

    const loadDevices =
        useCallback(
            async () => {
                setIsLoading(true);
                setError(null);
                setNotice(null);
                setMicrophoneReady(false);

                try {
                    if (!navigator.mediaDevices?.getUserMedia) {
                        throw new Error(
                            "Your browser does not support microphone access."
                        );
                    }

                    /*
                     * Request permission first so Chromium can expose
                     * meaningful device labels.
                     */
                    const permissionStream =
                        await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: false,
                        });

                    for (const track of permissionStream.getTracks()) {
                        track.stop();
                    }

                    const devices =
                        await navigator.mediaDevices.enumerateDevices();

                    const rawInputs: RawAudioDevice[] =
                        devices
                            .filter(
                                device =>
                                    device.kind === "audioinput"
                            )
                            .filter(
                                device =>
                                    !isVirtualAudioDevice(device.label)
                            )
                            .map(device => ({
                                deviceId: device.deviceId,
                                label: device.label || "Microphone",
                                groupId: device.groupId,
                            }));

                    const rawOutputs: RawAudioDevice[] =
                        devices
                            .filter(
                                device =>
                                    device.kind === "audiooutput"
                            )
                            .map(device => ({
                                deviceId: device.deviceId,
                                label: device.label || "Speaker",
                                groupId: device.groupId,
                            }));

                    const normalizedInputs =
                        normalizeAudioDevices(
                            rawInputs,
                            "input"
                        );

                    const normalizedOutputs =
                        normalizeAudioDevices(
                            rawOutputs,
                            "output"
                        );

                    setMicrophones(normalizedInputs);
                    setSpeakers(normalizedOutputs);

                    if (normalizedInputs.length === 0) {
                        throw new Error(
                            "No microphone is currently available. Connect a microphone or headset and refresh."
                        );
                    }

                    /*
                     * Prefer a real headset/earbud microphone when available.
                     * Otherwise use the computer microphone.
                     */
                    const preferredInput =
                        choosePreferredMicrophone(
                            normalizedInputs
                        );

                    const preferredOutput =
                        choosePreferredSpeaker(
                            normalizedOutputs
                        );

                    setSelectedMicrophone(
                        preferredInput?.deviceId ?? ""
                    );

                    setSelectedSpeaker(
                        preferredOutput?.deviceId ?? ""
                    );

                    const bluetoothAvailable =
                        hasBluetoothStyleDevice(
                            normalizedInputs,
                            normalizedOutputs
                        );

                    const wiredAvailable =
                        hasWiredHeadset(
                            normalizedInputs,
                            normalizedOutputs
                        );

                    /*
                     * Preserve a sensible selection after refresh.
                     * Prefer Bluetooth, then wired, then computer.
                     */
                    if (bluetoothAvailable) {
                        setSelectedSetup("BLUETOOTH");

                    } else if (wiredAvailable) {
                        setSelectedSetup("WIRED");

                    } else {
                        setSelectedSetup("COMPUTER");
                    }

                } catch (loadError) {
                    console.error(
                        "[AudioSetup] Device discovery failed:",
                        loadError
                    );

                    setError(
                        formatAudioError(
                            loadError
                        )
                    );

                } finally {
                    setIsLoading(false);
                }
            },
            []
        );

    useEffect(() => {
        void loadDevices();
    }, [loadDevices]);

    /*
     * ------------------------------------------------------------
     * Derived availability
     * ------------------------------------------------------------
     */

    const bluetoothAvailable =
        hasBluetoothStyleDevice(
            microphones,
            speakers
        );

    const wiredAvailable =
        hasWiredHeadset(
            microphones,
            speakers
        );

    const computerMicrophoneAvailable =
        microphones.some(
            device =>
                device.label === "Computer microphone"
        );

    const computerSpeakerAvailable =
        speakers.some(
            device =>
                device.label === "Computer speakers"
        ) ||
        speakers.length === 0;

    const computerAudioAvailable =
        computerMicrophoneAvailable &&
        computerSpeakerAvailable;

    /*
     * ------------------------------------------------------------
     * Helpers for setup-card selection
     * ------------------------------------------------------------
     */

    const applySetupChoice = (
        choice: AudioSetupChoice
    ) => {
        setSelectedSetup(choice);
        setError(null);
        setMicrophoneReady(false);

        if (choice === "BLUETOOTH") {
            const bluetoothMic =
                microphones.find(
                    device =>
                        isBluetoothStyleLabel(
                            device.label
                        )
                );

            const bluetoothSpeaker =
                speakers.find(
                    device =>
                        isBluetoothStyleLabel(
                            device.label
                        )
                );

            if (bluetoothMic) {
                setSelectedMicrophone(
                    bluetoothMic.deviceId
                );
            }

            if (bluetoothSpeaker) {
                setSelectedSpeaker(
                    bluetoothSpeaker.deviceId
                );
            }

            if (!bluetoothMic) {
                setNotice(
                    bluetoothSpeaker
                        ? "Your earbuds are available for interviewer audio, but their microphone is not currently available. The computer microphone will be used for your answers."
                        : "Your Bluetooth earbuds are not currently available. Refresh the device list and try again."
                );

                const computerMic =
                    microphones.find(
                        device =>
                            device.label ===
                            "Computer microphone"
                    );

                if (computerMic) {
                    setSelectedMicrophone(
                        computerMic.deviceId
                    );
                }
            }

            return;
        }

        if (choice === "WIRED") {
            const wiredMic =
                microphones.find(
                    device =>
                        isWiredHeadsetLabel(
                            device.label
                        )
                );

            const wiredSpeaker =
                speakers.find(
                    device =>
                        isWiredHeadsetLabel(
                            device.label
                        )
                );

            if (wiredMic) {
                setSelectedMicrophone(
                    wiredMic.deviceId
                );
            }

            if (wiredSpeaker) {
                setSelectedSpeaker(
                    wiredSpeaker.deviceId
                );
            }

            if (!wiredMic) {
                const computerMic =
                    microphones.find(
                        device =>
                            device.label ===
                            "Computer microphone"
                    );

                if (computerMic) {
                    setSelectedMicrophone(
                        computerMic.deviceId
                    );
                }

                setNotice(
                    "The wired headset microphone is not available, so the computer microphone will be used for your answers."
                );
            }

            return;
        }

        const computerMic =
            microphones.find(
                device =>
                    device.label ===
                    "Computer microphone"
            );

        const computerSpeaker =
            speakers.find(
                device =>
                    device.label ===
                    "Computer speakers"
            );

        if (computerMic) {
            setSelectedMicrophone(
                computerMic.deviceId
            );
        }

        if (computerSpeaker) {
            setSelectedSpeaker(
                computerSpeaker.deviceId
            );
        }

        setNotice(
            "Your computer microphone and speakers will be used for the interview."
        );
    };

    const testMicrophone = async () => {
        if (!selectedMicrophone) {
            setError(
                "Select an available microphone first."
            );
            return;
        }

        setIsLoading(true);
        setMicrophoneReady(false);
        setError(null);

        let stream: MediaStream | null = null;
        let audioContext: AudioContext | null = null;

        try {
            const constraints: MediaTrackConstraints = {
                /*
                 * During the device check we want to measure the raw
                 * microphone signal. Browser echo/noise processing can
                 * suppress a short or quiet laptop-mic utterance and make
                 * a working microphone look silent.
                 */
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            };

            if (
                selectedMicrophone !== "default"
            ) {
                constraints.deviceId = {
                    exact:
                        selectedMicrophone,
                };
            }

            stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: constraints,
                    video: false,
                });

            const track =
                stream.getAudioTracks()[0];

            if (
                !track ||
                track.readyState !== "live"
            ) {
                throw new Error(
                    "The selected microphone could not be activated."
                );
            }

            console.log(
                "[AudioSetup] Selected microphone test:",
                {
                    label:
                        track.label,
                    deviceId:
                        track.getSettings().deviceId,
                    muted:
                        track.muted,
                    readyState:
                        track.readyState,
                }
            );

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
                    "Your browser does not support microphone testing."
                );
            }

            audioContext =
                new AudioContextClass();

            if (
                audioContext.state ===
                "suspended"
            ) {
                await audioContext.resume();
            }

            const source =
                audioContext.createMediaStreamSource(
                    stream
                );

            const analyser =
                audioContext.createAnalyser();

            analyser.fftSize =
                2048;

            analyser.smoothingTimeConstant =
                0.15;

            source.connect(
                analyser
            );

            const samples =
                new Float32Array(
                    analyser.fftSize
                );

            let peak = 0;
            let rms = 0;

            setNotice(
                "Speak now. We are listening for your voice..."
            );

            /*
             * Give the candidate a comfortable window to speak.
             * Laptop microphones may need a moment to wake up and
             * browser audio processing is intentionally disabled above
             * during this test.
             */
            const deadline =
                Date.now() + 3500;

            while (
                Date.now() < deadline
            ) {
                analyser.getFloatTimeDomainData(
                    samples
                );

                let sumSquares = 0;

                for (
                    let index = 0;
                    index < samples.length;
                    index++
                ) {
                    const value =
                        samples[index];

                    const absolute =
                        Math.abs(value);

                    peak = Math.max(
                        peak,
                        absolute
                    );

                    sumSquares +=
                        value * value;
                }

                rms = Math.max(
                    rms,
                    Math.sqrt(
                        sumSquares /
                        samples.length
                    )
                );

                /*
                 * Very low thresholds are intentional here.
                 * We are only answering: "Is there a real signal?"
                 * The actual interview recording still uses its normal
                 * echo/noise/gain processing.
                 */
                if (
                    peak >= 0.001 ||
                    rms >= 0.0003
                ) {
                    break;
                }

                await new Promise<void>(
                    resolve =>
                        setTimeout(
                            resolve,
                            50
                        )
                );
            }

            console.log(
                "[AudioSetup] Microphone level:",
                {
                    device:
                        track.label,
                    peak,
                    rms,
                }
            );

            if (
                peak < 0.001 &&
                rms < 0.0003
            ) {
                const settings =
                    track.getSettings();

                if (track.muted) {
                    throw new Error(
                        "The microphone is being reported as muted by the browser or operating system. Check your microphone mute switch or Windows microphone settings and try again."
                    );
                }

                throw new Error(
                    `No microphone signal was detected. Peak: ${peak.toFixed(6)}, RMS: ${rms.toFixed(6)}, device: ${settings.deviceId ?? "unknown"}.`
                );
            }

            setMicrophoneReady(
                true
            );

            setNotice(
                `Microphone ready: ${friendlyDeviceLabel(
                    track.label,
                    "input"
                )}.`
            );

        } catch (testError) {
            console.error(
                "[AudioSetup] Microphone test failed:",
                testError
            );

            setMicrophoneReady(
                false
            );

            setError(
                formatAudioError(
                    testError
                )
            );

        } finally {
            if (audioContext) {
                try {
                    await audioContext.close();
                } catch {
                    // Ignore cleanup errors.
                }
            }

            if (stream) {
                for (
                    const track of
                    stream.getTracks()
                ) {
                    track.stop();
                }
            }

            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        if (!selectedMicrophone) {
            setError(
                "A microphone is required to take a voice interview."
            );
            return;
        }

        if (!microphoneReady) {
            setError(
                "Please test your microphone before continuing."
            );
            return;
        }

        const selectedInput =
            microphones.find(
                device =>
                    device.deviceId ===
                    selectedMicrophone
            );

        const selectedOutput =
            speakers.find(
                device =>
                    device.deviceId ===
                    selectedSpeaker
            );

        onComplete({
            inputDeviceId:
                selectedMicrophone,

            inputDeviceLabel:
                selectedInput?.label ??
                "Selected microphone",

            outputDeviceId:
                selectedOutput?.deviceId ??
                null,

            outputDeviceLabel:
                selectedOutput?.label ??
                "System default speaker",
        });
    };

    return (
        <PageChrome>
            <div className="min-h-screen p-4 sm:p-6">
                <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center">
                    <Card className="w-full overflow-hidden border-[#26272C] bg-[#16171A] rounded-lg">
                        <CardContent className="p-0">
                            <div className="flex flex-col font-body">
                                <header className="border-b border-[#26272C] px-5 py-4 sm:px-7">
                                    <BrandMark />
                                </header>

                                <main className="px-5 py-5 sm:px-7 sm:py-6">
                                    <div className="mx-auto w-full max-w-5xl">
                                        <p className="font-data text-[10px] tracking-[0.2em] text-[#C9A24B] uppercase">
                                            Before you begin
                                        </p>

                                        <h1 className="mt-2 font-display text-[2.5rem] font-medium text-[#F5F3EE] sm:text-[2.75rem]">
                                            How will you take the interview?
                                        </h1>

                                        <p className="mt-3 max-w-4xl text-sm leading-6 text-[#8B8A85] sm:text-base">
                                            Choose from the audio devices currently available on your computer. We hide Windows duplicate aliases so you only see meaningful devices.
                                        </p>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {bluetoothAvailable && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applySetupChoice(
                                                            "BLUETOOTH"
                                                        )
                                                    }
                                                    className={`rounded-2xl border p-5 text-left transition-all ${
                                                        selectedSetup === "BLUETOOTH"
                                                            ? "border-[#C9A24B] bg-[#C9A24B]/[0.08] shadow-[0_0_0_1px_rgba(201,162,75,0.18)]"
                                                            : "border-[#26272C] bg-[#111214] hover:border-[#3A3B41]"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A3B41] bg-[#16171A] text-[#C9A24B]">
                                                            <AudioSetupBluetoothIcon />
                                                        </div>

                                                        {selectedSetup === "BLUETOOTH" && (
                                                            <span className="rounded-full border border-[#C9A24B]/40 px-3 py-1 font-data text-[10px] tracking-[0.14em] text-[#C9A24B] uppercase">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h2 className="mt-3 text-lg font-semibold text-[#F5F3EE]">
                                                        Bluetooth earbuds
                                                    </h2>

                                                    <p className="mt-1.5 text-sm leading-5 text-[#8B8A85]">
                                                        Use your available wireless earbuds or Bluetooth headset.
                                                    </p>
                                                </button>
                                            )}

                                            {wiredAvailable && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applySetupChoice(
                                                            "WIRED"
                                                        )
                                                    }
                                                    className={`rounded-2xl border p-5 text-left transition-all ${
                                                        selectedSetup === "WIRED"
                                                            ? "border-[#C9A24B] bg-[#C9A24B]/[0.08] shadow-[0_0_0_1px_rgba(201,162,75,0.18)]"
                                                            : "border-[#26272C] bg-[#111214] hover:border-[#3A3B41]"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A3B41] bg-[#16171A] text-[#C9A24B]">
                                                            <AudioSetupWiredIcon />
                                                        </div>

                                                        {selectedSetup === "WIRED" && (
                                                            <span className="rounded-full border border-[#C9A24B]/40 px-3 py-1 font-data text-[10px] tracking-[0.14em] text-[#C9A24B] uppercase">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h2 className="mt-3 text-lg font-semibold text-[#F5F3EE]">
                                                        Wired headset
                                                    </h2>

                                                    <p className="mt-1.5 text-sm leading-5 text-[#8B8A85]">
                                                        Use a currently connected wired headset or earphones.
                                                    </p>
                                                </button>
                                            )}

                                            {computerAudioAvailable && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applySetupChoice(
                                                            "COMPUTER"
                                                        )
                                                    }
                                                    className={`rounded-2xl border p-5 text-left transition-all ${
                                                        selectedSetup === "COMPUTER"
                                                            ? "border-[#C9A24B] bg-[#C9A24B]/[0.08] shadow-[0_0_0_1px_rgba(201,162,75,0.18)]"
                                                            : "border-[#26272C] bg-[#111214] hover:border-[#3A3B41]"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A3B41] bg-[#16171A] text-[#C9A24B]">
                                                            <AudioSetupComputerIcon />
                                                        </div>

                                                        {selectedSetup === "COMPUTER" && (
                                                            <span className="rounded-full border border-[#C9A24B]/40 px-3 py-1 font-data text-[10px] tracking-[0.14em] text-[#C9A24B] uppercase">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h2 className="mt-3 text-lg font-semibold text-[#F5F3EE]">
                                                        Computer audio
                                                    </h2>

                                                    <p className="mt-1.5 text-sm leading-5 text-[#8B8A85]">
                                                        Use your computer microphone and speakers.
                                                    </p>
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-5">
                                            <div className="rounded-2xl border border-[#26272C] bg-[#111214] p-5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="font-data text-[10px] tracking-[0.15em] text-[#8B8A85] uppercase">
                                                            Microphone
                                                        </p>

                                                        <p className="mt-1 text-sm text-[#F5F3EE]">
                                                            {selectedSetup === "BLUETOOTH"
                                                                ? "The microphone used for your answers."
                                                                : selectedSetup === "WIRED"
                                                                    ? "The microphone used for your answers."
                                                                    : "Your computer microphone will record your answers."}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => void loadDevices()}
                                                        disabled={isLoading}
                                                        className="text-xs text-[#C9A24B] transition-colors hover:text-[#DAB768] disabled:opacity-50"
                                                    >
                                                        Refresh
                                                    </button>
                                                </div>

                                                <select
                                                    value={selectedMicrophone}
                                                    onChange={event => {
                                                        setSelectedMicrophone(
                                                            event.target.value
                                                        );
                                                        setMicrophoneReady(false);
                                                        setError(null);
                                                    }}
                                                    disabled={
                                                        isLoading ||
                                                        microphones.length === 0
                                                    }
                                                    className="mt-3 w-full rounded-lg border border-[#3A3B41] bg-[#16171A] px-4 py-3 text-sm text-[#F5F3EE] outline-none focus:border-[#C9A24B]"
                                                >
                                                    {microphones.length === 0 ? (
                                                        <option value="">
                                                            No microphone available
                                                        </option>
                                                    ) : (
                                                        microphones.map(
                                                            device => (
                                                                <option
                                                                    key={
                                                                        device.deviceId
                                                                    }
                                                                    value={
                                                                        device.deviceId
                                                                    }
                                                                >
                                                                    {
                                                                        device.label
                                                                    }
                                                                </option>
                                                            )
                                                        )
                                                    )}
                                                </select>

                                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="text-xs leading-5 text-[#8B8A85]">
                                                        Say “I am ready for the interview” during the test.
                                                    </p>

                                                    <Button
                                                        type="button"
                                                        onClick={testMicrophone}
                                                        disabled={
                                                            isLoading ||
                                                            !selectedMicrophone
                                                        }
                                                        className="shrink-0 rounded-md bg-[#C9A24B] text-[#111214] hover:bg-[#DAB768]"
                                                    >
                                                        Test microphone
                                                    </Button>
                                                </div>

                                                {microphoneReady && (
                                                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#3F5B44] bg-[#3F5B44]/10 px-4 py-3 text-sm text-[#7DB08B]">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-[#5E8869]" />
                                                        Microphone is working.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {notice && (
                                            <div className="mt-5 rounded-lg border border-[#26272C] bg-[#111214] px-4 py-3 text-xs leading-5 text-[#8B8A85]">
                                                {notice}
                                            </div>
                                        )}

                                        {error && (
                                            <div className="mt-5 rounded-lg border border-[#C0665A]/30 bg-[#C0665A]/[0.08] px-4 py-3 text-sm leading-6 text-[#D89A8D]">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    void onCancel();
                                                }}
                                                disabled={isLoading}
                                                className="border-[#3A3B41] bg-transparent text-[#B8B6B0] hover:bg-[#1A1B20] hover:text-[#F5F3EE]"
                                            >
                                                Back
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={handleContinue}
                                                disabled={
                                                    isLoading ||
                                                    !selectedMicrophone ||
                                                    !microphoneReady
                                                }
                                                className="rounded-md bg-[#C9A24B] text-[#111214] font-semibold hover:bg-[#DAB768]"
                                            >
                                                Continue to interview
                                            </Button>
                                        </div>
                                    </div>
                                </main>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageChrome>
    );
}


function AudioSetupBluetoothIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 14.25v-2.5a7.5 7.5 0 0115 0v2.5"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 13.5H6a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 016 18.5H4.5a1.5 1.5 0 01-1.5-1.5v-2a1.5 1.5 0 011.5-1.5zm15 0H18a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-2a1.5 1.5 0 00-1.5-1.5z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19.5h2.5a2 2 0 002-2v-.25"
            />
        </svg>
    );
}

function AudioSetupWiredIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13.5V12a7 7 0 0114 0v1.5"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13.5H6.25A1.25 1.25 0 017.5 14.75V17A1.25 1.25 0 016.25 18.25H5A1.25 1.25 0 013.75 17v-2.25A1.25 1.25 0 015 13.5zm14 0h-1.25a1.25 1.25 0 00-1.25 1.25V17a1.25 1.25 0 001.25 1.25H19A1.25 1.25 0 0020.25 17v-2.25A1.25 1.25 0 0019 13.5z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 18.25h1.25a1.75 1.75 0 011.75 1.75v.25"
            />
        </svg>
    );
}

function AudioSetupComputerIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 6.75h14A1.5 1.5 0 0120.5 8.25v7.5A1.5 1.5 0 0119 17.25H5a1.5 1.5 0 01-1.5-1.5v-7.5A1.5 1.5 0 015 6.75z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20.25h6M12 17.25v3"
            />
        </svg>
    );
}

function normalizeAudioDevices(
    devices: RawAudioDevice[],
    kind: "input" | "output"
): AudioDeviceOption[] {
    /*
     * Browser/Windows exposes aliases such as:
     *
     *   default
     *   communications
     *
     * These are NOT separate physical devices.
     *
     * Prefer real device entries whenever possible.
     */
    const physicalDevices =
        devices.filter(
            device =>
                device.deviceId !== "default" &&
                device.deviceId !== "communications"
        );

    const sourceDevices =
        physicalDevices.length > 0
            ? physicalDevices
            : devices.filter(
                device =>
                    device.deviceId === "default"
            );

    const groups = new Map<
        string,
        AudioDeviceOption
    >();

    for (const device of sourceDevices) {
        const label =
            device.label.trim();

        const normalizedKey =
            getPhysicalDeviceKey(
                device,
                kind
            );

        const friendlyLabel =
            friendlyDeviceLabel(
                label,
                kind
            );

        const existing =
            groups.get(
                normalizedKey
            );

        if (existing) {
            if (!existing.aliases.includes(label)) {
                existing.aliases.push(label);
            }

            if (
                shouldPreferDeviceId(
                    device,
                    existing.deviceId,
                    kind
                )
            ) {
                existing.deviceId =
                    device.deviceId;
            }

            continue;
        }

        groups.set(
            normalizedKey,
            {
                deviceId:
                    device.deviceId,

                label:
                    friendlyLabel,

                aliases: [
                    label,
                ],
            }
        );
    }

    return Array.from(
        groups.values()
    );
}


function getPhysicalDeviceKey(
    device: RawAudioDevice,
    kind: "input" | "output"
): string {
    const cleaned =
        cleanDeviceLabel(
            device.label
        );

    /*
     * If groupId exists, it is the strongest browser-level signal that
     * two endpoints belong to the same physical device.
     */
    if (device.groupId) {
        return `group:${device.groupId}`;
    }

    const base =
        cleaned ||
        (kind === "input"
            ? "computer-microphone"
            : "system-output");

    return `label:${base.toLowerCase()}`;
}


function shouldPreferDeviceId(
    candidate: RawAudioDevice,
    currentDeviceId: string,
    _kind: "input" | "output"
): boolean {
    /*
     * We normally only retain physical devices, so this is a defensive
     * fallback for browsers that expose aliases alongside a real device.
     */
    if (
        currentDeviceId === "default" ||
        currentDeviceId === "communications"
    ) {
        return true;
    }

    return (
        candidate.deviceId !== "default" &&
        candidate.deviceId !== "communications"
    );
}


function cleanDeviceLabel(
    label: string
): string {
    return label
        .replace(
            /^default\s*[-:]\s*/i,
            ""
        )
        .replace(
            /^communications?\s*[-:]\s*/i,
            ""
        )
        .trim();
}


function friendlyDeviceLabel(
    rawLabel: string,
    kind: "input" | "output"
): string {
    const label =
        cleanDeviceLabel(
            rawLabel
        );

    if (
        kind === "input" &&
        /microphone array/i.test(label)
    ) {
        return "Computer microphone";
    }

    if (
        /cmf buds 2/i.test(label)
    ) {
        return "CMF Buds 2";
    }

    if (
        /airpods/i.test(label)
    ) {
        return label.replace(
            /^headset\s*\((.*)\)$/i,
            "$1"
        );
    }

    const headsetMatch =
        label.match(
            /^headset\s*\((.+)\)$/i
        );

    if (headsetMatch) {
        return headsetMatch[1].trim();
    }

    if (
        kind === "input" &&
        /headset microphone/i.test(label)
    ) {
        return "Wired headset";
    }

    if (
        /headphone|earphone|hands-free|handsfree/i.test(label)
    ) {
        return label
            .replace(
                /hands[- ]?free/gi,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }

    if (
        kind === "input" &&
        /usb/i.test(label) &&
        /microphone/i.test(label)
    ) {
        return "USB microphone";
    }

    if (
        kind === "output" &&
        /speakers?/i.test(label)
    ) {
        return "Computer speakers";
    }

    if (
        kind === "input" &&
        /microphone/i.test(label)
    ) {
        return label;
    }

    return label ||
        (kind === "input"
            ? "Microphone"
            : "Speaker");
}


function choosePreferredMicrophone(
    microphones: AudioDeviceOption[]
): AudioDeviceOption | undefined {
    return (
        microphones.find(
            device =>
                isBluetoothStyleLabel(
                    device.label
                )
        ) ??
        microphones.find(
            device =>
                isWiredHeadsetLabel(
                    device.label
                )
        ) ??
        microphones.find(
            device =>
                device.label ===
                "Computer microphone"
        ) ??
        microphones[0]
    );
}


function choosePreferredSpeaker(
    speakers: AudioDeviceOption[]
): AudioDeviceOption | undefined {
    return (
        speakers.find(
            device =>
                isBluetoothStyleLabel(
                    device.label
                )
        ) ??
        speakers.find(
            device =>
                isWiredHeadsetLabel(
                    device.label
                )
        ) ??
        speakers.find(
            device =>
                device.label ===
                "Computer speakers"
        ) ??
        speakers[0]
    );
}


function hasBluetoothStyleDevice(
    microphones: AudioDeviceOption[],
    speakers: AudioDeviceOption[]
): boolean {
    return (
        microphones.some(
            device =>
                isBluetoothStyleLabel(
                    device.label
                )
        ) ||
        speakers.some(
            device =>
                isBluetoothStyleLabel(
                    device.label
                )
        )
    );
}


function hasWiredHeadset(
    microphones: AudioDeviceOption[],
    speakers: AudioDeviceOption[]
): boolean {
    return (
        microphones.some(
            device =>
                isWiredHeadsetLabel(
                    device.label
                )
        ) ||
        speakers.some(
            device =>
                isWiredHeadsetLabel(
                    device.label
                )
        )
    );
}


function isBluetoothStyleLabel(
    label: string
): boolean {
    const value =
        label.toLowerCase();

    return (
        value.includes("cmf buds") ||
        value.includes("airpods") ||
        value.includes("galaxy buds") ||
        value.includes("pixel buds") ||
        value.includes("beats") ||
        value.includes("bose") ||
        value.includes("jabra") ||
        value.includes("sony") ||
        value.includes("wireless") ||
        value.includes("bluetooth") ||
        value.includes("earbuds")
    );
}


function isWiredHeadsetLabel(
    label: string
): boolean {
    const value =
        label.toLowerCase();

    if (
        isBluetoothStyleLabel(
            label
        )
    ) {
        return false;
    }

    return (
        value.includes("wired") ||
        value.includes("headset") ||
        value.includes("earphone") ||
        value.includes("headphone")
    );
}


function isVirtualAudioDevice(
    label: string
): boolean {
    const value =
        label.toLowerCase();

    return (
        value.includes("monitor") ||
        value.includes("loopback") ||
        value.includes("stereo mix") ||
        value.includes("what u hear") ||
        value.includes("virtual cable") ||
        value.includes("voicemeeter")
    );
}


function formatAudioError(
    error: unknown
): string {
    if (error instanceof DOMException) {
        switch (error.name) {
            case "NotAllowedError":
                return "Microphone permission was denied. Allow microphone access for this site and try again.";

            case "NotFoundError":
                return "No microphone was found. Connect a microphone or headset and try again.";

            case "NotReadableError":
                return "The selected microphone is currently unavailable or being used by another application.";

            case "OverconstrainedError":
                return "The selected microphone is no longer available. Refresh the device list and try again.";

            case "AbortError":
                return "Microphone access was interrupted. Try the microphone test again.";

            default:
                return (
                    error.message ||
                    "Unable to access the selected microphone."
                );
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to access the selected microphone.";
}


/*
|--------------------------------------------------------------------------
| Voice Interview UI
|--------------------------------------------------------------------------
*/

interface VoiceInterviewUIProps {

    question:
    string;

    turnId:
    string;

    status:
    | "IDLE"
    | "SPEAKING"
    | "LISTENING"
    | "PROCESSING"
    | "ERROR";

    transcript:
    string;

    interimTranscript:
    string;

    isSupported:
    boolean;

    error:
    string | null;

    voiceStarted:
    boolean;

    isSubmitting:
    boolean;

    onBegin:
    () => void;

    onListen:
    () => void;

    onStopListening:
    () => void;

    onStopSpeaking:
    () => void;

    onChangeAudio:
    () => void;

    onEnd:
    () => Promise<void>;
}


function VoiceInterviewUI({
    question,

    turnId,

    status,

    transcript,

    interimTranscript,

    isSupported,

    error,

    voiceStarted,

    isSubmitting,

    onBegin,

    onListen,

    onStopListening,

    onStopSpeaking,

    onChangeAudio,

    onEnd,

}: VoiceInterviewUIProps) {


    /*
     * ------------------------------------------------------------
     * Browser support
     * ------------------------------------------------------------
     */

    if (!isSupported) {

        return (

            <PageChrome>

                <div className="flex min-h-screen items-center justify-center p-6">

                    <Card className="w-full max-w-lg border-[#26272C] bg-[#16171A] rounded-lg overflow-hidden">

                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C0665A]/70 to-transparent" />

                        <CardContent className="space-y-5 p-8 text-center font-body">

                            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#C0665A]/30 bg-[#C0665A]/10 text-[#C0665A]">

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                    />

                                </svg>

                            </div>


                            <h1 className="font-display text-xl font-medium text-[#F5F3EE]">
                                Voice mode is unavailable
                            </h1>


                            <p className="text-sm leading-6 text-[#8B8A85]">
                                Your browser does not currently support
                                the microphone recording technology required
                                for this voice interview.
                            </p>


                            <Button
                                onClick={
                                    onEnd
                                }
                                className="rounded-md bg-[#C9A24B] hover:bg-[#DAB768] text-[#111214] font-semibold"
                            >
                                Back to Dashboard
                            </Button>

                        </CardContent>

                    </Card>

                </div>

            </PageChrome>
        );
    }


    /*
     * ------------------------------------------------------------
     * Initial voice activation
     * ------------------------------------------------------------
     */

    if (!voiceStarted) {

        return (

            <PageChrome>

                <div className="min-h-screen p-4 sm:p-6">

                    <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl items-center justify-center">

                        <Card className="w-full max-w-2xl border-[#26272C] bg-[#16171A] rounded-lg overflow-hidden">

                            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A24B]/70 to-transparent" />

                            <CardContent className="flex flex-col items-center gap-8 p-10 text-center font-body">

                                <div className="breathe-ring flex size-28 items-center justify-center rounded-full bg-[#C9A24B]/10 ring-8 ring-[#C9A24B]/[0.06]">

                                    <svg
                                        className="h-12 w-12 text-[#C9A24B]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                        />

                                    </svg>

                                </div>


                                <div className="space-y-3">

                                    <p className="font-data text-[10.5px] font-medium tracking-[0.2em] text-[#C9A24B] uppercase">
                                        Voice Interview
                                    </p>


                                    <h1 className="font-display text-2xl font-medium text-[#F5F3EE]">
                                        Your interviewer is ready
                                    </h1>


                                    <p className="text-sm leading-6 text-[#8B8A85]">
                                        Click below to begin the voice
                                        interview and allow microphone access.
                                    </p>

                                </div>


                                <Button
                                    size="lg"
                                    onClick={
                                        onBegin
                                    }
                                    className="min-w-48 rounded-md bg-[#C9A24B] font-semibold text-[#111214] hover:bg-[#DAB768]"
                                >
                                    Begin Voice Interview
                                </Button>


                                <Button
                                    variant="outline"
                                    onClick={
                                        onEnd
                                    }
                                    className="rounded-md border-[#26272C] bg-transparent text-[#B8B6B0] hover:bg-[#1A1B20] hover:text-[#F5F3EE]"
                                >
                                    Exit
                                </Button>

                            </CardContent>

                        </Card>

                    </div>

                </div>

            </PageChrome>
        );
    }


    /*
     * ------------------------------------------------------------
     * Active voice interview
     * ------------------------------------------------------------
     */

    const statusLabel =

        status === "SPEAKING"

            ? "Interviewer speaking"

            : status === "LISTENING"

                ? "Listening"

                : status === "PROCESSING"

                    ? "Analyzing your answer"

                    : status === "IDLE"

                        ? "Your turn"

                        : "Voice error";


    return (

        <PageChrome>

            <div className="min-h-screen p-4 sm:p-6">

                <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl items-center">

                    <Card className="w-full overflow-hidden border-[#26272C] bg-[#16171A] rounded-lg">

                        <CardContent className="p-0">

                            <div className="flex min-h-[520px] flex-col font-body">

                                <header className="flex items-center justify-between border-b border-[#26272C] px-5 py-4 sm:px-7">

                                    <div>

                                        <BrandMark />

                                        <p className="mt-0.5 pl-8 font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase">
                                            Voice Assessment
                                        </p>

                                    </div>


                                    <div className="flex items-center gap-2 rounded-full border border-[#3F5B44] bg-[#3F5B44]/10 px-3 py-1.5 font-data text-[10px] tracking-wide text-[#5E8869] uppercase">

                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E8869]" />

                                        Live

                                    </div>

                                </header>


                                <main className="flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-10">

                                    <VoiceIndicator
                                        status={
                                            status
                                        }
                                    />


                                    <p
                                        className={`mt-4 font-data text-[10px] tracking-[0.2em] uppercase ${status === "ERROR"

                                                ? "text-[#C0665A]"

                                                : status === "LISTENING"

                                                    ? "text-[#5E8869]"

                                                    : "text-[#C9A24B]"
                                            }`}
                                    >
                                        {statusLabel}
                                    </p>


                                    <div className="mt-5 w-full max-w-3xl text-center">

                                        <p className="mb-3 font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase">
                                            AI Interviewer
                                        </p>


                                        <h1 className="text-xl font-semibold leading-relaxed text-[#F5F3EE] sm:text-2xl">

                                            {question}

                                        </h1>

                                    </div>


                                    <div className="mt-5 w-full max-w-2xl rounded-xl border border-[#26272C] bg-[#111214] p-4">

                                        <div className="mb-2 flex items-center justify-between">

                                            <p className="font-data text-[9px] tracking-[0.15em] text-[#5C5B57] uppercase">
                                                Your answer
                                            </p>


                                            {status === "LISTENING" && (

                                                <span className="flex items-center gap-1">

                                                    {[0, 1, 2].map(
                                                        (i) => (

                                                            <span
                                                                key={i}
                                                                className="eq-bar w-0.5 rounded-full bg-[#5E8869]"
                                                                style={{
                                                                    height:
                                                                        "10px",

                                                                    animationDelay:
                                                                        `${i * 120}ms`,
                                                                }}
                                                            />

                                                        )
                                                    )}

                                                </span>
                                            )}

                                        </div>


                                        <p className="min-h-12 text-sm leading-6 text-[#B8B6B0]">

                                            {interimTranscript ||
                                                transcript ||
                                                "Start speaking when you're ready..."}

                                        </p>

                                    </div>


                                    {error && (

                                        <div className="mt-3 w-full max-w-2xl rounded-lg border border-[#C0665A]/30 bg-[#C0665A]/[0.08] p-4 text-sm text-[#D89A8D]">

                                            {error}

                                        </div>

                                    )}


                                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

                                        {status === "LISTENING" ? (

                                            <Button
                                                size="lg"
                                                onClick={
                                                    onStopListening
                                                }
                                                className="min-w-44 rounded-md bg-[#C0665A] text-white hover:bg-[#B75B50]"
                                            >
                                                Stop Listening
                                            </Button>

                                        ) : status === "SPEAKING" ? (

                                            <Button
                                                size="lg"
                                                variant="outline"
                                                onClick={
                                                    onStopSpeaking
                                                }
                                                className="min-w-44 rounded-md border-[#26272C] bg-transparent text-[#B8B6B0] hover:bg-[#1A1B20] hover:text-[#F5F3EE]"
                                            >
                                                Skip Voice
                                            </Button>

                                        ) : status === "PROCESSING" ? (

                                            <Button
                                                size="lg"
                                                disabled
                                                className="min-w-44 rounded-md bg-[#C9A24B]/40 text-[#111214]"
                                            >
                                                Thinking...
                                            </Button>

                                        ) : (

                                            <Button
                                                size="lg"
                                                onClick={
                                                    onListen
                                                }

                                                disabled={
                                                    isSubmitting ||
                                                    !turnId
                                                }

                                                className="min-w-44 gap-2 rounded-md bg-[#C9A24B] text-[#111214] hover:bg-[#DAB768] font-semibold"
                                            >

                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                                    />

                                                </svg>

                                                Answer

                                            </Button>
                                        )}


                                        <Button
                                            variant="outline"
                                            onClick={
                                                onChangeAudio
                                            }
                                            disabled={
                                                isSubmitting ||
                                                status === "LISTENING" ||
                                                status === "PROCESSING"
                                            }
                                            className="rounded-md border-[#3A3B41] bg-transparent text-[#B8B6B0] hover:bg-[#1A1B20] hover:text-[#F5F3EE]"
                                        >
                                            Change Audio
                                        </Button>


                                        <Button
                                            variant="destructive"
                                            onClick={
                                                onEnd
                                            }
                                            disabled={
                                                isSubmitting
                                            }
                                            className="rounded-md bg-[#C0665A] hover:bg-[#B75B50]"
                                        >
                                            End Interview
                                        </Button>

                                    </div>

                                </main>


                                <footer className="border-t border-[#26272C] px-5 py-4">

                                    <p className="text-center font-body text-xs text-[#5C5B57]">
                                        Speak naturally. The interviewer will
                                        adapt to your answer.
                                    </p>

                                </footer>

                            </div>

                        </CardContent>

                    </Card>

                </div>

            </div>

        </PageChrome>
    );
}