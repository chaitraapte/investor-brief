import Link from "next/link";
import Header from "@/components/Header";
import HistoryFilters from "@/components/HistoryFilters";
import { createClient } from "@/lib/supabase/server";
import { FileText, ArrowLeft, RotateCcw } from "lucide-react";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; filter?: string }>;
}) {
  const { q, sort, filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("briefs")
    .select("id, investor_name, firm_name, created_at, is_shared");

  if (q) {
    query = query.or(`investor_name.ilike.%${q}%,firm_name.ilike.%${q}%`);
  }

  if (filter === "shared") {
    query = query.eq("is_shared", true);
  } else if (filter === "unshared") {
    query = query.eq("is_shared", false);
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "investor":
      query = query.order("investor_name", { ascending: true });
      break;
    case "firm":
      query = query.order("firm_name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: briefs } = await query.limit(100);

  return (
    <div className="flex flex-col flex-1 items-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl">
        <Header />

        <Link
          href="/"
          className="btn-press inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back
        </Link>

        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1">
          Your briefs
        </h1>
        <p className="text-muted text-[13.5px] mb-6">
          Every brief generated, searchable by investor or firm.
        </p>

        <HistoryFilters />

        {!briefs || briefs.length === 0 ? (
          <div className="rounded-2xl border border-card-border bg-card p-8 text-center">
            <p className="text-muted text-[13.5px]">
              No briefs match.{" "}
              <Link href="/" className="text-accent underline">
                Generate one
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {briefs.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-2 rounded-xl border border-card-border bg-card px-4 py-3 hover:border-accent transition-colors"
              >
                <Link
                  href={`/brief/${b.id}`}
                  className="flex flex-1 items-center justify-between gap-3 min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <FileText className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">
                        {b.investor_name}
                      </p>
                      <p className="text-xs text-muted truncate">{b.firm_name}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {b.is_shared && (
                      <span className="text-xs text-accent">Shared</span>
                    )}
                    <p className="text-xs text-muted">
                      {new Date(b.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/?investor=${encodeURIComponent(b.investor_name)}&firm=${encodeURIComponent(b.firm_name)}`}
                  title="Regenerate brief"
                  aria-label="Regenerate brief"
                  className="btn-press shrink-0 flex items-center justify-center h-8 w-8 rounded-lg border border-card-border text-muted hover:border-accent hover:text-accent transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
