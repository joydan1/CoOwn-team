"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterswitchToken = getInterswitchToken;
exports.verifyBvn = verifyBvn;
exports.verifyInterswitchTransaction = verifyInterswitchTransaction;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
let cachedToken = null;
let tokenExpiry = 0;
let tokenPromise = null;
async function getInterswitchToken() {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }
    if (tokenPromise) {
        return tokenPromise;
    }
    tokenPromise = (async () => {
        try {
            const { authUrl, clientId, clientSecret } = env_1.variables.interswitch;
            if (!clientId || !clientSecret) {
                throw new Error("Missing Interswitch credentials");
            }
            const credentials = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString("base64");
            const response = await axios_1.default.post(`${authUrl}?grant_type=client_credentials`, null, {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                },
            });
            const { access_token, expires_in } = response.data;
            cachedToken = access_token;
            tokenExpiry = Date.now() + (expires_in - 60) * 1000;
            return cachedToken;
        }
        finally {
            tokenPromise = null;
        }
    })();
    return tokenPromise;
}
async function verifyBvn(bvn) {
    if (!/^\d{11}$/.test(bvn)) {
        throw new Error("BVN must be 11 digits");
    }
    try {
        const token = await getInterswitchToken();
        // const url = `${variables.interswitch.baseUrl}/marketplace-routing/api/v1/verify/identity/bvn/verify`;
        const url = "https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1/verify/identity/bvn/verify";
        const response = await axios_1.default.post(url, { id: bvn }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            timeout: 10000,
        });
        const result = response.data;
        if (result.responseCode !== "00") {
            throw new Error(result.responseDescription || "BVN verification failed");
        }
        return result.data;
    }
    catch (error) {
        console.error("BVN verification error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw new Error(error.response?.data?.responseDescription ||
            "Failed to verify BVN");
    }
}
async function verifyInterswitchTransaction(merchantCode, transactionReference, amount) {
    if (!merchantCode) {
        throw new Error("Missing Interswitch merchant code");
    }
    if (!transactionReference) {
        throw new Error("Missing Interswitch transaction reference");
    }
    const token = await getInterswitchToken();
    const verifyUrl = env_1.variables.interswitch.getTransactionUrl ||
        "https://qa.interswitchng.com/collections/api/v1/gettransaction.json";
    const queryString = new URLSearchParams({
        merchantcode: merchantCode,
        transactionreference: transactionReference,
        amount: amount.toString(),
    }).toString();
    try {
        const response = await axios_1.default.get(`${verifyUrl}?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            timeout: 10000,
        });
        const result = response.data;
        console.log('Interswitch verification response:', result);
        if (result.ResponseCode !== "00") {
            throw new Error(result.ResponseDescription || "Interswitch transaction verification failed");
        }
        return result;
    }
    catch (error) {
        console.error("Interswitch transaction verification error:", {
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
        });
        throw new Error(error?.response?.data?.ResponseDescription ||
            "Failed to verify Interswitch transaction");
    }
}
//# sourceMappingURL=interswitch.js.map