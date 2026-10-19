import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInterview } from "../hooks/useInterview";
import { useVoiceInterview } from "../hooks/useVoiceInterview";
import type { InterviewAudioConfig } from "../hooks/useVoiceInterview";
import type { InterviewMode, InterviewQuestion } from "../api/interview.api";

interface InterviewLocationState {
  question?: InterviewQuestion;
  turnId?: string;
  mode?: InterviewMode;
}

/* ---------- shared look ---------- */

const cardClass =
  "relative w-full border border-white/10 bg-[#14151B]/90 text-[#EDEAE4] backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/60 overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#E5B858]/70 before:to-transparent";

const primaryBtn =
  "rounded-full bg-gradient-to-r from-[#E5B858] via-[#F3C86A] to-[#CCA043] bg-[length:200%_100%] hover:bg-[position:100%_0] text-[#0F1014] font-semibold shadow-lg shadow-[#E5B858]/30 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#E5B858]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0E12]";

const softBtn =
  "rounded-full border border-[#2A2B35] bg-transparent text-[#A2A4AD] hover:bg-white/5 hover:text-white transition-all";

function PageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0D0E12] text-[#EDEAE4] antialiased font-body selection:bg-[#E5B858]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500&display=swap');

        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -30px) scale(1.12); }
        }
        .blob-a { animation: floatA 14s ease-in-out infinite; }
        .blob-b { animation: floatB 17s ease-in-out infinite; }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .orb-breathe { animation: breathe 3.2s ease-in-out infinite; }

        @keyframes waveBars {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
        .wave-bar {
          animation: waveBars 0.85s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes rippleRing {
          0% { transform: scale(0.9); opacity: 0.55; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .ripple-effect { animation: rippleRing 2.4s ease-out infinite; }

        @keyframes popIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pop-in { animation: popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .blob-a, .blob-b, .orb-breathe, .wave-bar, .ripple-effect, .pop-in { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob-a absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-[#C9A24B]/20 blur-[90px]" />
        <div className="blob-b absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-[#3B664B]/30 blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[#C9A24B]/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F3C86A] via-[#E5B858] to-[#CCA043] shadow-md shadow-[#E5B858]/30 ring-1 ring-white/20 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="#0F1014" strokeWidth={2} strokeLinecap="round">
        <path d="M4.5 10.5v3M8.25 8v8M12 11v8.5M15.75 8v8M19.5 10.5v3" />
        <circle cx="12" cy="6.2" r="1.35" fill="#0F1014" stroke="none" />
      </svg>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight text-[#F7F5F0]">
        Intervia
      </span>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-6">
      {children}
    </div>
  );
}

function StatusIcon({
  tone,
  children,
}: {
  tone: "error" | "success" | "brand";
  children: React.ReactNode;
}) {
  const tones = {
    error: "bg-[#D85D52]/10 text-[#D85D52]",
    success: "bg-[#54BD78]/10 text-[#54BD78]",
    brand: "bg-[#E5B858]/10 text-[#E5B858]",
  };

  return (
    <div
      className={`mx-auto flex size-16 items-center justify-center rounded-3xl ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

const MicIcon = ({ className = "size-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const WarnIcon = () => (
  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

function VoiceIndicator({
  status,
}: {
  status: "IDLE" | "SPEAKING" | "LISTENING" | "PROCESSING" | "ERROR";
}) {
  const isSpeaking = status === "SPEAKING";
  const isListening = status === "LISTENING";
  const isProcessing = status === "PROCESSING";
  const isError = status === "ERROR";

  const glowColor = isListening
    ? "from-[#4E9B66] to-[#2E5E3E]"
    : isError
    ? "from-[#D85D52] to-[#7B2E27]"
    : "from-[#E5B858] to-[#99772B]";

  const barColor = isListening ? "bg-[#54BD78]" : "bg-[#F3C86A]";
  const ringColor = isListening ? "text-[#54BD78]" : "text-[#E5B858]";

  return (
    <div className="relative flex items-center justify-center">
      {(isSpeaking || isListening) && (
        <>
          <div
            className={`ripple-effect absolute size-24 sm:size-28 rounded-full border-2 border-current ${ringColor}`}
          />
          <div
            className={`ripple-effect absolute size-24 sm:size-28 rounded-full border-2 border-current [animation-delay:1.1s] ${ringColor}`}
          />
        </>
      )}

      <div
        className={`orb-breathe relative flex size-24 sm:size-28 items-center justify-center rounded-full border border-white/10 bg-[#15161C] shadow-2xl transition-all duration-700 ${
          isListening
            ? "shadow-[#54BD78]/40 ring-4 ring-[#54BD78]/25"
            : isSpeaking
            ? "shadow-[#E5B858]/40 ring-4 ring-[#E5B858]/25"
            : isError
            ? "shadow-[#D85D52]/30 ring-4 ring-[#D85D52]/20"
            : isProcessing
            ? "ring-2 ring-white/10"
            : "shadow-[#E5B858]/20 ring-2 ring-[#E5B858]/20"
        }`}
      >
        <div
          className={`absolute inset-1 rounded-full bg-gradient-to-tr ${glowColor} opacity-30 blur-md`}
        />

        {(isSpeaking || isListening) && (
          <div className="relative z-10 flex h-12 items-center justify-center gap-1.5">
            {[45, 80, 100, 65, 90, 50, 75].map((height, i) => (
              <span
                key={i}
                className={`wave-bar w-1.5 rounded-full ${barColor}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>
        )}

        {isProcessing && (
          <div className="relative z-10 size-10 animate-spin rounded-full border-2 border-white/10 border-t-[#E5B858]" />
        )}

        {isError && <span className="relative z-10 text-[#D85D52]"><WarnIcon /></span>}

        {status === "IDLE" && (
          <MicIcon className="relative z-10 size-10 text-[#E5B858]" />
        )}
      </div>
    </div>
  );
}

const normalizeInterviewQuestion = (value: unknown): InterviewQuestion => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid interview question.");
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.question === "string") {
    return {
      question: candidate.question,
      claimId:
        typeof candidate.claimId === "string" ? candidate.claimId : undefined,
      reasoning:
        typeof candidate.reasoning === "string"
          ? candidate.reasoning
          : undefined,
      expectedTopics: Array.isArray(candidate.expectedTopics)
        ? candidate.expectedTopics.filter(
            (topic): topic is string => typeof topic === "string"
          )
        : undefined,
    };
  }

  if (candidate.question && typeof candidate.question === "object") {
    return normalizeInterviewQuestion(candidate.question);
  }

  throw new Error("Interview question text is missing.");
};

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as InterviewLocationState | null;

  const mode: InterviewMode =
    locationState?.mode === "VIDEO" ? "VIDEO" : "VOICE";
  const initialQuestion = locationState?.question;
  const initialTurnId = locationState?.turnId;

  const [answer, setAnswer] = useState("");

  if (!sessionId || !initialQuestion || !initialTurnId) {
    return (
      <PageChrome>
        <Centered>
          <Card className={`${cardClass} max-w-md pop-in`}>
            <CardContent className="space-y-5 p-8 text-center">
              <StatusIcon tone="error">
                <WarnIcon />
              </StatusIcon>

              <div>
                <h1 className="font-display text-2xl font-semibold">
                  We lost this session
                </h1>
                <p className="mt-2 text-sm text-[#8B8D97] leading-relaxed">
                  This interview could not be restored. Head back to the
                  dashboard to start a fresh one.
                </p>
              </div>

              <Button
                className={`w-full h-11 ${primaryBtn}`}
                onClick={() => navigate("/dashboard", { replace: true })}
              >
                Back to dashboard
              </Button>
            </CardContent>
          </Card>
        </Centered>
      </PageChrome>
    );
  }

  return (
    <InterviewSession
      sessionId={sessionId}
      initialQuestion={initialQuestion}
      initialTurnId={initialTurnId}
      mode={mode}
      answer={answer}
      setAnswer={setAnswer}
    />
  );
}

interface InterviewSessionProps {
  sessionId: string;
  initialQuestion: InterviewQuestion;
  initialTurnId: string;
  mode: InterviewMode;
  answer: string;
  setAnswer: (value: string) => void;
}

function InterviewSession({
  sessionId,
  initialQuestion,
  initialTurnId,
  mode,
  answer,
  setAnswer,
}: InterviewSessionProps) {
  const navigate = useNavigate();

  const {
    question,
    turnId,
    isSubmitting,
    isCompleted,
    error: interviewError,
    submitTurn,
    endInterview,
  } = useInterview({
    sessionId,
    initialQuestion,
    initialTurnId,
  });

  const [audioConfig, setAudioConfig] = useState<InterviewAudioConfig | null>(
    null
  );

  const currentQuestion = normalizeInterviewQuestion(
    question ?? initialQuestion
  );

  const [voiceStarted, setVoiceStarted] = useState(false);
  // Transcript value at the moment the current answer started. Anything equal
  // to this is a leftover from the previous answer and must not be shown.
  const [baselineTranscript, setBaselineTranscript] = useState("");

  const handleVoiceTranscript = useCallback(
    async (transcript: string) => {
      await submitTurn(transcript, "VOICE");
    },
    [submitTurn]
  );

  const {
    status: voiceStatus,
    transcript,
    interimTranscript,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceInterview({
    language: "en-US",
    audioConfig: audioConfig,
    onTranscript: handleVoiceTranscript,
  });

  const handleListen = useCallback(() => {
    setBaselineTranscript(transcript);
    startListening();
  }, [transcript, startListening]);

  useEffect(() => {
    if (mode !== "VOICE" || !voiceStarted) {
      return;
    }

    speak(currentQuestion.question);
  }, [mode, voiceStarted, currentQuestion.question, speak]);

  const handleTextSubmit = async () => {
    const trimmed = answer.trim();

    if (!trimmed || isSubmitting) {
      return;
    }

    try {
      await submitTurn(trimmed, "TEXT");
      setAnswer("");
    } catch {}
  };

  const handleBeginVoice = () => {
    setVoiceStarted(true);
  };

  const handleEndInterview = async () => {
    stopSpeaking();
    stopListening();

    try {
      await endInterview();
    } finally {
      navigate("/dashboard", { replace: true });
    }
  };

  if (isCompleted) {
    return (
      <PageChrome>
        <Centered>
          <Card className={`${cardClass} max-w-md pop-in`}>
            <CardContent className="space-y-5 p-8 text-center">
              <StatusIcon tone="success">
                <CheckIcon />
              </StatusIcon>

              <div>
                <h1 className="font-display text-2xl font-semibold">
                  Great job, you're done!
                </h1>
                <p className="mt-2 text-sm text-[#8B8D97] leading-relaxed">
                  Your answers have been reviewed. Your scores and feedback are
                  waiting on your dashboard.
                </p>
              </div>

              <Button
                className={`w-full h-11 ${primaryBtn}`}
                onClick={() => navigate("/dashboard", { replace: true })}
              >
                See my results
              </Button>
            </CardContent>
          </Card>
        </Centered>
      </PageChrome>
    );
  }

  if (mode === "VOICE" && !audioConfig) {
    return (
      <AudioSetup
        onComplete={setAudioConfig}
        onCancel={handleEndInterview}
      />
    );
  }

  if (mode === "VOICE") {
    return (
      <VoiceInterviewUI
        question={currentQuestion.question}
        turnId={turnId}
        status={voiceStatus}
        transcript={transcript}
        interimTranscript={interimTranscript}
        baselineTranscript={baselineTranscript}
        isSupported={isSupported}
        error={voiceError ?? interviewError}
        voiceStarted={voiceStarted}
        isSubmitting={isSubmitting}
        onBegin={handleBeginVoice}
        onListen={handleListen}
        onStopListening={stopListening}
        onStopSpeaking={stopSpeaking}
        onEnd={handleEndInterview}
      />
    );
  }

  return (
    <PageChrome>
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5 sm:px-8">
          <BrandMark />
          <div className="flex items-center gap-2 rounded-full border border-[#E5B858]/30 bg-[#E5B858]/10 px-3 py-1 text-xs font-medium text-[#FFD375]">
            <span className="size-2 rounded-full bg-[#E5B858]" />
            Typing mode
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6">
          <div
            key={currentQuestion.question}
            className="pop-in m-auto w-full max-w-2xl py-4 text-center"
          >
            <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-wide text-[#E5B858]"><span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E5B858]/60" />Your question<span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E5B858]/60" /></p>
            <h1 className="mt-3 font-display text-lg font-medium leading-relaxed text-[#F7F5F0] sm:text-2xl">
              {currentQuestion.question}
            </h1>
          </div>
        </main>

        <footer className="shrink-0 px-5 pb-5 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            {interviewError && (
              <div className="mb-3 rounded-xl border border-[#D85D52]/30 bg-[#D85D52]/10 p-3 text-xs text-[#E8928A]">
                {interviewError}
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-[#14151B]/90 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all focus-within:border-[#E5B858]/60 focus-within:ring-4 focus-within:ring-[#E5B858]/10">
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Take your time and type your answer..."
                disabled={isSubmitting}
                className="h-24 w-full resize-none rounded-2xl bg-transparent p-3 text-sm leading-relaxed text-[#EDEAE4] outline-none placeholder:text-[#5B5D68] sm:h-32 sm:text-base"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleTextSubmit();
                  }
                }}
              />

              <div className="flex items-center justify-between gap-3 px-1 pt-1">
                <Button
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={handleEndInterview}
                  className="h-10 rounded-full px-4 text-sm text-[#8B8D97] hover:bg-white/5 hover:text-white"
                >
                  Exit
                </Button>

                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-[#5B5D68] sm:block">
                    Enter to send · Shift+Enter for a new line
                  </span>
                  <Button
                    disabled={!answer.trim() || isSubmitting}
                    onClick={handleTextSubmit}
                    className={`h-11 px-7 ${primaryBtn}`}
                  >
                    {isSubmitting ? "Sending..." : "Send answer"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageChrome>
  );
}

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

type AudioSetupChoice = "BLUETOOTH" | "WIRED" | "COMPUTER";

function AudioSetup({
  onComplete,
  onCancel,
}: {
  onComplete: (config: InterviewAudioConfig) => void;
  onCancel: () => Promise<void>;
}) {
  const [microphones, setMicrophones] = useState<AudioDeviceOption[]>([]);
  const [speakers, setSpeakers] = useState<AudioDeviceOption[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [selectedSetup, setSelectedSetup] = useState<AudioSetupChoice>("COMPUTER");
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    setMicrophoneReady(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support microphone access.");
      }

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      for (const track of permissionStream.getTracks()) {
        track.stop();
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      const rawInputs: RawAudioDevice[] = devices
        .filter((device) => device.kind === "audioinput")
        .filter((device) => !isVirtualAudioDevice(device.label))
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || "Microphone",
          groupId: device.groupId,
        }));

      const rawOutputs: RawAudioDevice[] = devices
        .filter((device) => device.kind === "audiooutput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || "Speaker",
          groupId: device.groupId,
        }));

      const normalizedInputs = normalizeAudioDevices(rawInputs, "input");
      const normalizedOutputs = normalizeAudioDevices(rawOutputs, "output");

      setMicrophones(normalizedInputs);
      setSpeakers(normalizedOutputs);

      if (normalizedInputs.length === 0) {
        throw new Error(
          "No microphone is currently available. Connect a microphone or headset and refresh."
        );
      }

      const preferredInput = choosePreferredMicrophone(normalizedInputs);
      const preferredOutput = choosePreferredSpeaker(normalizedOutputs);

      setSelectedMicrophone(preferredInput?.deviceId ?? "");
      setSelectedSpeaker(preferredOutput?.deviceId ?? "");

      const bluetoothAvailable = hasBluetoothStyleDevice(
        normalizedInputs,
        normalizedOutputs
      );

      const wiredAvailable = hasWiredHeadset(
        normalizedInputs,
        normalizedOutputs
      );

      if (bluetoothAvailable) {
        setSelectedSetup("BLUETOOTH");
      } else if (wiredAvailable) {
        setSelectedSetup("WIRED");
      } else {
        setSelectedSetup("COMPUTER");
      }
    } catch (loadError) {
      console.error("[AudioSetup] Device discovery failed:", loadError);
      setError(formatAudioError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const bluetoothAvailable = hasBluetoothStyleDevice(microphones, speakers);
  const wiredAvailable = hasWiredHeadset(microphones, speakers);
  const computerMicrophoneAvailable = microphones.some(
    (device) => device.label === "Computer microphone"
  );
  const computerSpeakerAvailable =
    speakers.some((device) => device.label === "Computer speakers") ||
    speakers.length === 0;

  const computerAudioAvailable =
    computerMicrophoneAvailable && computerSpeakerAvailable;

  const applySetupChoice = (choice: AudioSetupChoice) => {
    setSelectedSetup(choice);
    setError(null);
    setMicrophoneReady(false);

    if (choice === "BLUETOOTH") {
      const bluetoothMic = microphones.find((device) =>
        isBluetoothStyleLabel(device.label)
      );
      const bluetoothSpeaker = speakers.find((device) =>
        isBluetoothStyleLabel(device.label)
      );

      if (bluetoothMic) {
        setSelectedMicrophone(bluetoothMic.deviceId);
      }

      if (bluetoothSpeaker) {
        setSelectedSpeaker(bluetoothSpeaker.deviceId);
      }

      if (!bluetoothMic) {
        setNotice(
          bluetoothSpeaker
            ? "Your earbuds are available for interviewer audio, but their microphone is not currently available. The computer microphone will be used for your answers."
            : "Your Bluetooth earbuds are not currently available. Refresh the device list and try again."
        );

        const computerMic = microphones.find(
          (device) => device.label === "Computer microphone"
        );

        if (computerMic) {
          setSelectedMicrophone(computerMic.deviceId);
        }
      }

      return;
    }

    if (choice === "WIRED") {
      const wiredMic = microphones.find((device) =>
        isWiredHeadsetLabel(device.label)
      );
      const wiredSpeaker = speakers.find((device) =>
        isWiredHeadsetLabel(device.label)
      );

      if (wiredMic) {
        setSelectedMicrophone(wiredMic.deviceId);
      }

      if (wiredSpeaker) {
        setSelectedSpeaker(wiredSpeaker.deviceId);
      }

      if (!wiredMic) {
        const computerMic = microphones.find(
          (device) => device.label === "Computer microphone"
        );

        if (computerMic) {
          setSelectedMicrophone(computerMic.deviceId);
        }

        setNotice(
          "The wired headset microphone is not available, so the computer microphone will be used for your answers."
        );
      }

      return;
    }

    const computerMic = microphones.find(
      (device) => device.label === "Computer microphone"
    );
    const computerSpeaker = speakers.find(
      (device) => device.label === "Computer speakers"
    );

    if (computerMic) {
      setSelectedMicrophone(computerMic.deviceId);
    }

    if (computerSpeaker) {
      setSelectedSpeaker(computerSpeaker.deviceId);
    }

    setNotice(
      "Your computer microphone and speakers will be used for the interview."
    );
  };

  const testMicrophone = async () => {
    if (!selectedMicrophone) {
      setError("Select an available microphone first.");
      return;
    }

    setIsLoading(true);
    setMicrophoneReady(false);
    setError(null);

    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    try {
      const constraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      };

      if (selectedMicrophone !== "default") {
        constraints.deviceId = {
          exact: selectedMicrophone,
        };
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints,
        video: false,
      });

      const track = stream.getAudioTracks()[0];

      if (!track || track.readyState !== "live") {
        throw new Error("The selected microphone could not be activated.");
      }

      const AudioContextClass =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Your browser does not support microphone testing.");
      }

      audioContext = new AudioContextClass();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.15;

      source.connect(analyser);

      const samples = new Float32Array(analyser.fftSize);

      let peak = 0;
      let rms = 0;

      setNotice("Speak now. We are listening for your voice...");

      const deadline = Date.now() + 3500;

      while (Date.now() < deadline) {
        analyser.getFloatTimeDomainData(samples);

        let sumSquares = 0;

        for (let index = 0; index < samples.length; index++) {
          const value = samples[index];
          const absolute = Math.abs(value);

          peak = Math.max(peak, absolute);
          sumSquares += value * value;
        }

        rms = Math.max(rms, Math.sqrt(sumSquares / samples.length));

        if (peak >= 0.001 || rms >= 0.0003) {
          break;
        }

        await new Promise<void>((resolve) => setTimeout(resolve, 50));
      }

      if (peak < 0.001 && rms < 0.0003) {
        const settings = track.getSettings();

        if (track.muted) {
          throw new Error(
            "The microphone is being reported as muted by the browser or operating system. Check your microphone mute switch or Windows microphone settings and try again."
          );
        }

        throw new Error(
          `No microphone signal was detected. Peak: ${peak.toFixed(
            6
          )}, RMS: ${rms.toFixed(6)}, device: ${
            settings.deviceId ?? "unknown"
          }.`
        );
      }

      setMicrophoneReady(true);
      setNotice(
        `Microphone detected successfully: ${friendlyDeviceLabel(track.label, "input")}.`
      );
    } catch (testError) {
      console.error("[AudioSetup] Microphone test failed:", testError);
      setMicrophoneReady(false);
      setError(formatAudioError(testError));
    } finally {
      if (audioContext) {
        try {
          await audioContext.close();
        } catch {}
      }

      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }

      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedMicrophone) {
      setError("A microphone is required to take a voice interview.");
      return;
    }

    if (!microphoneReady) {
      setError("Please test your microphone before continuing.");
      return;
    }

    const selectedInput = microphones.find(
      (device) => device.deviceId === selectedMicrophone
    );

    const selectedOutput = speakers.find(
      (device) => device.deviceId === selectedSpeaker
    );

    onComplete({
      inputDeviceId: selectedMicrophone,
      inputDeviceLabel: selectedInput?.label ?? "Selected microphone",
      outputDeviceId: selectedOutput?.deviceId ?? null,
      outputDeviceLabel: selectedOutput?.label ?? "System default speaker",
    });
  };

  const profileCard = (
    choice: AudioSetupChoice,
    title: string,
    text: string,
    icon: React.ReactNode
  ) => {
    const active = selectedSetup === choice;

    return (
      <button
        type="button"
        onClick={() => applySetupChoice(choice)}
        className={`flex flex-1 items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
          active
            ? "border-[#E5B858] bg-[#E5B858]/10 shadow-md shadow-[#E5B858]/15 -translate-y-0.5"
            : "border-transparent bg-[#1A1C24] hover:border-white/20 hover:-translate-y-0.5"
        }`}
      >
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
            active ? "bg-[#E5B858] text-[#0F1014]" : "bg-[#E5B858]/10 text-[#E5B858]"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-[#8B8D97] leading-snug">{text}</p>
        </div>
      </button>
    );
  };

  return (
    <PageChrome>
      <Centered>
        <Card className={`${cardClass} max-w-3xl max-h-full flex flex-col pop-in`}>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <header className="flex items-center justify-between px-6 py-4">
              <BrandMark />
              <span className="rounded-full bg-[#E5B858]/10 px-3 py-1 text-xs font-medium text-[#E5B858]">
                Quick sound check
              </span>
            </header>

            <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6 sm:px-10">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold">
                  How will you join today?
                </h1>
                <p className="mt-1 text-sm text-[#8B8D97]">
                  Pick your setup, test your mic, and you're in.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                {bluetoothAvailable &&
                  profileCard(
                    "BLUETOOTH",
                    "Wireless earbuds",
                    "AirPods or any Bluetooth buds.",
                    <AudioSetupBluetoothIcon />
                  )}

                {wiredAvailable &&
                  profileCard(
                    "WIRED",
                    "Wired headset",
                    "3.5mm or USB-C earphones.",
                    <AudioSetupWiredIcon />
                  )}

                {computerAudioAvailable &&
                  profileCard(
                    "COMPUTER",
                    "Built-in audio",
                    "Laptop speakers and mic.",
                    <AudioSetupComputerIcon />
                  )}
              </div>

              <div className="rounded-2xl bg-[#0E0F14]/80 border border-white/5 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Microphone</label>
                  <button
                    type="button"
                    onClick={() => void loadDevices()}
                    disabled={isLoading}
                    className="text-xs font-semibold text-[#E5B858] hover:text-[#FFD375] disabled:opacity-40 transition-colors"
                  >
                    {isLoading ? "Refreshing..." : "Refresh list"}
                  </button>
                </div>

                <select
                  value={selectedMicrophone}
                  onChange={(event) => {
                    setSelectedMicrophone(event.target.value);
                    setMicrophoneReady(false);
                    setError(null);
                  }}
                  disabled={isLoading || microphones.length === 0}
                  className="mt-2.5 w-full cursor-pointer rounded-xl border border-[#2A2B35] bg-[#0F1015] px-4 py-2.5 text-sm text-[#F7F5F0] [color-scheme:dark] outline-none focus:border-[#E5B858] focus:ring-4 focus:ring-[#E5B858]/10 transition-all"
                >
                  {microphones.length === 0 ? (
                    <option value="">No microphone detected</option>
                  ) : (
                    microphones.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))
                  )}
                </select>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#8B8D97]">
                    Tap test and say a few words.
                  </p>

                  <Button
                    type="button"
                    onClick={testMicrophone}
                    disabled={isLoading || !selectedMicrophone}
                    className={`h-9 px-5 text-xs ${
                      microphoneReady
                        ? "rounded-full bg-[#54BD78] text-[#0F1014] hover:bg-[#6BCB8C]"
                        : "rounded-full bg-white/10 text-[#EDEAE4] border border-white/10 hover:bg-white/15"
                    }`}
                  >
                    {isLoading
                      ? "Listening..."
                      : microphoneReady
                      ? "Sounds great"
                      : "Test mic"}
                  </Button>
                </div>
              </div>

              {microphoneReady && (
                <div className="flex items-center gap-2 rounded-xl bg-[#54BD78]/10 px-3.5 py-2 text-xs font-medium text-[#73CE92]">
                  <span className="size-2 rounded-full bg-[#54BD78] animate-pulse" />
                  Your mic is working perfectly.
                </div>
              )}

              {notice && !microphoneReady && (
                <div className="rounded-xl bg-white/5 p-3 text-xs text-[#A2A4AD]">
                  {notice}
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-[#D85D52]/10 p-3 text-xs text-[#E8928A]">
                  {error}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void onCancel();
                  }}
                  disabled={isLoading}
                  className={`h-11 px-5 ${softBtn}`}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isLoading || !selectedMicrophone || !microphoneReady}
                  className={`h-11 px-7 ${primaryBtn}`}
                >
                  Enter interview room
                </Button>
              </div>
            </main>
          </CardContent>
        </Card>
      </Centered>
    </PageChrome>
  );
}

function AudioSetupBluetoothIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 14.25v-2.5a7.5 7.5 0 0115 0v2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 13.5H6a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 016 18.5H4.5a1.5 1.5 0 01-1.5-1.5v-2a1.5 1.5 0 011.5-1.5zm15 0H18a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-2a1.5 1.5 0 00-1.5-1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5h2.5a2 2 0 002-2v-.25" />
    </svg>
  );
}

function AudioSetupWiredIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13.5V12a7 7 0 0114 0v1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13.5H6.25A1.25 1.25 0 017.5 14.75V17A1.25 1.25 0 016.25 18.25H5A1.25 1.25 0 013.75 17v-2.25A1.25 1.25 0 015 13.5zm14 0h-1.25a1.25 1.25 0 00-1.25 1.25V17a1.25 1.25 0 001.25 1.25H19A1.25 1.25 0 0020.25 17v-2.25A1.25 1.25 0 0019 13.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 18.25h1.25a1.75 1.75 0 011.75 1.75v.25" />
    </svg>
  );
}

function AudioSetupComputerIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 6.75h14A1.5 1.5 0 0120.5 8.25v7.5A1.5 1.5 0 0119 17.25H5a1.5 1.5 0 01-1.5-1.5v-7.5A1.5 1.5 0 015 6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25h6M12 17.25v3" />
    </svg>
  );
}

