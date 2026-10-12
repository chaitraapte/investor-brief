"use client";

import { useState } from "react";
import { User, Building2, ArrowRight } from "lucide-react";

type Props = {
  initialInvestorName?: string;
  initialFirmName?: string;
  onSubmit: (investorName: string, firmName: string) => void;
};

export default function InputForm({ initialInvestorName = "", initialFirmName = "", onSubmit }: Props) {
  const [investorName, setInvestorName] = useState(initialInvestorName);
  const [firmName, setFirmName] = useState(initialFirmName);
  const [errors, setErrors] = useState<{ investorName?: string; firmName?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: { investorName?: string; firmName?: string } = {};
    if (!investorName.trim()) nextErrors.investorName = "Investor name is required.";
    if (!firmName.trim()) nextErrors.firmName = "Firm name is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(investorName.trim(), firmName.trim());
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-card border border-card-border p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-1.5 tracking-tight">
        Get briefed before you walk in.
      </h1>
      <p className="text-muted mb-8 text-[13.5px] leading-relaxed">
        Enter who you&apos;re meeting and we&apos;ll pull together a live briefing from
        real-time sources.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="investorName" className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Investor Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" strokeWidth={2} />
            <input
              id="investorName"
              type="text"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-background/60 pl-9 pr-3 py-2.5 text-[14px] text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="e.g. Sarah Chen"
            />
          </div>
          {errors.investorName && (
            <p className="mt-1.5 text-xs text-danger">{errors.investorName}</p>
          )}
        </div>

        <div>
          <label htmlFor="firmName" className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Firm Name
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" strokeWidth={2} />
            <input
              id="firmName"
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-background/60 pl-9 pr-3 py-2.5 text-[14px] text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="e.g. Acme Ventures"
            />
          </div>
          {errors.firmName && (
            <p className="mt-1.5 text-xs text-danger">{errors.firmName}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-press group w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground py-2.5 text-[14px] font-medium"
        >
          Generate Brief
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
