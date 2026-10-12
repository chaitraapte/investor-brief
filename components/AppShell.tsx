"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import WelcomePage from "@/components/WelcomePage";

export default function AppShell() {
  const searchParams = useSearchParams();
  const regenInvestor = searchParams.get("investor") ?? undefined;
  const regenFirm = searchParams.get("firm") ?? undefined;
  const [showWelcome, setShowWelcome] = useState(!regenInvestor);

  useEffect(() => {
    if (regenInvestor) return;
    try {
      if (sessionStorage.getItem("ib_welcomed")) {
        setShowWelcome(false);
      }
    } catch {
      // sessionStorage may be unavailable; default to showing welcome
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStart() {
    try {
      sessionStorage.setItem("ib_welcomed", "1");
    } catch {
      // ignore
    }
    setShowWelcome(false);
  }

  if (showWelcome) {
    return <WelcomePage onStart={handleStart} />;
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl">
        <Header />
      </div>
      <Dashboard autoInvestorName={regenInvestor} autoFirmName={regenFirm} />
    </div>
  );
}
