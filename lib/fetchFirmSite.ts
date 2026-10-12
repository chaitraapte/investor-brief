import * as cheerio from "cheerio";
import { SearchResultItem } from "./types";

const FETCH_TIMEOUT_MS = 8000;

function guessFirmUrl(searchResults: SearchResultItem[], firmName: string): string | null {
  const nameLower = firmName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const r of searchResults) {
    try {
      const url = new URL(r.url);
      const host = url.hostname.replace(/^www\./, "");
      if (
        host.includes("linkedin.com") ||
        host.includes("crunchbase.com") ||
        host.includes("pitchbook.com")
      ) {
        continue;
      }
      const hostCollapsed = host.replace(/[^a-z0-9]/g, "");
      if (hostCollapsed.includes(nameLower.slice(0, Math.min(nameLower.length, 6)))) {
        return `${url.protocol}//${url.hostname}`;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchFirmSiteText(
  searchResults: SearchResultItem[],
  firmName: string
): Promise<{ url: string; content: string } | null> {
  const baseUrl = guessFirmUrl(searchResults, firmName);
  if (!baseUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(baseUrl, { signal: controller.signal });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, nav, footer, noscript").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
    if (!text) return null;
    return { url: baseUrl, content: text };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
