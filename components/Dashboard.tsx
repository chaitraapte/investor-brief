"use client";

import { useEffect, useRef, useState } from "react";
import InputForm from "@/components/InputForm";
import ProgressView from "@/components/ProgressView";
import BriefResults from "@/components/BriefResults";
import { Brief, ProgressStep } from "@/lib/types";

type AppState = "input" | "working" | "results";

type Props = {
  autoInvestorName?: string;
  autoFirmName?: string;
};

export default function Dashboard({ autoInvestorName, autoFirmName }: Props) {
  const [appState, setAppState] = useState<AppState>("input");
  const [investorName, setInvestorName] = useState(autoInvestorName ?? "");
  const [firmName, setFirmName] = useState(autoFirmName ?? "");
  const [progressStep, setProgressStep] = useState<ProgressStep>("portfolio");
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefId, setBriefId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const inFlight = useRef(false);

  useEffect(() => {
    if (autoInvestorName && autoFirmName) {
      handleSubmit(autoInvestorName, autoFirmName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(investor: string, firm: string) {
    if (inFlight.current) return;
    inFlight.current = true;

    setInvestorName(investor);
    setFirmName(firm);
    setError(null);
    setProgressStep("portfolio");
    setAppState("working");

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorName: investor,
          firmName: firm,
        }),
      });

      if (res.status === 401) {
        setError("Your session expired. Please sign in again.");
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("The server could not start generating your brief.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const eventMatch = chunk.match(/^event: (.+)$/m);
          const dataMatch = chunk.match(/^data: (.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const eventName = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (eventName === "progress") {
            setProgressStep(data.step as ProgressStep);
          } else if (eventName === "done") {
            setBrief(data.brief as Brief);
            setBriefId(data.id as string | null);
            setGeneratedAt(
              new Date(data.createdAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            );
            setProgressStep("done");
            setAppState("results");
          } else if (eventName === "error") {
            setError(data.message as string);
          }
        }
      }
    } catch {
      setError("We couldn't reach the research service. Please check your connection and try again.");
    } finally {
      inFlight.current = false;
    }
  }

  function handleTryAgain() {
    setError(null);
    setAppState("input");
  }

  function handleNewBrief() {
    setInvestorName("");
    setFirmName("");
    setBrief(null);
    setBriefId(null);
    setError(null);
    setAppState("input");
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {appState === "input" && (
        <InputForm
          initialInvestorName={investorName}
          initialFirmName={firmName}
          onSubmit={handleSubmit}
        />
      )}
      {appState === "working" && (
        <ProgressView currentStep={progressStep} error={error} onTryAgain={handleTryAgain} />
      )}
      {appState === "results" && brief && (
        <BriefResults
          brief={brief}
          investorName={investorName}
          firmName={firmName}
          generatedAt={generatedAt}
          onNewBrief={handleNewBrief}
          briefId={briefId ?? undefined}
        />
      )}
    </div>
  );
}
