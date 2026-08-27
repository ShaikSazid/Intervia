import { LoginForm } from "../components/LoginForm";
import { Link } from "react-router-dom";

const LOOP_STAGES = ["Phone Screen", "Technical", "System Design", "Behavioral"];
const NEXT_STAGE_INDEX = 1;

const TREND = [
  { label: "Aug 2", value: 6.8 },
  { label: "Aug 9", value: 7.4 },
  { label: "Aug 16", value: 7.9 },
  { label: "Aug 23", value: 8.4 },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#111214] text-[#EDEAE4] antialiased selection:bg-[#C9A24B]/30 selection:text-[#C9A24B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Newsreader', ui-serif, Georgia, serif; font-style: italic; }
        .font-body { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
        .font-data { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

        @keyframes growBar {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .grow-bar { transform-origin: bottom; animation: growBar 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1c1d21_1px,transparent_1px),linear-gradient(to_bottom,#1c1d21_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_55%,transparent_100%)]" />
      <div className="pointer-events-none absolute -top-32 right-1/4 h-[500px] w-[500px] rounded-full bg-[#C9A24B]/[0.05] blur-[150px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl lg:grid-cols-12 font-body">
        {/* Left Column */}
        <div className="hidden lg:col-span-7 lg:flex flex-col justify-between p-12 xl:p-16 border-r border-[#1F2025]">
          {/* Seal mark + wordmark — identical to signup for continuity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-sm border border-[#C9A24B]/50">
                <div className="absolute inset-[3px] border border-[#C9A24B]/30 rounded-[1px]" />
                <span className="font-data text-[11px] text-[#C9A24B]">IA</span>
              </div>
              <span className="font-data text-[11px] tracking-[0.2em] text-[#8B8A85] uppercase">
                Interview / AI
              </span>
            </div>
            <span className="font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase">
              Assessment Engine
            </span>
          </div>

          {/* Headline block */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <h1 className="font-display text-[2.75rem] xl:text-[3.1rem] font-medium leading-[1.08] text-[#F5F3EE]">
                Your file's exactly
                <br />
                where you left it.
              </h1>
              <p className="font-body text-sm text-[#8B8A85] leading-relaxed max-w-md">
                Sign back in to see your trend, pick up your next round, and
                keep building on the last session's scorecard.
              </p>
            </div>

            {/* Loop stepper — what's next in your loop */}
            <div>
              <p className="font-data text-[10px] tracking-[0.15em] text-[#5C5B57] uppercase mb-3">
                Your next round
              </p>
              <div className="flex items-center">
                {LOOP_STAGES.map((stage, i) => (
                  <div key={stage} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          i === NEXT_STAGE_INDEX
                            ? "h-1.5 w-1.5 rounded-full bg-[#C9A24B]"
                            : i < NEXT_STAGE_INDEX
                              ? "h-1.5 w-1.5 rounded-full bg-[#3F5B44]"
                              : "h-1.5 w-1.5 rounded-full border border-[#3A3B41]"
                        }
                      />
                      <span
                        className={
                          i === NEXT_STAGE_INDEX
                            ? "font-data text-[10.5px] tracking-wide text-[#F5F3EE]"
                            : "font-data text-[10.5px] tracking-wide text-[#5C5B57]"
                        }
                      >
                        {stage}
                      </span>
                    </div>
                    {i < LOOP_STAGES.length - 1 && (
                      <span className="mx-3 h-px w-8 bg-[#2A2B31]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Signature element: candidate file, reopened */}
            <div className="pl-4">
              {/* Folder tab */}
              <div className="ml-3 w-16 rounded-t-sm border border-b-0 border-[#26272C] bg-[#161718] px-2 pt-1.5">
                <span className="font-data text-[9px] tracking-[0.15em] text-[#5C5B57] uppercase">
                  File
                </span>
              </div>

              <div className="relative overflow-hidden rounded-lg rounded-tl-none border border-[#26272C] bg-[#161718] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-[#26272C] px-4 py-2.5">
                  <span className="font-data text-[10px] tracking-[0.15em] text-[#8B8A85] uppercase">
                    Candidate File — Reopened
                  </span>
                  <span className="font-data text-[10px] text-[#5C5B57]">
                    ID #4128
                  </span>
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-end justify-between gap-3 h-20">
                    {TREND.map((point, i) => (
                      <div key={point.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                        <span
                          className={
                            i === TREND.length - 1
                              ? "font-data text-[10px] text-[#C9A24B]"
                              : "font-data text-[10px] text-[#5C5B57]"
                          }
                        >
                          {point.value.toFixed(1)}
                        </span>
                        <div
                          className={
                            i === TREND.length - 1
                              ? "grow-bar w-full rounded-sm bg-[#C9A24B]"
                              : "grow-bar w-full rounded-sm bg-[#3A3B41]"
                          }
                          style={{
                            height: `${point.value * 6}px`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                        <span className="font-data text-[9px] text-[#5C5B57]">
                          {point.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#26272C] px-4 py-3">
                  <span className="font-body text-[11px] text-[#5C5B57] italic">
                    Average up 1.4 pts over your last 3 sessions.
                  </span>
                  <div className="shrink-0 -rotate-6 rounded-sm border-2 border-[#3F5B44] px-2.5 py-1">
                    <span className="font-data text-[10px] tracking-[0.15em] text-[#5E8869] font-medium">
                      ON TRACK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Continuity chips */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg border border-[#26272C] bg-[#161718] p-3">
                <p className="font-body text-sm font-semibold text-[#F5F3EE]">Auto-saved</p>
                <p className="font-body text-[11px] text-[#8B8A85]">Every session history kept</p>
              </div>
              <div className="rounded-lg border border-[#26272C] bg-[#161718] p-3">
                <p className="font-body text-sm font-semibold text-[#F5F3EE]">Trend-tracked</p>
                <p className="font-body text-[11px] text-[#8B8A85]">See progress round to round</p>
              </div>
              <div className="rounded-lg border border-[#26272C] bg-[#161718] p-3">
                <p className="font-body text-sm font-semibold text-[#F5F3EE]">Picks up fast</p>
                <p className="font-body text-[11px] text-[#8B8A85]">Resume right where you stopped</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between font-data text-[10.5px] tracking-wide text-[#5C5B57]">
            <span>© {new Date().getFullYear()} Interview / AI</span>
            <span>Every scorecard stays private to you</span>
          </div>
        </div>

        {/* Right Column: form */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm space-y-6">
            <LoginForm />

            <p className="text-center text-xs text-[#8B8A85] font-body">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-[#C9A24B] hover:text-[#DAB768] hover:underline">
                Create one now →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}