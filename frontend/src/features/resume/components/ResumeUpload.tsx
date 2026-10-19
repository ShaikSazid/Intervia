import { useRef, useState, type ChangeEvent } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { useResumeUpload } from "../hooks/useResumeUpload";

import type { Resume } from "../api/resume.api";

interface ResumeUploadProps {
  onResumeReady: (resume: Resume) => void;
}

const cardClass =
  "relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#14151B]/90 text-[#EDEAE4] shadow-2xl shadow-black/50 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#E5B858]/70 before:to-transparent";

const primaryBtn =
  "h-12 w-full rounded-full bg-gradient-to-r from-[#E5B858] via-[#F3C86A] to-[#CCA043] bg-[length:200%_100%] text-[#0F1014] font-semibold shadow-lg shadow-[#E5B858]/25 transition-all hover:-translate-y-0.5 hover:bg-[position:100%_0] hover:brightness-110 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#E5B858]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0E12]";

export default function ResumeUpload({ onResumeReady }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadResume, resume, isUploading, error } = useResumeUpload();

  /*
   * File selected
   */

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      return;
    }

    setSelectedFile(file);
  };

  /*
   * Upload
   */

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    const uploadedResume = await uploadResume(selectedFile);

    if (!uploadedResume) {
      return;
    }

    console.log("ResumeUpload sending resume to Dashboard:", uploadedResume);

    /*
     * IMPORTANT:
     *
     * Pass the complete Resume object to the parent.
     *
     * DashboardPage will use:
     *
     * resume.id
     */

    onResumeReady(uploadedResume);
  };

  /*
   * Resume ready
   */

  if (resume) {
    return (
      <Card className={cardClass}>
        <CardHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold text-[#F7F5F0]">
                Resume ready
              </CardTitle>

              <CardDescription className="mt-1 text-sm text-[#8B8D97]">
                Your resume has been uploaded and analyzed.
              </CardDescription>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#54BD78]/30 bg-[#54BD78]/10 px-3 py-1 text-xs font-medium text-[#73CE92]">
              <span className="size-1.5 animate-pulse rounded-full bg-[#54BD78]" />
              All set
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-5 font-body">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E5B858] to-[#CCA043] text-[#0F1014] shadow-md shadow-[#E5B858]/20">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#F7F5F0]">
                  {resume.fileName}
                </p>

                <p className="mt-0.5 text-xs text-[#8B8D97]">
                  Parsed and indexed for your interview
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#73CE92]">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#54BD78]/15">
                ✓
              </span>
              Loaded
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /*
   * Upload UI
   */

  return (
    <Card className={cardClass}>
      <CardHeader className="border-b border-white/[0.06] pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold text-[#F7F5F0]">
              Upload your resume
            </CardTitle>

            <CardDescription className="mt-1 text-sm text-[#8B8D97]">
              Add a PDF and we'll shape your interview around it.
            </CardDescription>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#A2A4AD]">
            PDF only
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5 font-body">
        {/* Dropzone */}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center transition-all duration-200 hover:border-[#E5B858]/60 hover:bg-[#E5B858]/[0.04] focus-visible:border-[#E5B858] focus-visible:outline-none"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E5B858]/10 text-[#E5B858] ring-1 ring-[#E5B858]/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
            <svg
              className="size-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="mt-3 text-base font-semibold text-[#F7F5F0]">
            Choose your resume
          </p>

          <p className="mt-1 text-sm text-[#8B8D97]">
            Click to browse your PDF
          </p>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Selected file */}

        {selectedFile && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5B858]/25 bg-[#E5B858]/[0.06] p-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-lg">📄</span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#F7F5F0]">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-[#8B8D97]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-[#E5B858]/15 px-2.5 py-0.5 text-xs font-semibold text-[#FFD375]">
              Ready
            </span>
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[#D85D52]/30 bg-[#D85D52]/10 p-3 text-xs text-[#E8928A]">
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

        {/* Upload button */}

        <Button
          className={primaryBtn}
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-3-2.647z"
                />
              </svg>
              Preparing your interview...
            </span>
          ) : (
            "Upload resume"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}