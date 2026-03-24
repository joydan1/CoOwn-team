"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiValuation = getAiValuation;
exports.getGeminiValuation = getGeminiValuation;
const axios_1 = __importDefault(require("axios"));
const AppError_1 = require("../common/errors/AppError");
const genai_1 = require("@google/genai");
const logger_1 = __importDefault(require("../config/logger"));
const ai = new genai_1.GoogleGenAI({});
const AI_URL = "https://balalafas";
const API_KEY = "psfmasf,m,fms,f";
if (!AI_URL || !API_KEY) {
    throw new Error("Primary AI environment variables are missing");
}
async function getAiValuation(data) {
    try {
        const response = await axios_1.default.post(AI_URL, data, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 5000,
        });
        const result = response.data;
        if (!result || typeof result.estimatedValue !== "number") {
            throw new AppError_1.AppError("Invalid primary AI response");
        }
        logger_1.default.info("💡 Using Primary AI for valuation");
        return { ...result, source: "primary" };
    }
    catch (primaryError) {
        logger_1.default.warn("Primary AI failed, falling back to Gemini AI", { error: primaryError });
        try {
            const geminiResult = await getGeminiValuation(data);
            logger_1.default.info("💡 Using Gemini AI for valuation");
            return { ...geminiResult, source: "gemini" };
        }
        catch (geminiError) {
            logger_1.default.warn("Gemini AI failed, using local fallback", { error: geminiError });
            const fallbackResult = fallbackValuation(data);
            logger_1.default.info("💡 Using Local calculation for valuation");
            return { ...fallbackResult, source: "local" };
        }
    }
}
// 🔹 Separate Gemini AI call
async function getGeminiValuation(data) {
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
            throw new AppError_1.AppError("Invalid Gemini AI response: empty text");
        }
        const result = JSON.parse(response.text);
        if (!result || typeof result.estimatedValue !== "number") {
            throw new AppError_1.AppError("Invalid Gemini AI response");
        }
        return result;
    }
    catch (error) {
        throw new AppError_1.AppError("Gemini AI failed");
    }
}
// 🔹 Local fallback calculation
function fallbackValuation(data) {
    const locationMultiplier = getLocationMultiplier(data.location);
    const typeMultiplier = getTypeMultiplier(data.type);
    const estimatedValue = Math.round(data.price * locationMultiplier * typeMultiplier);
    return {
        estimatedValue,
        confidence: 0.5,
    };
}
// 🔹 Helpers
function getLocationMultiplier(location) {
    const normalized = location.toLowerCase();
    if (normalized.includes("lagos"))
        return 1.3;
    if (normalized.includes("abuja"))
        return 1.25;
    if (normalized.includes("port harcourt"))
        return 1.2;
    return 1.0;
}
function getTypeMultiplier(type) {
    const map = {
        land: 0.8,
        apartment: 1.1,
        house: 1.0,
        commercial: 1.3,
    };
    return map[type] || 1.0;
}
//# sourceMappingURL=aivaluation.js.map