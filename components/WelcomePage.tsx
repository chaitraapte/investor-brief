"use client";

import { Sparkles, ArrowRight } from "lucide-react";

type Props = {
  onStart: () => void;
};

export default function WelcomePage({ onStart }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <div className="welcome-rise flex flex-col items-center text-center max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-accent mb-8">
          <Sparkles className="h-7 w-7" strokeWidth={2} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4">
          Investor Brief
        </p>

        <h1 className="text-4xl font-semibold text-foreground tracking-tight leading-[1.1] mb-4">
          Walk into every meeting ready.
        </h1>

        <p className="text-muted text-[15px] leading-relaxed mb-10">
          Live-sourced research on any investor, synthesized into a brief in
          under a minute. No sign-in, no setup.
        </p>

        <button
          onClick={onStart}
          className="btn-press group flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-6 py-3 text-[14px] font-medium shadow-[0_8px_24px_rgba(232,73,29,0.25)]"
        >
          Get Started
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
