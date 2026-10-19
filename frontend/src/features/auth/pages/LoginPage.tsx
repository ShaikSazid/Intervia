import { LoginForm } from "../components/LoginForm";
import { Link } from "react-router-dom";

function LogoMark({ className = "size-12" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F3C86A] via-[#E5B858] to-[#CCA043] shadow-lg shadow-[#E5B858]/30 ring-1 ring-white/20 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="#0F1014" strokeWidth={2} strokeLinecap="round">
        <path d="M4.5 10.5v3M8.25 8v8M12 11v8.5M15.75 8v8M19.5 10.5v3" />
        <circle cx="12" cy="6.2" r="1.35" fill="#0F1014" stroke="none" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
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

        @media (prefers-reduced-motion: reduce) {
          .blob-a, .blob-b, .pop-in, .pop-in-2 { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob-a absolute -top-40 left-1/4 h-[460px] w-[640px] rounded-full bg-[#C9A24B]/20 blur-[110px]" />
        <div className="blob-b absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-[#3B664B]/30 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative flex h-full flex-col items-center overflow-y-auto p-6">
        <div className="m-auto w-full max-w-sm space-y-6 py-4">
          <div className="pop-in flex flex-col items-center gap-3">
            <LogoMark />

            <span className="font-display text-2xl font-semibold tracking-tight text-[#F7F5F0]">
              Intervia
            </span>
          </div>

          <div className="pop-in-2">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-[#8B8D97]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#E5B858] transition-colors hover:text-[#FFD375] hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}