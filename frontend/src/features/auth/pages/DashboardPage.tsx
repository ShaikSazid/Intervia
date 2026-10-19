import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";

import { Button } from "@/components/ui/button";

import ResumeUpload from "@/features/resume/components/ResumeUpload";

import type { Resume } from "@/features/resume/api/resume.api";

import {
  interviewApi,
  type InterviewMode,
} from "@/features/interview/api/interview.api";

/* ---------- shared look ---------- */

const cardClass =
  "relative overflow-hidden rounded-3xl border border-white/10 bg-[#14151B]/90 text-[#EDEAE4] shadow-2xl shadow-black/50 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#E5B858]/70 before:to-transparent";

const primaryBtn =
  "rounded-full bg-gradient-to-r from-[#E5B858] via-[#F3C86A] to-[#CCA043] bg-[length:200%_100%] text-[#0F1014] font-semibold shadow-lg shadow-[#E5B858]/25 transition-all hover:-translate-y-0.5 hover:bg-[position:100%_0] hover:brightness-110 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#E5B858]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0E12]";

function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F3C86A] via-[#E5B858] to-[#CCA043] shadow-md shadow-[#E5B858]/30 ring-1 ring-white/20 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[62%]"
        fill="none"
        stroke="#0F1014"
        strokeWidth={2}
        strokeLinecap="round"
      >
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

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function Step({
  state,
  number,
  title,
  text,
  last,
}: {
  state: "done" | "active" | "idle";
  number: number;
  title: string;
  text: string;
  last?: boolean;
}) {
  const bubble =
    state === "done"
      ? "bg-[#54BD78] text-[#0F1014]"
      : state === "active"
      ? "bg-[#E5B858]/15 text-[#E5B858] ring-1 ring-[#E5B858]/50"
      : "bg-white/5 text-[#8B8D97] ring-1 ring-white/10";

  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-500 ${bubble}`}
        >
          {state === "done" ? "✓" : number}
        </div>

        {!last && (
          <div
            className={`mt-1.5 w-px flex-1 transition-colors duration-500 ${
              state === "done" ? "bg-[#54BD78]/50" : "bg-white/10"
            }`}
          />
        )}
      </div>

      <div className={last ? "" : "pb-4"}>
        <p className="text-sm font-semibold text-[#F7F5F0]">{title}</p>

        <p className="mt-0.5 text-xs leading-relaxed text-[#8B8D97]">{text}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const navigate = useNavigate();

  /*
   * Resume
   */

  const [resume, setResume] = useState<Resume | null>(null);

  /*
   * Interview mode — starts straight away in voice mode
   */

  const [selectedMode] = useState<InterviewMode>("VOICE");

  /*
   * Interview starting state
   */

  const [isStartingInterview, setIsStartingInterview] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * Resume uploaded
   */

  const handleResumeReady = (uploadedResume: Resume) => {
    console.log("Dashboard received resume:", uploadedResume);

    setResume(uploadedResume);

    setError(null);
  };

  /*
   * Open mode selector
   */

  const handleStartButtonClick = () => {
    if (!resume) {
      console.error("Cannot start interview: resume is missing.");

      setError("Please upload your resume first.");

      return;
    }

    setError(null);

    void handleStartInterview();
  };

  /*
   * Start interview
   */

  const handleStartInterview = async () => {
    if (!resume) {
      setError("Resume is not ready.");

      return;
    }

    setIsStartingInterview(true);

    setError(null);

    try {
      console.log("Starting interview with resume:", resume);

      console.log("[Dashboard] resume object:", resume);

      console.log("[Dashboard] resume.id:", resume?.id);

      console.log("[Dashboard] interview payload:", {
        resumeId: resume?.id,

        targetRole: "Backend Developer",

        durationMinutes: 30,

        interviewType: "TECHNICAL",

        language: "English",
      });

      /*
       * Create interview session
       */

      const response = await interviewApi.start({
        resumeId: resume.id,

        targetRole: "Backend Developer",

        durationMinutes: 30,

        interviewType: "TECHNICAL",

        language: "English",
      });

      console.log("Interview start response:", response);

      /*
       * IMPORTANT:
       *
       * The backend now returns:
       *
       * session
       * question
       * turnId
       *
       * turnId identifies the exact ConversationTurn
       * belonging to the first question.
       */

      const { session, question, turnId } = response.data;

      console.log("[Dashboard] First question:", question);

      console.log("[Dashboard] First turnId:", turnId);

      /*
       * Validate turnId
       */

      if (!turnId || typeof turnId !== "string") {
        throw new Error(
          "Interview started but the first turnId was not returned."
        );
      }

      navigate(`/interview/${session.id}`, {
        state: {
          question,

          turnId,

          mode: selectedMode,
        },
      });
    } catch (error) {
      console.error("Unable to start interview:", error);

      setError("Unable to start the interview. Please try again.");
    } finally {
      setIsStartingInterview(false);
    }
  };

  /*
   * Derived, presentation-only — reads existing state, changes nothing.
   */

  const isResumeReady = Boolean(resume);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0D0E12] font-body text-[#EDEAE4] antialiased selection:bg-[#E5B858]/30 selection:text-[#E5B858]">
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500&display=swap');

        .font-display {
          font-family: 'Playfair Display', Georgia, serif;
        }

        .font-body {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

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

        @keyframes popIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .pop-in { animation: popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .pop-in-2 { animation: popIn 0.5s 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .pop-in-3 { animation: popIn 0.5s 0.16s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .blob-a, .blob-b, .pop-in, .pop-in-2, .pop-in-3 { animation: none; }
        }

      `}</style>

      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob-a absolute -top-40 left-1/4 h-[460px] w-[640px] rounded-full bg-[#C9A24B]/20 blur-[110px]" />

        <div className="blob-b absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-[#3B664B]/30 blur-[110px]" />

        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative flex h-full flex-col">
        {/* Header */}

        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5 sm:px-8">
          <BrandMark />

          {user?.username && (
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E5B858] to-[#CCA043] text-xs font-bold uppercase text-[#0F1014]">
                {user.username.charAt(0)}
              </span>

              <span className="text-sm font-medium text-[#EDEAE4]">
                {user.username}
              </span>
            </div>
          )}
        </header>

        {/* Content */}

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 sm:px-8">
          <div className="m-auto flex w-full max-w-5xl flex-col gap-5 py-5">
            {/* Greeting */}

            <div className="pop-in">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[#F7F5F0] sm:text-4xl">
                Welcome back{user?.username ? `, ${user.username}` : ""}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#8B8D97] sm:text-base">
                Upload your resume and we'll prepare an interview around your
                experience.
              </p>
            </div>

            {/* Main layout */}

            <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
              <div className="pop-in-2">
                <ResumeUpload onResumeReady={handleResumeReady} />
              </div>

              {/* Guide */}

              <div className={`pop-in-3 h-fit p-6 ${cardClass}`}>
                <h2 className="font-display text-xl font-semibold text-[#F7F5F0]">
                  How it works
                </h2>

                <p className="mb-5 mt-1 text-sm text-[#8B8D97]">
                  You focus on the conversation. We handle the rest.
                </p>

                <Step
                  state={isResumeReady ? "done" : "active"}
                  number={1}
                  title="Upload"
                  text="Add your resume as a PDF."
                />

                <Step
                  state={isResumeReady ? "active" : "idle"}
                  number={2}
                  title="Start"
                  text="Voice mode will be enabled and start."
                />

                <Step
                  state="idle"
                  number={3}
                  title="Interview"
                  text="The interviewer adapts to your answers in real time."
                  last
                />
              </div>
            </div>

            {/* Error */}

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#D85D52]/30 bg-[#D85D52]/10 p-3.5 text-sm text-[#E8928A]">
                <svg
                  className="size-4 shrink-0 text-[#D85D52]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 01-2 0V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>

                <span>{error}</span>
              </div>
            )}
          </div>
        </main>

        {/* Start interview dock */}

        <footer className="shrink-0 px-5 pb-5 sm:px-8 sm:pb-6">
          <div
            className={`mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-3 p-3 pl-5 sm:flex-row sm:items-center sm:rounded-full ${cardClass} sm:p-2.5 sm:pl-6`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-2.5 shrink-0 rounded-full transition-all ${
                  resume
                    ? "bg-[#54BD78] shadow-[0_0_10px_#54BD78]"
                    : "bg-[#5C5B57]"
                }`}
              />

              <div>
                <p className="text-sm font-semibold text-[#F7F5F0]">
                  {resume
                    ? "Your resume is ready."
                    : "Upload your resume to begin."}
                </p>

                <p className="text-xs text-[#8B8D97]">
                  {resume
                    ? "Now you can start your interview."
                    : "The interview can't start until a resume is uploaded."}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              disabled={!resume || isStartingInterview}
              onClick={handleStartButtonClick}
              className={`h-12 w-full min-w-[190px] sm:w-auto ${primaryBtn}`}
            >
              {isStartingInterview ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Starting...
                </span>
              ) : (
                "Start interview"
              )}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}