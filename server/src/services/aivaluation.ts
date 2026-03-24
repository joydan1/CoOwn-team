import axios from "axios";
import { AppError } from "../common/errors/AppError";
import { GoogleGenAI } from "@google/genai";
import logger from "../config/logger";

const ai = new GoogleGenAI({});

export interface AiValuationInput {
    title: string;
    location: string;
    price: number;
    type: "apartment" | "house" | "land" | "commercial";
}

export interface AiValuationResult {
    estimatedValue: number;
    confidence?: number;
    source?: "primary" | "gemini" | "local";
}

const AI_URL = "https://balalafas";
const API_KEY = "psfmasf,m,fms,f";

if (!AI_URL || !API_KEY) {
    throw new Error("Primary AI environment variables are missing");
}

export async function getAiValuation(
    data: AiValuationInput
): Promise<AiValuationResult> {
    try {

        const response = await axios.post(AI_URL, data, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 5000,
        });

        const result = response.data as AiValuationResult;

        if (!result || typeof result.estimatedValue !== "number") {
            throw new AppError("Invalid primary AI response");
        }

        logger.info("💡 Using Primary AI for valuation");
        return { ...result, source: "primary" };
    } catch (primaryError) {
        logger.warn("Primary AI failed, falling back to Gemini AI", { error: primaryError });

        try {
            const geminiResult = await getGeminiValuation(data);
            logger.info("💡 Using Gemini AI for valuation");
            return { ...geminiResult, source: "gemini" };
        } catch (geminiError) {
            logger.warn("Gemini AI failed, using local fallback", { error: geminiError });

            const fallbackResult = fallbackValuation(data);
            logger.info("💡 Using Local calculation for valuation");
            return { ...fallbackResult, source: "local" };
        }
    }
}

// 🔹 Separate Gemini AI call
export async function getGeminiValuation(
    data: AiValuationInput
): Promise<AiValuationResult> {
    try {
        const prompt = `
        Estimate the property value:
        Title: ${data.title}
        Location: ${data.location}
        Type: ${data.type}
        Price: ${data.price}
        Respond only with JSON: { "estimatedValue": number, "confidence": number }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        if (!response.text || typeof response.text !== "string") {
            throw new AppError("Invalid Gemini AI response: empty text");
        }

        const result: AiValuationResult = JSON.parse(response.text);

        if (!result || typeof result.estimatedValue !== "number") {
            throw new AppError("Invalid Gemini AI response");
        }

        return result;
    } catch (error) {
        throw new AppError("Gemini AI failed");
    }
}

// 🔹 Local fallback calculation
function fallbackValuation(data: AiValuationInput): AiValuationResult {
    const locationMultiplier = getLocationMultiplier(data.location);
    const typeMultiplier = getTypeMultiplier(data.type);

    const estimatedValue = Math.round(
        data.price * locationMultiplier * typeMultiplier
    );

    return {
        estimatedValue,
        confidence: 0.5,
    };
}

// 🔹 Helpers
function getLocationMultiplier(location: string): number {
    const normalized = location.toLowerCase();
    if (normalized.includes("lagos")) return 1.3;
    if (normalized.includes("abuja")) return 1.25;
    if (normalized.includes("port harcourt")) return 1.2;
    return 1.0;
}

function getTypeMultiplier(type: string): number {
    const map = {
        land: 0.8,
        apartment: 1.1,
        house: 1.0,
        commercial: 1.3,
    };
    return map[type as keyof typeof map] || 1.0;
}