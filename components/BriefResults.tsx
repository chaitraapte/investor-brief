"use client";

import { useState } from "react";
import {
  TrendingUp,
  Target,
  ShieldAlert,
  Lightbulb,
  Clock,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Brief, BriefSection } from "@/lib/types";

type Props = {
  brief: Brief;
  investorName: string;
  firmName: string;
  generatedAt: string;
  onNewBrief?: () => void;
  briefId?: string;
  initialShareSlug?: string | null;
  readOnly?: boolean;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.08-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.08-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5-.17-.01-.37-.01-.56-.01-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.45s1.05 2.84 1.2 3.04c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.97-1.39.25-.68.25-1.27.17-1.39-.07-.12-.26-.2-.55-.34z"/>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.37 5.07L2 22l5.17-1.46a9.84 9.84 0 0 0 4.87 1.3h.01c5.46 0 9.9-4.45 9.9-9.91A9.84 9.84 0 0 0 12.04 2m0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.07.87.82-3-.2-.31a8.18 8.18 0 0 1-1.27-4.44c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.17 8.17 0 0 1 2.41 5.83c0 4.55-3.71 8.2-8.28 8.2"/>
    </svg>
  );
}

function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Section({
  icon: Icon,
  title,
  section,
  emptyText,
}: {
  icon: React.ElementType;
  title: string;
  section: BriefSection;
  emptyText: string;
}) {
  return (
    <div className="border-b border-card-border pb-6 mb-6 last:border-b-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
          {title}
        </h3>
      </div>
      {section ? (
        <>
          <p className="text-foreground text-[14.5px] leading-relaxed">{section.summary}</p>
          {section.sources.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {section.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs rounded-full bg-background text-muted border border-card-border px-2.5 py-1 hover:border-accent hover:text-accent transition-colors"
                >
                  {sourceLabel(s.url) || s.label}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-muted italic text-[13.5px]">{emptyText}</p>
      )}
    </div>
  );
}

function buildPlainText(brief: Brief, investorName: string, firmName: string): string {
  const lines: string[] = [];
  lines.push(`Investor Brief: ${investorName} (${firmName})`);
  lines.push("");

  lines.push("RECENT PORTFOLIO ACTIVITY (last 90 days)");
  lines.push(brief.portfolioActivity?.summary ?? "No recent activity found in public sources.");
  lines.push("");

  lines.push("INVESTMENT THESIS");
  lines.push(brief.investmentThesis?.summary ?? "No investment thesis found in public sources.");
  lines.push("");

  lines.push("CONTEXT TO BE AWARE OF");
  lines.push(brief.context?.summary ?? "No additional context found in public sources.");
  lines.push("");

  lines.push("TALKING POINTS FOR YOUR MEETING");
  brief.talkingPoints.forEach((tp, i) => lines.push(`${i + 1}. ${tp}`));

  return lines.join("\n");
}

export default function BriefResults({
  brief,
  investorName,
  firmName,
  generatedAt,
  onNewBrief,
  briefId,
  initialShareSlug,
  readOnly = false,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [shareSlug, setShareSlug] = useState(initialShareSlug ?? null);
  const [sharing, setSharing] = useState(false);

  async function handleCopy() {
    const text = buildPlainText(brief, investorName, firmName);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable; silently ignore
    }
  }

  function openWhatsApp(slug: string) {
    const url = `${window.location.origin}/share/${slug}`;
    const message = `Investor brief: ${investorName} (${firmName}) — ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function handleShareToWhatsApp() {
    if (!briefId) return;
    if (shareSlug) {
      openWhatsApp(shareSlug);
      return;
    }

    setSharing(true);
    try {
      const res = await fetch(`/api/brief/${briefId}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setShareSlug(data.shareSlug);
        openWhatsApp(data.shareSlug);
      }
    } finally {
      setSharing(false);
    }
  }

  function handleNewBrief() {
    if (onNewBrief) {
      onNewBrief();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {readOnly && (
        <div className="mb-5 rounded-xl bg-accent-soft border border-accent/30 px-4 py-2.5 text-[13px] text-accent">
          Shared briefing — read-only
        </div>
      )}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">{investorName}</h2>
          <p className="text-muted text-[13.5px]">{firmName}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="btn-press flex items-center gap-1.5 text-[13px] rounded-xl border border-card-border bg-card px-3 py-1.5 text-foreground hover:border-accent transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          {!readOnly && briefId && (
            <button
              onClick={handleShareToWhatsApp}
              disabled={sharing}
              title="Share via WhatsApp"
              aria-label="Share via WhatsApp"
              className="btn-press flex items-center justify-center h-[31px] w-[31px] rounded-xl border border-card-border bg-card text-foreground hover:border-accent hover:text-[#25D366] transition-colors disabled:opacity-50"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </button>
          )}
          {!readOnly && (
            <button
              onClick={handleNewBrief}
              className="btn-press flex items-center gap-1.5 text-[13px] rounded-xl bg-foreground text-background px-3 py-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              New Brief
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-muted text-xs mb-5">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
        Generated {generatedAt} from live sources
      </div>

      {brief.warnings && brief.warnings.length > 0 && (
        <div className="mb-5 rounded-xl bg-accent-soft border border-accent/30 px-4 py-3 text-sm text-accent">
          {brief.warnings.join(" ")}
        </div>
      )}

      <div className="rounded-2xl border border-card-border bg-card p-7">
        <Section
          icon={TrendingUp}
          title="Recent Portfolio Activity (last 90 days)"
          section={brief.portfolioActivity}
          emptyText="No recent activity found in public sources."
        />
        <Section
          icon={Target}
          title="Investment Thesis"
          section={brief.investmentThesis}
          emptyText="No investment thesis found in public sources."
        />
        <Section
          icon={ShieldAlert}
          title="Context to Be Aware Of"
          section={brief.context}
          emptyText="No additional context found in public sources."
        />

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.25} />
            </span>
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              Talking Points for Your Meeting
            </h3>
          </div>
          {brief.talkingPoints.length > 0 ? (
            <ol className="space-y-2.5">
              {brief.talkingPoints.map((tp, i) => (
                <li key={i} className="flex gap-2.5 text-foreground text-[14.5px] leading-relaxed">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-card-border text-[11px] font-medium text-muted mt-0.5">
                    {i + 1}
                  </span>
                  {tp}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted italic text-[13.5px]">No talking points could be generated.</p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted/70 mt-5">
        Powered by Gemini Flash · Live search via Tavily
      </p>
    </div>
  );
}
