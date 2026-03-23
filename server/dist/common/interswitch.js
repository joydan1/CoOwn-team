"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchBvnFullData = matchBvnFullData;
exports.getInterswitchToken = getInterswitchToken;
exports.verifyBvnFull = verifyBvnFull;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
/**
 * ===============================
 * HELPERS
 * ===============================
 */
/** Normalize string values for comparison */
function normalize(value) {
    return value?.trim().toLowerCase() || "";
}
/** Normalize date to YYYY-MM-DD */
function normalizeDate(date) {
    return new Date(date).toISOString().split("T")[0];
}
/** Match BVN data with user input */
function matchBvnFullData(bvnData, input) {
    return (normalize(bvnData.firstName) === normalize(input.firstName) &&
        normalize(bvnData.lastName) === normalize(input.lastName) &&
        normalizeDate(bvnData.dateOfBirth) === normalizeDate(input.dateOfBirth));
}
/**
 * ===============================
 * TOKEN CACHING
 * ===============================
 */
let cachedToken = null;
let tokenExpiry = 0;
/** Get Interswitch OAuth Token (with caching) */
async function getInterswitchToken() {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }
    const { clientId, clientSecret, authUrl } = env_1.variables.interswitch;
    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const response = await axios_1.default.post(authUrl, new URLSearchParams({
            grant_type: "client_credentials",
            scope: "profile"
        }), {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        cachedToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
        return cachedToken;
    }
    catch (error) {
        console.error("Interswitch token error:", error.response?.data || error.message);
        throw new Error("Failed to generate Interswitch token");
    }
}
/**
 * ===============================
 * BVN FULL VERIFICATION
 * ===============================
 */
async function verifyBvnFull(bvn) {
    try {
        const token = await getInterswitchToken();
        const url = `${env_1.variables.interswitch.baseUrl}/marketplace-routing/api/v1/verify/identity/bvn/verify`;
        const { data } = await axios_1.default.post(url, { id: bvn }, // IMPORTANT: field is "id"
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (data.responseCode !== "00") {
            throw new Error(data.responseDescription || "BVN verification failed");
        }
        return data;
    }
    catch (error) {
        console.error("BVN full verification error:", error.response?.data || error.message);
        throw new Error("Failed to verify BVN");
    }
}
//# sourceMappingURL=interswitch.js.map