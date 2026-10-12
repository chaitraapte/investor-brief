import { NextRequest } from "next/server";
import { runSearchQueries } from "@/lib/search";
import { fetchFirmSiteText } from "@/lib/fetchFirmSite";
import { generateBrief } from "@/lib/gemini";
import { Brief, SearchResultItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 90;

const ROUTE_TIMEOUT_MS = 85000;

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function buildSourceBlob(results: SearchResultItem[], firmSite: { url: string; content: string } | null): string {
  const parts: string[] = [];
  for (const r of results) {
    if (!r.content) continue;
    parts.push(`[SOURCE: ${r.url}]\n${r.content.slice(0, 1500)}`);
  }
  if (firmSite) {
    parts.push(`[SOURCE: ${firmSite.url}]\n${firmSite.content}`);
  }
  return parts.join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const body = await req.json().catch(() => null);
  const investorName = typeof body?.investorName === "string" ? body.investorName.trim() : "";
  const firmName = typeof body?.firmName === "string" ? body.firmName.trim() : "";

  if (!investorName || !firmName) {
    return new Response(
      JSON.stringify({ error: "Investor name and firm name are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(sseEvent(event, data)));
        } catch {
          // controller may already be closed
        }
      };

      const overallTimeout = setTimeout(() => {
        send("error", { message: "The research process took too long and timed out." });
        controller.close();
      }, ROUTE_TIMEOUT_MS);

      try {
        send("progress", { step: "portfolio", message: "Searching recent portfolio activity…" });
        send("progress", { step: "thesis", message: "Checking investment thesis…" });

        const queries = [
          `"${firmName}" portfolio companies 2026`,
          `"${investorName}" "${firmName}" investment thesis`,
          `"${firmName}" new investment OR exit 2026`,
          `"${investorName}" interview OR controversy OR pivot`,
        ];

        const searchPromise = runSearchQueries(queries);

        send("progress", { step: "news", message: "Scanning for recent news and context…" });

        const searchResponse = await searchPromise;

        let firmSite = null;
        try {
          firmSite = await fetchFirmSiteText(searchResponse.results, firmName);
        } catch {
          firmSite = null;
        }

        send("progress", { step: "writing", message: "Writing your brief…" });

        const sourceBlob = buildSourceBlob(searchResponse.results, firmSite);

        let brief: Brief;
        try {
          brief = await generateBrief(investorName, firmName, sourceBlob);
        } catch {
          send("error", { message: "We couldn't generate the brief right now. Please try again." });
          clearTimeout(overallTimeout);
          controller.close();
          return;
        }

        if (searchResponse.provider === "none") {
          brief.warnings = ["Live search was unavailable, so this brief may be sparse."];
        }

        const { data: row, error: insertError } = await supabase
          .from("briefs")
          .insert({
            investor_name: investorName,
            firm_name: firmName,
            result: brief,
          })
          .select("id, created_at")
          .single();

        if (insertError) {
          send("done", { brief, id: null, createdAt: new Date().toISOString() });
        } else {
          send("done", { brief, id: row.id, createdAt: row.created_at });
        }

        clearTimeout(overallTimeout);
        controller.close();
      } catch {
        send("error", { message: "Something went wrong while generating your brief. Please try again." });
        clearTimeout(overallTimeout);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
