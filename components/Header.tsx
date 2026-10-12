import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex items-center justify-between mb-10">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-accent">
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Investor Brief
        </span>
      </Link>

      <Link
        href="/history"
        className="btn-press text-[13px] font-medium text-foreground rounded-full border border-card-border px-4 py-1.5 hover:border-card-border-strong transition-colors"
      >
        History
      </Link>
    </div>
  );
}