function normalizeAudioDevices(
  devices: RawAudioDevice[],
  kind: "input" | "output"
): AudioDeviceOption[] {
  const physicalDevices = devices.filter(
    (device) =>
      device.deviceId !== "default" && device.deviceId !== "communications"
  );

  const sourceDevices =
    physicalDevices.length > 0
      ? physicalDevices
      : devices.filter((device) => device.deviceId === "default");

  const groups = new Map<string, AudioDeviceOption>();

  for (const device of sourceDevices) {
    const label = device.label.trim();
    const normalizedKey = getPhysicalDeviceKey(device, kind);
    const friendlyLabel = friendlyDeviceLabel(label, kind);
    const existing = groups.get(normalizedKey);

    if (existing) {
      if (!existing.aliases.includes(label)) {
        existing.aliases.push(label);
      }

      if (shouldPreferDeviceId(device, existing.deviceId, kind)) {
        existing.deviceId = device.deviceId;
      }

      continue;
    }

    groups.set(normalizedKey, {
      deviceId: device.deviceId,
      label: friendlyLabel,
      aliases: [label],
    });
  }

  return Array.from(groups.values());
}

function getPhysicalDeviceKey(
  device: RawAudioDevice,
  kind: "input" | "output"
): string {
  const cleaned = cleanDeviceLabel(device.label);

  if (device.groupId) {
    return `group:${device.groupId}`;
  }

  const base =
    cleaned || (kind === "input" ? "computer-microphone" : "system-output");

  return `label:${base.toLowerCase()}`;
}

