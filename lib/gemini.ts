import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { PRIYA_CONTEXT } from "./constants";
import { Brief } from "./types";

const GEMINI_TIMEOUT_MS = 45000;

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    portfolioActivity: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        summary: { type: SchemaType.STRING },
        sources: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
            },
            required: ["label", "url"],
          },
        },
      },
      required: ["summary", "sources"],
    },
    investmentThesis: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        summary: { type: SchemaType.STRING },
        sources: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
            },
            required: ["label", "url"],
          },
        },
      },
      required: ["summary", "sources"],
    },
    context: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        summary: { type: SchemaType.STRING },
        sources: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
            },
            required: ["label", "url"],
          },
        },
      },
      required: ["summary", "sources"],
    },
    talkingPoints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["portfolioActivity", "investmentThesis", "context", "talkingPoints"],
};

function buildPrompt(
  investorName: string,
  firmName: string,
  sourceBlob: string
): string {
  return `You are a research assistant generating a pre-meeting investor briefing for a startup founder.

INVESTOR: ${investorName}
FIRM: ${firmName}

SOURCE MATERIAL (each item tagged with its source URL):
${sourceBlob || "(no source material was retrieved)"}

GROUNDING AND ANTI-HALLUCINATION RULES (follow strictly):
- Only state a fact if it is directly supported by the provided source text above.
- If the source text does not mention a specific date, do not claim an event happened "recently" or within the last 90 days — say the recency is unclear or omit the date framing.
- If no source material is found for a section, explicitly set that section to null rather than inferring or guessing.
- Do not invent company names, deal sizes, or dates that are not present in the source text above.
- Every source you cite in a section's "sources" array must be a URL that actually appears in the source material above.

Produce a JSON object with these fields:
- portfolioActivity: { summary, sources } or null — recent portfolio activity (new investments or exits), only if supported by source text. summary should be 2-4 sentences.
- investmentThesis: { summary, sources } or null — their publicly stated investment focus/thesis, only if supported by source text.
- context: { summary, sources } or null — sectors they've moved away from, notable controversies, pivots, or anything else the founder should be aware of walking into the meeting, only if supported by source text.
- talkingPoints: an array of exactly 3 strings. These should be specific talking points tailored to the FOUNDER's own startup (described below), synthesized from the investor/firm information above. They are reasoning/synthesis, not sourced facts, so they do not need citations.

FOUNDER'S CONTEXT (use ONLY to tailor the 3 talking points, this is about the founder's own startup, not the investor):
${PRIYA_CONTEXT}

Return only the JSON object matching the schema.`;
}

export async function generateBrief(
  investorName: string,
  firmName: string,
  sourceBlob: string
): Promise<Brief> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const prompt = buildPrompt(investorName, firmName, sourceBlob);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      portfolioActivity: parsed.portfolioActivity ?? null,
      investmentThesis: parsed.investmentThesis ?? null,
      context: parsed.context ?? null,
      talkingPoints: Array.isArray(parsed.talkingPoints)
        ? parsed.talkingPoints.slice(0, 3)
        : [],
    };
  } catch (err) {
    throw new Error(
      `Gemini brief generation failed: ${err instanceof Error ? err.message : "unknown error"}`
    );
  } finally {
    clearTimeout(timeout);
  }
}
