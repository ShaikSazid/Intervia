import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../providers/AuthProvider";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ResumeUpload from "@/features/resume/components/ResumeUpload";

import type {
  Resume,
} from "@/features/resume/api/resume.api";

import {
  interviewApi,
  type InterviewMode,
} from "@/features/interview/api/interview.api";


export default function DashboardPage() {

  const {
    user,
  } = useAuth();


  const navigate =
    useNavigate();


  /*
   * ============================================================
   * Resume
   * ============================================================
   */

  const [
    resume,
    setResume,
  ] = useState<Resume | null>(
    null
  );


  /*
   * ============================================================
   * Interview mode
   * ============================================================
   */

  const [
    isModeDialogOpen,
    setIsModeDialogOpen,
  ] = useState(false);


  const [
    selectedMode,
    setSelectedMode,
  ] = useState<InterviewMode>(
    "VOICE"
  );


  /*
   * ============================================================
   * Interview starting state
   * ============================================================
   */

  const [
    isStartingInterview,
    setIsStartingInterview,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  /*
   * ============================================================
   * Resume uploaded
   * ============================================================
   */

  const handleResumeReady = (
    uploadedResume: Resume
  ) => {

    console.log(
      "Dashboard received resume:",
      uploadedResume
    );


    setResume(
      uploadedResume
    );


    setError(
      null
    );
  };


  /*
   * ============================================================
   * Open mode selector
   * ============================================================
   */

  const handleStartButtonClick = () => {

    if (!resume) {

      console.error(
        "Cannot start interview: resume is missing."
      );


      setError(
        "Please upload your resume first."
      );


      return;
    }


    setError(
      null
    );


    setIsModeDialogOpen(
      true
    );
  };


  /*
   * ============================================================
   * Start interview
   * ============================================================
   */

  const handleStartInterview =
    async () => {

      if (!resume) {

        setError(
          "Resume is not ready."
        );


        return;
      }


      setIsStartingInterview(
        true
      );


      setError(
        null
      );


      try {

        console.log(
          "Starting interview with resume:",
          resume
        );


        console.log(
          "[Dashboard] resume object:",
          resume
        );


        console.log(
          "[Dashboard] resume.id:",
          resume?.id
        );


        console.log(
          "[Dashboard] interview payload:",
          {
            resumeId:
              resume?.id,

            targetRole:
              "Backend Developer",

            durationMinutes:
              30,

            interviewType:
              "TECHNICAL",

            language:
              "English",
          }
        );


        /*
         * ------------------------------------------------------------
         * Create interview session
         * ------------------------------------------------------------
         */

        const response =
          await interviewApi.start({

            resumeId:
              resume.id,

            targetRole:
              "Backend Developer",

            durationMinutes:
              30,

            interviewType:
              "TECHNICAL",

            language:
              "English",

          });


        console.log(
          "Interview start response:",
          response
        );


        /*
         * ------------------------------------------------------------
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
         * ------------------------------------------------------------
         */

        const {
          session,

          question,

          turnId,

        } =
          response.data;


        console.log(
          "[Dashboard] First question:",
          question
        );


        console.log(
          "[Dashboard] First turnId:",
          turnId
        );


        /*
         * ------------------------------------------------------------
         * Validate turnId
         * ------------------------------------------------------------
         */

        if (
          !turnId ||
          typeof turnId !==
            "string"
        ) {

          throw new Error(
            "Interview started but the first turnId was not returned."
          );
        }

        navigate(
          `/interview/${session.id}`,
          {
            state: {

              question,

              turnId,

              mode:
                selectedMode,

            },
          }
        );

      } catch (
        error
      ) {

        console.error(
          "Unable to start interview:",
          error
        );


        setError(
          "Unable to start the interview. Please try again."
        );

      } finally {

        setIsStartingInterview(
          false
        );
      }
    };


  /*
   * Derived, presentation-only — reads existing state, changes nothing.
   */

  const isResumeReady =
    Boolean(resume);

  const railStage =
    isStartingInterview
      ? 2
      : isResumeReady
        ? 1
        : 0;


  return (

    <div className="relative min-h-screen bg-[#111214] text-[#EDEAE4] antialiased selection:bg-[#C9A24B]/30 selection:text-[#C9A24B]">

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .font-display {
          font-family:
            'Newsreader',
            ui-serif,
            Georgia,
            serif;
          font-style: italic;
        }

        .font-body {
          font-family:
            'IBM Plex Sans',
            ui-sans-serif,
            system-ui,
            sans-serif;
        }

        .font-data {
          font-family:
            'IBM Plex Mono',
            ui-monospace,
            SFMono-Regular,
            monospace;
        }

      `}</style>


      {/* ============================================================
          Background
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-[#C9A24B]/[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#3F5B44]/[0.04] blur-3xl" />

      </div>


      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1c1d21_1px,transparent_1px),linear-gradient(to_bottom,#1c1d21_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,#000_50%,transparent_100%)]" />


      <main className="relative mx-auto max-w-6xl px-4 py-4 font-body sm:px-6 lg:px-8">


        {/* ============================================================
            Brand
        ============================================================ */}

        <div className="mb-3 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative flex h-7 w-7 items-center justify-center rounded-sm border border-[#C9A24B]/50">

              <div className="absolute inset-[2.5px] rounded-[1px] border border-[#C9A24B]/30" />

              <span className="font-data text-[10px] text-[#C9A24B]">
                IA
              </span>

            </div>


            <span className="font-data text-[10.5px] tracking-[0.2em] text-[#8B8A85] uppercase">
              Interview / AI
            </span>

          </div>


          <span className="font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase">
            Assessment Engine
          </span>

        </div>


        {/* ============================================================
            Header
        ============================================================ */}

        <header className="mb-3 flex flex-col items-start justify-between gap-3 border-b border-[#1F2025] pb-3 sm:flex-row sm:items-end">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A24B]/30 bg-[#C9A24B]/10 px-3 py-1 font-data text-[10.5px] tracking-[0.15em] text-[#C9A24B] uppercase">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9A24B] opacity-70" />

                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C9A24B]" />

              </span>

              Adaptive Assessment — Live

            </div>


            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-[#F5F3EE] sm:text-4xl">

              Welcome back
              {user?.username
                ? ` ${user.username}`
                : ""}

            </h1>


            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8B8A85]">

              Upload your resume and we'll prepare an adaptive interview
              around your experience.

            </p>

          </div>

        </header>


        {/* ============================================================
            File Progress Rail
        ============================================================ */}

        <div className="mb-4 rounded-lg border border-[#26272C] bg-[#16171A] px-5 py-3">

          <div className="mb-2 flex items-center justify-between">

            <span className="font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase">
              File · Opened Today
            </span>

            <span className="font-data text-[10px] tracking-[0.15em] text-[#C9A24B] uppercase">
              {Math.round((railStage / 2) * 100)}% Complete
            </span>

          </div>


          <div className="flex items-center">

            {["File opened", "Resume attached", "Interview launched"].map(
              (stage, i) => (

                <div key={stage} className="flex flex-1 items-center last:flex-initial">

                  <div className="flex items-center gap-2.5">

                    <span
                      className={
                        i <= railStage
                          ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3F5B44] text-[9px] text-[#EDEAE4]"
                          : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#3A3B41] text-[9px] text-[#5C5B57]"
                      }
                    >
                      {i < railStage ? "✓" : i === railStage ? "•" : ""}
                    </span>


                    <span
                      className={
                        i <= railStage
                          ? "whitespace-nowrap font-body text-[12.5px] font-medium text-[#EDEAE4]"
                          : "whitespace-nowrap font-body text-[12.5px] text-[#5C5B57]"
                      }
                    >
                      {stage}
                    </span>

                  </div>


                  {i < 2 && (

                    <div className="relative mx-4 h-px flex-1 overflow-hidden bg-[#26272C]">

                      <div
                        className="absolute inset-y-0 left-0 bg-[#3F5B44] transition-all duration-700 ease-out"
                        style={{ width: i < railStage ? "100%" : "0%" }}
                      />

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        </div>


        {/* ============================================================
            Main layout
        ============================================================ */}

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">

          {/* Resume */}

          <div className="cursor-pointer">

            <ResumeUpload
              onResumeReady={
                handleResumeReady
              }
            />

          </div>


          {/* Guide */}

          <Card className="h-fit rounded-lg border-[#26272C] bg-[#16171A] shadow-xl">

            <CardHeader className="border-b border-[#26272C] pb-4">

              <CardTitle className="font-display text-lg font-medium text-[#F5F3EE]">
                How it works
              </CardTitle>


              <CardDescription className="text-xs text-[#8B8A85]">
                You focus on the conversation. We'll handle the rest.
              </CardDescription>

            </CardHeader>


            <CardContent className="pt-3">

              <div className="space-y-3">

                <div className="flex gap-3.5">

                  <div
                    className={
                      isResumeReady
                        ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[#3F5B44] font-data text-[11px] font-medium text-[#EDEAE4]"
                        : "flex size-7 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/40 bg-[#C9A24B]/10 font-data text-[11px] font-medium text-[#C9A24B]"
                    }
                  >
                    {isResumeReady ? "✓" : "1"}
                  </div>


                  <div>

                    <p className="text-sm font-semibold text-[#EDEAE4]">
                      Upload
                    </p>


                    <p className="mt-0.5 text-xs leading-relaxed text-[#8B8A85]">
                      Upload your resume in PDF format.
                    </p>

                  </div>

                </div>


                <div className="flex gap-3.5">

                  <div
                    className={
                      isResumeReady
                        ? "flex size-7 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/40 bg-[#C9A24B]/10 font-data text-[11px] font-medium text-[#C9A24B]"
                        : "flex size-7 shrink-0 items-center justify-center rounded-full border border-[#3A3B41] bg-[#1D1E23] font-data text-[11px] font-medium text-[#8B8A85]"
                    }
                  >
                    2
                  </div>


                  <div>

                    <p className="text-sm font-semibold text-[#EDEAE4]">
                      Start
                    </p>


                    <p className="mt-0.5 text-xs leading-relaxed text-[#8B8A85]">
                      Choose voice or video interview mode.
                    </p>

                  </div>

                </div>


                <div className="flex gap-3.5">

                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#3A3B41] bg-[#1D1E23] font-data text-[11px] font-medium text-[#8B8A85]">
                    3
                  </div>


                  <div>

                    <p className="text-sm font-semibold text-[#EDEAE4]">
                      Interview
                    </p>


                    <p className="mt-0.5 text-xs leading-relaxed text-[#8B8A85]">
                      The interviewer adapts in real-time to your answers.
                    </p>

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>


        {/* ============================================================
            Start interview strip
        ============================================================ */}

        <div className="mt-4">

          <Card className="overflow-hidden rounded-lg border-[#26272C] bg-[#16171A] shadow-2xl">

            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A24B]/70 to-transparent" />


            <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">

              <div className="space-y-1">

                <div className="flex items-center gap-2">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      resume
                        ? "bg-[#5E8869] shadow-[0_0_8px_#5E8869]"
                        : "bg-[#5C5B57]"
                    }`}
                  />


                  <p className="font-semibold text-[#F5F3EE]">

                    {resume
                      ? "Your resume is cleared."
                      : "Upload your resume to begin."}

                  </p>

                </div>


                <p className="text-xs text-[#8B8A85]">

                  {resume
                    ? "Choose a mode and start your adaptive interview."
                    : "The interview cannot start until a resume has been uploaded."}

                </p>

              </div>


              <Button
                size="lg"
                disabled={
                  !resume ||
                  isStartingInterview
                }
                onClick={
                  handleStartButtonClick
                }
                className="min-w-[180px] cursor-pointer rounded-md bg-[#C9A24B] text-sm font-semibold text-[#111214] shadow-lg shadow-[#C9A24B]/15 transition-all hover:bg-[#DAB768] active:scale-[0.98] disabled:opacity-40"
              >

                {isStartingInterview ? (

                  <span className="flex items-center gap-2">

                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >

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


                    Starting...

                  </span>

                ) : (

                  "Start Interview →"

                )}

              </Button>

            </CardContent>

          </Card>

        </div>


        {/* ============================================================
            Error
        ============================================================ */}

        {error && (

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#C0665A]/30 bg-[#C0665A]/[0.08] p-4 text-xs text-[#D89A8D]">

            <svg
              className="h-4 w-4 shrink-0 text-[#C0665A]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >

              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 01-2 0V6a1 1 0 011-1z"
                clipRule="evenodd"
              />

            </svg>


            <span>
              {error}
            </span>

          </div>

        )}

      </main>


      {/* ================================================================
          Mode selector — the moment of commitment, styled accordingly
      ================================================================ */}

      <Dialog
        open={
          isModeDialogOpen
        }
        onOpenChange={
          setIsModeDialogOpen
        }
      >

        <DialogContent className="overflow-hidden rounded-lg border-[#26272C] bg-[#111214] p-0 text-[#EDEAE4] sm:max-w-xl">

          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A24B]/70 to-transparent" />

          <div className="px-6 pb-6 pt-5">

            <DialogHeader>

              <DialogTitle className="font-display text-2xl font-medium text-[#F5F3EE]">
                Choose your interview mode
              </DialogTitle>


              <DialogDescription className="font-body text-xs text-[#8B8A85]">
                Choose how you'd like to interact with the interviewer.
                You can switch modes anytime before starting.
              </DialogDescription>

            </DialogHeader>


            {/* Session recap — real values, same ones sent to the API below */}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-[#26272C] bg-[#16171A] px-4 py-2.5">

              <span className="font-data text-[9.5px] tracking-[0.15em] text-[#5C5B57] uppercase">
                This session
              </span>

              <span className="h-3 w-px bg-[#26272C]" />

              <span className="font-body text-xs text-[#B8B6B0]">
                Backend Developer
              </span>

              <span className="h-3 w-px bg-[#26272C]" />

              <span className="font-body text-xs text-[#B8B6B0]">
                30 min
              </span>

              <span className="h-3 w-px bg-[#26272C]" />

              <span className="font-body text-xs text-[#B8B6B0]">
                Technical
              </span>

            </div>


            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* Voice */}

              <button
                type="button"
                onClick={() =>
                  setSelectedMode(
                    "VOICE"
                  )
                }
                className={[
                  "group relative flex flex-col justify-between rounded-lg border p-5 text-left transition-all duration-200 outline-none",

                  selectedMode === "VOICE"

                    ? "border-[#C9A24B] bg-[#C9A24B]/[0.08] shadow-lg shadow-[#C9A24B]/10 ring-1 ring-[#C9A24B]/30"

                    : "border-[#26272C] bg-[#16171A] hover:border-[#3A3B41] hover:bg-[#1A1B20]",

                ].join(" ")}
              >

                {/* Radio indicator */}

                <span
                  className={
                    selectedMode === "VOICE"
                      ? "absolute right-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border border-[#C9A24B] bg-[#C9A24B]/20"
                      : "absolute right-4 top-4 h-4 w-4 rounded-full border border-[#3A3B41]"
                  }
                >
                  {selectedMode === "VOICE" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9A24B]" />
                  )}
                </span>


                <div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#26272C] bg-[#111214] text-[#C9A24B] transition-transform group-hover:scale-105">

                    <svg
                      className="h-5 w-5"
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


                  <p className="mt-4 text-sm font-semibold text-[#F5F3EE]">
                    Voice
                  </p>


                  <p className="mt-1 text-xs leading-relaxed text-[#8B8A85]">
                    Speak naturally with the interviewer.
                  </p>

                </div>


                {selectedMode === "VOICE" && (

                  <div className="mt-4 flex items-center gap-1.5 font-data text-[10.5px] tracking-wide text-[#C9A24B] uppercase">

                    <span>
                      Selected
                    </span>

                    <span>
                      ✓
                    </span>

                  </div>

                )}

              </button>


              {/* Video */}

              <button
                type="button"
                onClick={() =>
                  setSelectedMode(
                    "VIDEO"
                  )
                }
                className={[
                  "group relative flex flex-col justify-between rounded-lg border p-5 text-left transition-all duration-200 outline-none",

                  selectedMode === "VIDEO"

                    ? "border-[#C9A24B] bg-[#C9A24B]/[0.08] shadow-lg shadow-[#C9A24B]/10 ring-1 ring-[#C9A24B]/30"

                    : "border-[#26272C] bg-[#16171A] hover:border-[#3A3B41] hover:bg-[#1A1B20]",

                ].join(" ")}
              >

                {/* Radio indicator */}

                <span
                  className={
                    selectedMode === "VIDEO"
                      ? "absolute right-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border border-[#C9A24B] bg-[#C9A24B]/20"
                      : "absolute right-4 top-4 h-4 w-4 rounded-full border border-[#3A3B41]"
                  }
                >
                  {selectedMode === "VIDEO" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9A24B]" />
                  )}
                </span>


                <div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#26272C] bg-[#111214] text-[#C9A24B] transition-transform group-hover:scale-105">

                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                      />

                    </svg>

                  </div>


                  <p className="mt-4 text-sm font-semibold text-[#F5F3EE]">
                    Video
                  </p>


                  <p className="mt-1 text-xs leading-relaxed text-[#8B8A85]">
                    Interview with camera and microphone.
                  </p>

                </div>


                {selectedMode === "VIDEO" && (

                  <div className="mt-4 flex items-center gap-1.5 font-data text-[10.5px] tracking-wide text-[#C9A24B] uppercase">

                    <span>
                      Selected
                    </span>

                    <span>
                      ✓
                    </span>

                  </div>

                )}

              </button>

            </div>


            <DialogFooter className="mt-6 gap-2 sm:gap-0">

              <Button
                variant="outline"
                onClick={() =>
                  setIsModeDialogOpen(
                    false
                  )
                }
                className="rounded-md border-[#26272C] bg-transparent text-[#B8B6B0] hover:bg-[#1A1B20] hover:text-[#F5F3EE]"
              >
                Cancel
              </Button>


              <Button
                disabled={
                  isStartingInterview
                }
                onClick={
                  async () => {

                    setIsModeDialogOpen(
                      false
                    );


                    await handleStartInterview();

                  }
                }
                className="rounded-md bg-[#C9A24B] font-semibold text-[#111214] shadow-md shadow-[#C9A24B]/15 hover:bg-[#DAB768]"
              >

                {isStartingInterview
                  ? "Starting..."
                  : "Start Interview"}

              </Button>

            </DialogFooter>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}