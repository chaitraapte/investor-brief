"use client";

import { Check, Loader2, AlertTriangle } from "lucide-react";
import { ProgressStep } from "@/lib/types";

const STEPS: { key: ProgressStep; label: string }[] = [
  { key: "portfolio", label: "Searching recent portfolio activity" },
  { key: "thesis", label: "Checking investment thesis" },
  { key: "news", label: "Scanning for recent news and context" },
  { key: "writing", label: "Writing your brief" },
];

const ORDER: ProgressStep[] = ["portfolio", "thesis", "news", "writing", "done"];

type Props = {
  currentStep: ProgressStep;
  error: string | null;
  onTryAgain: () => void;
};

export default function ProgressView({ currentStep, error, onTryAgain }: Props) {
  const currentIndex = ORDER.indexOf(currentStep);
  const percent = Math.min(100, Math.round((currentIndex / (STEPS.length - 1)) * 100));

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto rounded-2xl bg-card border border-card-border p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="text-foreground font-semibold mb-1.5">We hit a snag.</p>
        <p className="text-muted text-[13.5px] mb-6 leading-relaxed">{error}</p>
        <button
          onClick={onTryAgain}
          className="btn-press rounded-xl bg-foreground text-background px-5 py-2.5 text-[14px] font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-card border border-card-border p-8">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Putting your brief together</h2>
        <span className="text-[13px] font-medium text-accent bg-accent-soft rounded-full px-2.5 py-1">
          {percent}%
        </span>
      </div>
      <p className="text-muted text-[13.5px] mb-7 leading-relaxed">
        This pulls from live sources, so it usually takes 20–90 seconds.
      </p>

      <div className="h-1.5 w-full rounded-full bg-background overflow-hidden mb-7">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-4">
        {STEPS.map((step) => {
          const stepIndex = ORDER.indexOf(step.key);
          const state =
            stepIndex < currentIndex
              ? "done"
              : stepIndex === currentIndex
              ? "active"
              : "pending";

          return (
            <li key={step.key} className="flex items-center gap-3">
              <span
                className={
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full " +
                  (state === "done"
                    ? "bg-success text-white"
                    : state === "active"
                    ? "bg-accent text-accent-foreground"
                    : "bg-background text-muted")
                }
              >
                {state === "done" ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : state === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted/50" />
                )}
              </span>
              <span
                className={
                  "text-[13.5px] " +
                  (state === "pending" ? "text-muted" : "text-foreground")
                }
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
