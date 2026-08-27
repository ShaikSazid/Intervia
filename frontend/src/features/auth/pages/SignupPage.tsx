import SignupForm from "../components/SignupForm";
import { Link } from "react-router-dom";

const LOOP_STAGES = ["Phone Screen", "Technical", "System Design", "Behavioral"];
const ACTIVE_STAGE_INDEX = 2;

const SCORES = [
  { label: "System Design", value: 8.4 },
  { label: "Debugging Depth", value: 7.2 },
  { label: "Communication", value: 9.1 },
  { label: "Trade-off Reasoning", value: 8.0 },
];

export default function SignupPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#111214] text-[#EDEAE4] antialiased selection:bg-[#C9A24B]/30 selection:text-[#C9A24B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Newsreader', ui-serif, Georgia, serif; font-style: italic; }
        .font-body { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
        .font-data { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

        @keyframes fillBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .fill-bar { transform-origin: left; animation: fillBar 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Faint structural grid, restrained */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1c1d21_1px,transparent_1px),linear-gradient(to_bottom,#1c1d21_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_55%,transparent_100%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-[#C9A24B]/[0.05] blur-[150px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl lg:grid-cols-12 font-body">
        {/* Left Column */}
        <div className="hidden lg:col-span-7 lg:flex flex-col justify-between p-12 xl:p-16 border-r border-[#1F2025]">
          {/* Seal mark + wordmark */}
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
                Know your score before
                <br />
                the real panel does.
              </h1>
              <p className="font-body text-sm text-[#8B8A85] leading-relaxed max-w-md">
                A structured mock interview, evaluated competency by
                competency — not a pass/fail guess, a written scorecard you
                keep.
              </p>
            </div>

            {/* Interview loop stepper — a real sequence, so numbering earns its place */}
            <div className="flex items-center">
              {LOOP_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        i <= ACTIVE_STAGE_INDEX
                          ? "h-1.5 w-1.5 rounded-full bg-[#C9A24B]"
                          : "h-1.5 w-1.5 rounded-full border border-[#3A3B41]"
                      }
                    />
                    <span
                      className={
                        i === ACTIVE_STAGE_INDEX
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

            {/* Signature element: candidate scorecard */}
            <div className="relative overflow-hidden rounded-lg border border-[#26272C] bg-[#161718] shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-[#26272C] px-4 py-2.5">
                <span className="font-data text-[10px] tracking-[0.15em] text-[#8B8A85] uppercase">
                  Internal — Candidate Scorecard
                </span>
                <span className="font-data text-[10px] text-[#5C5B57]">
                  SESSION #4128
                </span>
              </div>

              <div className="px-4 py-4 space-y-3">
                {SCORES.map((row, i) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="font-body text-[12px] text-[#B8B6B0] w-[132px] shrink-0">
                      {row.label}
                    </span>
                    <div className="relative h-1.5 flex-1 rounded-full bg-[#232428] overflow-hidden">
                      <div
                        className="fill-bar absolute inset-y-0 left-0 rounded-full bg-[#C9A24B]"
                        style={{
                          width: `${row.value * 10}%`,
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    </div>
                    <span className="font-data text-[11px] text-[#C9A24B] w-8 text-right">
                      {row.value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Verdict stamp */}
              <div className="flex items-center justify-between border-t border-[#26272C] px-4 py-3">
                <span className="font-body text-[11px] text-[#5C5B57] italic">
                  Auto-generated at session close — yours to keep.
                </span>
                <div className="shrink-0 -rotate-6 rounded-sm border-2 border-[#3F5B44] px-2.5 py-1">
                  <span className="font-data text-[10px] tracking-[0.15em] text-[#5E8869] font-medium">
                    STRONG HIRE
                  </span>
                </div>
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
            <SignupForm />

            <p className="text-center text-xs text-[#8B8A85] font-body">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[#C9A24B] hover:text-[#DAB768] hover:underline">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}