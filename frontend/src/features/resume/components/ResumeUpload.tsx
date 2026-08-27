import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";

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
  useResumeUpload,
} from "../hooks/useResumeUpload";

import type {
  Resume,
} from "../api/resume.api";


interface ResumeUploadProps {

  onResumeReady: (
    resume: Resume
  ) => void;

}


export default function ResumeUpload({
  onResumeReady,
}: ResumeUploadProps) {

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null
  );


  const {
    uploadResume,
    resume,
    isUploading,
    error,
  } =
    useResumeUpload();


  /*
   * ============================================================
   * File selected
   * ============================================================
   */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      file.type !==
      "application/pdf"
    ) {

      return;
    }


    setSelectedFile(
      file
    );
  };


  /*
   * ============================================================
   * Upload
   * ============================================================
   */

  const handleUpload =
    async () => {

      if (!selectedFile) {
        return;
      }


      const uploadedResume =
        await uploadResume(
          selectedFile
        );


      if (!uploadedResume) {
        return;
      }


      console.log(
        "ResumeUpload sending resume to Dashboard:",
        uploadedResume
      );


      /*
       * IMPORTANT:
       *
       * Pass the complete Resume object to the parent.
       *
       * DashboardPage will use:
       *
       * resume.id
       */

      onResumeReady(
        uploadedResume
      );
    };


  /*
   * ============================================================
   * Resume ready
   * ============================================================
   */

  if (resume) {

    return (

      <Card className="rounded-lg border-[#26272C] bg-[#16171A] shadow-2xl">

        <CardHeader className="border-b border-[#26272C] pb-4">

          <div className="flex items-center justify-between">

            <div>

              <CardTitle className="font-display text-lg font-medium text-[#F5F3EE]">
                Resume ready
              </CardTitle>


              <CardDescription className="text-xs text-[#8B8A85]">
                Your resume has been uploaded and analyzed successfully.
              </CardDescription>

            </div>


            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3F5B44] bg-[#3F5B44]/10 px-2.5 py-1 font-data text-[10.5px] tracking-wide text-[#5E8869] uppercase">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E8869]" />

              Cleared

            </span>

          </div>

        </CardHeader>


        <CardContent className="pt-5 font-body">

          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#26272C] bg-[#111214] p-4 transition-all">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#C9A24B]/30 bg-[#C9A24B]/10 text-[#C9A24B]">

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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />

                </svg>

              </div>


              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[#EDEAE4]">
                  {resume.fileName}
                </p>


                <p className="mt-0.5 text-xs text-[#8B8A85]">
                  Parsed & indexed for your interview session
                </p>

              </div>

            </div>


            <div className="flex shrink-0 items-center gap-1 font-data text-[10.5px] font-medium tracking-wide text-[#5E8869] uppercase">

              <span>
                ✓
              </span>


              <span>
                Loaded
              </span>

            </div>

          </div>

        </CardContent>

      </Card>

    );
  }


  /*
   * ============================================================
   * Upload UI
   * ============================================================
   */

  return (

    <Card className="rounded-lg border-[#26272C] bg-[#16171A] shadow-2xl">

      <CardHeader className="border-b border-[#26272C] pb-4">

        <div className="flex items-center justify-between">

          <div>

            <CardTitle className="font-display text-lg font-medium text-[#F5F3EE]">
              Upload your resume
            </CardTitle>


            <CardDescription className="text-xs text-[#8B8A85]">
              Upload a PDF resume to prepare your adaptive interview.
            </CardDescription>

          </div>


          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3A3B41] bg-[#1D1E23] px-2.5 py-1 font-data text-[10px] tracking-wide text-[#8B8A85] uppercase">

            <span className="h-1.5 w-1.5 rounded-full bg-[#5C5B57]" />

            PDF Only

          </span>

        </div>

      </CardHeader>


      <CardContent className="space-y-4 pt-5 font-body">

        {/* Dropzone */}

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="group relative flex min-h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#2A2B31] bg-[#111214] p-6 text-center transition-all duration-200 hover:border-[#C9A24B]/50 hover:bg-[#131417]"
        >

          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#26272C] bg-[#16171A] text-[#C9A24B] transition-transform group-hover:scale-110">

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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />

            </svg>

          </div>


          <p className="mt-3 text-sm font-semibold text-[#EDEAE4] transition-colors group-hover:text-[#F5F3EE]">
            Choose your resume
          </p>


          <p className="mt-1 text-xs text-[#5C5B57]">
            Click to browse and drop your pdf
          </p>

        </button>


        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={
            handleFileChange
          }
        />


        {/* Selected file */}

        {selectedFile && (

          <div className="flex items-center justify-between rounded-lg border border-[#C9A24B]/20 bg-[#C9A24B]/[0.05] p-3.5">

            <div className="flex min-w-0 items-center gap-2.5">

              <span className="text-base">
                📄
              </span>


              <div className="min-w-0">

                <p className="truncate text-xs font-semibold text-[#EDEAE4]">
                  {selectedFile.name}
                </p>


                <p className="font-data text-[10.5px] text-[#8B8A85]">
                  {(
                    selectedFile.size /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </p>

              </div>

            </div>


            <span className="font-data text-[10.5px] font-medium tracking-wide text-[#C9A24B] uppercase">
              Ready
            </span>

          </div>

        )}


        {/* Error */}

        {error && (

          <div className="flex items-center gap-2 rounded-lg border border-[#C0665A]/30 bg-[#C0665A]/[0.08] p-3 text-xs text-[#D89A8D]">

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


        {/* Upload button */}

        <Button
          className="w-full rounded-md bg-[#C9A24B] text-[#111214] font-semibold shadow-md shadow-[#C9A24B]/15 transition-all hover:bg-[#DAB768] disabled:opacity-40"
          disabled={
            !selectedFile ||
            isUploading
          }
          onClick={
            handleUpload
          }
        >

          {isUploading ? (

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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-3-2.647z"
                />

              </svg>


              Preparing your interview...

            </span>

          ) : (

            "Upload Resume"

          )}

        </Button>

      </CardContent>

    </Card>

  );
}