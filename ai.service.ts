// src/services/ai.service.ts
// Calls the CoOwn Python AI/ML microservice.
// The backend calls this whenever a new property listing is created.

import { ValuationRequest, ValuationResult } from "../types/property.types";

const AI_BASE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
const AI_API_KEY  = process.env.AI_SERVICE_KEY ?? "coown-dev-key-change-in-prod";

const AI_HEADERS = {
  "Content-Type": "application/json",
  "X-API-Key":    AI_API_KEY,
};

// ── Timeout helper ────────────────────────────────────────────────────────────
function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// ── Main function: get AI valuation for a property ───────────────────────────
export async function getPropertyValuation(
  req: ValuationRequest
): Promise<ValuationResult | null> {
  try {
    const response = await fetch(`${AI_BASE_URL}/predict/valuation`, {
      method:  "POST",
      headers: AI_HEADERS,
      body:    JSON.stringify(req),
      signal:  withTimeout(8000), // 8 second timeout — don't block listing creation
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[AI Service] Valuation request failed — HTTP ${response.status}: ${errorBody}`
      );
      return null; // return null so the listing still saves without valuation
    }

    const data = (await response.json()) as ValuationResult;
    console.info(
      `[AI Service] Valuation OK — ${data.display}  confidence=${data.confidence}`
    );
    return data;

  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      console.error("[AI Service] Valuation request timed out after 8s.");
    } else {
      console.error("[AI Service] Unexpected error calling AI service:", error);
    }
    return null; // graceful degradation — listing saves, valuation just won't show
  }
}

// ── Health check: ping the AI service ────────────────────────────────────────
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_BASE_URL}/health`, {
      signal: withTimeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
