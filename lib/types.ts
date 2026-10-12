export type Source = {
  label: string;
  url: string;
};

export type BriefSection = {
  summary: string;
  sources: Source[];
} | null;

export type Brief = {
  portfolioActivity: BriefSection;
  investmentThesis: BriefSection;
  context: BriefSection;
  talkingPoints: string[];
  warnings?: string[];
};

export type SearchResultItem = {
  title: string;
  url: string;
  content: string;
};

export type SearchResponse = {
  results: SearchResultItem[];
  provider: "tavily" | "serper" | "none";
};

export type ProgressStep =
  | "portfolio"
  | "thesis"
  | "news"
  | "writing"
  | "done"
  | "error";

export type ProgressEvent = {
  step: ProgressStep;
  message?: string;
};

export type BriefRecord = {
  id: string;
  user_id: string;
  investor_name: string;
  firm_name: string;
  result: Brief;
  share_slug: string | null;
  is_shared: boolean;
  created_at: string;
};
