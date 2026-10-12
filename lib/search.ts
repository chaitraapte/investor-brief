import { SearchResponse, SearchResultItem } from "./types";

const TAVILY_URL = "https://api.tavily.com/search";
const SERPER_URL = "https://google.serper.dev/search";

async function tavilySearch(query: string, apiKey: string): Promise<SearchResultItem[]> {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      include_answer: true,
      max_results: 5,
      days: 90,
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily request failed with status ${res.status}`);
  }

  const data = await res.json();
  const results: SearchResultItem[] = [];

  if (data.answer) {
    results.push({
      title: "Tavily summary",
      url: data.results?.[0]?.url ?? "",
      content: data.answer,
    });
  }

  for (const r of data.results ?? []) {
    results.push({
      title: r.title ?? r.url,
      url: r.url,
      content: r.content ?? r.raw_content ?? "",
    });
  }

  return results;
}

async function serperSearch(query: string, apiKey: string): Promise<SearchResultItem[]> {
  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!res.ok) {
    throw new Error(`Serper request failed with status ${res.status}`);
  }

  const data = await res.json();
  const results: SearchResultItem[] = [];

  if (data.answerBox?.snippet) {
    results.push({
      title: data.answerBox.title ?? "Answer",
      url: data.answerBox.link ?? "",
      content: data.answerBox.snippet,
    });
  }

  for (const r of data.organic ?? []) {
    results.push({
      title: r.title ?? r.link,
      url: r.link,
      content: r.snippet ?? "",
    });
  }

  return results;
}

export async function runSearchQueries(queries: string[]): Promise<SearchResponse> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const serperKey = process.env.SERPER_API_KEY;

  if (tavilyKey) {
    try {
      const resultsPerQuery = await Promise.all(
        queries.map((q) => tavilySearch(q, tavilyKey))
      );
      const results = resultsPerQuery.flat();
      if (results.length > 0) {
        return { results, provider: "tavily" };
      }
    } catch {
      // fall through to Serper
    }
  }

  if (serperKey) {
    try {
      const resultsPerQuery = await Promise.all(
        queries.map((q) => serperSearch(q, serperKey))
      );
      const results = resultsPerQuery.flat();
      return { results, provider: "serper" };
    } catch {
      // fall through to empty result
    }
  }

  return { results: [], provider: "none" };
}