function shouldPreferDeviceId(
  candidate: RawAudioDevice,
  currentDeviceId: string,
  _kind: "input" | "output"
): boolean {
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

function cleanDeviceLabel(label: string): string {
  return label
    .replace(/^default\s*[-:]\s*/i, "")
    .replace(/^communications?\s*[-:]\s*/i, "")
    .trim();
}

function friendlyDeviceLabel(
  rawLabel: string,
  kind: "input" | "output"
): string {
  const label = cleanDeviceLabel(rawLabel);

  if (kind === "input" && /microphone array/i.test(label)) {
    return "Computer microphone";
  }

  if (/cmf buds 2/i.test(label)) {
    return "CMF Buds 2";
  }

  if (/airpods/i.test(label)) {
    return label.replace(/^headset\s*\((.*)\)$/i, "$1");
  }

  const headsetMatch = label.match(/^headset\s*\((.+)\)$/i);

  if (headsetMatch) {
    return headsetMatch[1].trim();
  }

  if (kind === "input" && /headset microphone/i.test(label)) {
    return "Wired headset";
  }

  if (/headphone|earphone|hands-free|handsfree/i.test(label)) {
    return label
      .replace(/hands-?free/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (
    kind === "input" &&
    /usb/i.test(label) &&
    /microphone/i.test(label)
  ) {
    return "USB microphone";
  }

  if (kind === "output" && /speakers?/i.test(label)) {
    return "Computer speakers";
  }

  if (kind === "input" && /microphone/i.test(label)) {
    return label;
  }

  return label || (kind === "input" ? "Microphone" : "Speaker");
}

function choosePreferredMicrophone(
  microphones: AudioDeviceOption[]
): AudioDeviceOption | undefined {
  return (
    microphones.find((device) => isBluetoothStyleLabel(device.label)) ??
    microphones.find((device) => isWiredHeadsetLabel(device.label)) ??
    microphones.find((device) => device.label === "Computer microphone") ??
    microphones[0]
  );
}

function choosePreferredSpeaker(
  speakers: AudioDeviceOption[]
): AudioDeviceOption | undefined {
  return (
    speakers.find((device) => isBluetoothStyleLabel(device.label)) ??
    speakers.find((device) => isWiredHeadsetLabel(device.label)) ??
    speakers.find((device) => device.label === "Computer speakers") ??
    speakers[0]
  );
}

function hasBluetoothStyleDevice(
  microphones: AudioDeviceOption[],
  speakers: AudioDeviceOption[]
): boolean {
  return (
    microphones.some((device) => isBluetoothStyleLabel(device.label)) ||
    speakers.some((device) => isBluetoothStyleLabel(device.label))
  );
}

function hasWiredHeadset(
  microphones: AudioDeviceOption[],
  speakers: AudioDeviceOption[]
): boolean {
  return (
    microphones.some((device) => isWiredHeadsetLabel(device.label)) ||
    speakers.some((device) => isWiredHeadsetLabel(device.label))
  );
}

function isBluetoothStyleLabel(label: string): boolean {
  const value = label.toLowerCase();

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

function isWiredHeadsetLabel(label: string): boolean {
  const value = label.toLowerCase();

  if (isBluetoothStyleLabel(label)) {
    return false;
  }

  return (
    value.includes("wired") ||
    value.includes("headset") ||
    value.includes("earphone") ||
    value.includes("headphone")
  );
}

function isVirtualAudioDevice(label: string): boolean {
  const value = label.toLowerCase();

  return (
    value.includes("monitor") ||
    value.includes("loopback") ||
    value.includes("stereo mix") ||
    value.includes("what u hear") ||
    value.includes("virtual cable") ||
    value.includes("voicemeeter")
  );
}

function formatAudioError(error: unknown): string {
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
          error.message || "Unable to access the selected microphone."
        );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to access the selected microphone.";
}

interface VoiceInterviewUIProps {
  question: string;
  turnId: string;
  status: "IDLE" | "SPEAKING" | "LISTENING" | "PROCESSING" | "ERROR";
  transcript: string;
  interimTranscript: string;
  baselineTranscript: string;
  isSupported: boolean;
  error: string | null;
  voiceStarted: boolean;
  isSubmitting: boolean;
  onBegin: () => void;
  onListen: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onEnd: () => Promise<void>;
}

function VoiceInterviewUI({
  question,
  turnId,
  status,
  transcript,
  interimTranscript,
  baselineTranscript,
  isSupported,
  error,
  voiceStarted,
  isSubmitting,
  onBegin,
  onListen,
  onStopListening,
  onStopSpeaking,
  onEnd,
}: VoiceInterviewUIProps) {
  if (!isSupported) {
    return (
      <PageChrome>
        <Centered>
          <Card className={`${cardClass} max-w-md pop-in`}>
            <CardContent className="space-y-5 p-8 text-center">
              <StatusIcon tone="error">
                <MicIcon />
              </StatusIcon>

              <div>
                <h1 className="font-display text-2xl font-semibold">
                  Voice isn't available here
                </h1>
                <p className="mt-2 text-sm text-[#8B8D97] leading-relaxed">
                  Your browser can't do speech recognition. Please open this
                  page in Google Chrome or Microsoft Edge.
                </p>
              </div>

              <Button
                onClick={onEnd}
                className={`w-full h-11 ${primaryBtn}`}
              >
                Back to dashboard
              </Button>
            </CardContent>
          </Card>
        </Centered>
      </PageChrome>
    );
  }

  // Pre-session ready screen
  if (!voiceStarted) {
    return (
      <PageChrome>
        <Centered>
          <Card className={`${cardClass} max-w-md pop-in`}>
            <CardContent className="flex flex-col items-center gap-6 p-8 sm:p-10 text-center">
              <div className="relative">
                <div className="ripple-effect absolute inset-0 rounded-full border-2 border-[#E5B858]/50" />
                <div className="orb-breathe relative flex size-24 items-center justify-center rounded-full border border-[#E5B858]/40 bg-[#1E202B] text-[#E5B858] shadow-2xl shadow-[#E5B858]/25">
                  <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
                  <MicIcon className="relative size-10" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-[#E5B858]">Welcome to Intervia</p>
                <h1 className="font-display text-3xl font-semibold">
                  Ready when you are
                </h1>
                <p className="mt-2.5 text-sm text-[#8B8D97] max-w-xs mx-auto leading-relaxed">
                  Your interviewer will speak and you'll answer out loud. Find
                  a quiet spot, take a breath, and begin.
                </p>
              </div>

              <div className="flex w-full max-w-xs flex-col gap-2">
                <Button
                  size="lg"
                  onClick={onBegin}
                  className={`h-12 w-full text-base ${primaryBtn}`}
                >
                  Start interview
                </Button>

                <Button
                  variant="ghost"
                  onClick={onEnd}
                  className="h-10 rounded-full text-sm text-[#8B8D97] hover:bg-white/5 hover:text-white"
                >
                  Not now
                </Button>
              </div>
            </CardContent>
          </Card>
        </Centered>
      </PageChrome>
    );
  }

  const isThinking = status === "PROCESSING" || (isSubmitting && status !== "ERROR");

  // Only show live words while listening, and never a leftover from the
  // previous answer.
  const liveText =
    status === "LISTENING"
      ? interimTranscript ||
        (transcript !== baselineTranscript ? transcript : "")
      : "";

  const captionText = isThinking
    ? ""
    : status === "LISTENING"
    ? liveText
    : status === "SPEAKING"
    ? "Listen to the question, then tap Answer."
    : "Tap Answer when you're ready to speak.";

  const statusLabel = isThinking
    ? "Thinking about your answer..."
    : status === "SPEAKING"
      ? "Interviewer is speaking"
      : status === "LISTENING"
      ? "Listening to you..."
      : status === "IDLE"
      ? "Your turn to speak"
      : "Something went wrong with audio";

  const statusBadgeStyle =
    status === "LISTENING"
      ? "border-[#54BD78]/30 bg-[#54BD78]/10 text-[#73CE92]"
      : status === "ERROR"
      ? "border-[#D85D52]/30 bg-[#D85D52]/10 text-[#E8928A]"
      : "border-[#E5B858]/30 bg-[#E5B858]/10 text-[#FFD375]";

  return (
    <PageChrome>
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5 sm:px-8">
          <BrandMark />
          <div className="flex items-center gap-2 rounded-full border border-[#54BD78]/30 bg-[#54BD78]/10 px-3 py-1 text-xs font-medium text-[#73CE92]">
            <span className="size-2 rounded-full bg-[#54BD78] animate-pulse" />
            Live
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6">
          <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-5 py-3 text-center">
            <div key={question} className="pop-in">
              <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-wide text-[#E5B858]"><span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E5B858]/60" />Question<span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E5B858]/60" /></p>
              <h1 className="mt-3 font-display text-lg font-medium leading-relaxed text-[#F7F5F0] sm:text-2xl">
                {question}
              </h1>
            </div>

            <div className="shrink-0 py-2 [@media(max-height:760px)]:-my-3 [@media(max-height:760px)]:scale-75">
              <VoiceIndicator status={status} />
            </div>

            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${statusBadgeStyle}`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {statusLabel}
            </div>

            <p
              className={`max-h-20 min-h-6 max-w-xl overflow-y-auto rounded-2xl bg-white/[0.03] px-4 py-2 text-sm italic leading-relaxed text-[#A2A4AD] ${
                captionText ? "" : "invisible"
              }`}
            >
              {captionText}
            </p>

            {error && (
              <div className="w-full max-w-xl rounded-xl border border-[#D85D52]/30 bg-[#D85D52]/10 p-3 text-xs text-[#E8928A]">
                {error}
              </div>
            )}
          </div>
        </main>

        <footer className="shrink-0 px-5 pb-5 sm:pb-6">
          <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[#14151B]/85 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {status === "LISTENING" ? (
              <Button
                size="lg"
                onClick={onStopListening}
                className="h-12 min-w-44 rounded-full bg-gradient-to-r from-[#E86D63] to-[#D85D52] font-semibold text-white shadow-lg shadow-[#D85D52]/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                I'm done
              </Button>
            ) : status === "SPEAKING" ? (
              <Button
                size="lg"
                variant="outline"
                onClick={onStopSpeaking}
                className="h-12 min-w-44 rounded-full border-white/10 bg-white/5 text-[#EDEAE4] hover:bg-white/10 hover:text-white"
              >
                Skip question audio
              </Button>
            ) : status === "PROCESSING" ? (
              <Button
                size="lg"
                disabled
                className="h-12 min-w-44 cursor-not-allowed rounded-full bg-white/10 text-[#7E8088]"
              >
                Working on it...
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={onListen}
                disabled={isSubmitting || !turnId}
                className={`h-12 min-w-44 gap-2 ${primaryBtn}`}
              >
                <MicIcon className="size-4" />
                Answer
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onEnd}
              disabled={isSubmitting}
              className="h-12 rounded-full px-5 text-sm text-[#8B8D97] hover:bg-white/5 hover:text-white"
            >
              End session
            </Button>
          </div>
        </footer>
      </div>
    </PageChrome>
  );
}