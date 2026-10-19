import SignupForm from "../components/SignupForm";
import { Link } from "react-router-dom";

const SCORES = [
  { label: "System Design", value: 8.4 },
  { label: "Debugging Depth", value: 7.2 },
  { label: "Communication", value: 9.1 },
  { label: "Trade-off Reasoning", value: 8.0 },
];

const cardClass =
  "relative overflow-hidden rounded-3xl border border-white/10 bg-[#14151B]/90 text-[#EDEAE4] shadow-2xl shadow-black/50 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#E5B858]/70 before:to-transparent";

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

function Chip({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-sm font-semibold text-[#F7F5F0]">{title}</p>
      <p className="mt-0.5 text-xs text-[#8B8D97]">{text}</p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0D0E12] font-body text-[#EDEAE4] antialiased selection:bg-[#E5B858]/30 selection:text-[#E5B858]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .font-data { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

        @keyframes floatA { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 30px) scale(1.1); } }
        @keyframes floatB { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-40px, -30px) scale(1.12); } }
        .blob-a { animation: floatA 14s ease-in-out infinite; }
        .blob-b { animation: floatB 17s ease-in-out infinite; }

        @keyframes popIn { 0% { opacity: 0; transform: translateY(10px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .pop-in { animation: popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .pop-in-2 { animation: popIn 0.5s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .pop-in-3 { animation: popIn 0.5s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

        @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .grow-bar { transform-origin: bottom; animation: growBar 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes fillBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .fill-bar { transform-origin: left; animation: fillBar 1.1s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .blob-a, .blob-b, .pop-in, .pop-in-2, .pop-in-3, .grow-bar, .fill-bar { animation: none; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob-a absolute -top-40 left-1/4 h-[460px] w-[640px] rounded-full bg-[#C9A24B]/20 blur-[110px]" />
        <div className="blob-b absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-[#3B664B]/30 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto grid h-full max-w-7xl lg:grid-cols-12">
        {/* Left column */}
        <div className="hidden min-h-0 flex-col justify-between overflow-y-auto border-r border-white/[0.06] p-12 lg:col-span-7 lg:flex xl:p-16">
          <BrandMark />

          <div className="my-8 max-w-lg space-y-7">
            <div className="pop-in space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-[#F7F5F0] xl:text-5xl">
                Know your score before the real panel does.
              </h1>

              <p className="max-w-md text-base leading-relaxed text-[#8B8D97]">
                Talk through a real mock interview and get a written
                scorecard you can keep.
              </p>
            </div>

            {/* Scorecard preview */}
            <div className={`pop-in-2 ${cardClass}`}>
              <div className="flex items-center justify-between px-5 pb-1 pt-5">
                <span className="text-sm font-semibold text-[#F7F5F0]">
                  Your scorecard
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#54BD78]/30 bg-[#54BD78]/10 px-2.5 py-0.5 text-xs font-medium text-[#73CE92]">
                  <span className="size-1.5 rounded-full bg-[#54BD78]" />
                  Strong hire
                </span>
              </div>

              <div className="space-y-3.5 px-5 py-4">
                {SCORES.map((row, i) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-[140px] shrink-0 text-sm text-[#B8B6B0]">
                      {row.label}
                    </span>

                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="fill-bar absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#CCA043] to-[#F3C86A]"
                        style={{
                          width: `${row.value * 10}%`,
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-sm font-semibold text-[#E5B858]">
                      {row.value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] px-5 py-3">
                <span className="text-xs text-[#8B8D97]">
                  Created when your session ends. Yours to keep.
                </span>
              </div>
            </div>

            <div className="pop-in-3 grid grid-cols-3 gap-3 [@media(max-height:780px)]:hidden">
              <Chip title="Voice interview" text="Speak naturally" />
              <Chip title="Adaptive" text="Built from your resume" />
              <Chip title="Scorecard" text="Clear, written feedback" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5C5B57]">
            <span>© {new Date().getFullYear()} Intervia</span>
            <span>Every scorecard stays private to you</span>
          </div>
        </div>

        {/* Right column: form */}
        <div className="col-span-12 flex min-h-0 flex-col items-center overflow-y-auto p-6 sm:p-10 lg:col-span-5 lg:p-12">
          <div className="m-auto w-full max-w-sm space-y-6">
            <div className="flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <div className="pop-in-2">
              <SignupForm />
            </div>

            <p className="text-center text-sm text-[#8B8D97]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#E5B858] transition-colors hover:text-[#FFD375] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}