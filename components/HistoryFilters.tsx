"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "investor", label: "Investor name (A–Z)" },
  { value: "firm", label: "Firm name (A–Z)" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All briefs" },
  { value: "shared", label: "Shared only" },
  { value: "unshared", label: "Not shared" },
];

export default function HistoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      updateParam("q", query);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-5">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" strokeWidth={2} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by investor or firm…"
          className="w-full rounded-xl border border-card-border bg-card pl-9 pr-3 py-2 text-[13.5px] text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        />
      </div>

      <select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-xl border border-card-border bg-card px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("filter") ?? "all"}
        onChange={(e) => updateParam("filter", e.target.value)}
        className="rounded-xl border border-card-border bg-card px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
