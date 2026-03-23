import axios from "axios";
import { variables } from "../config/env";

export interface BvnFullResponse {
    responseCode: string;
    responseDescription: string;
    data: {
        firstName: string;
        lastName: string;
        middleName?: string;
        dateOfBirth: string;
        phoneNumber?: string;
        nin?: string;
        photo?: string;
    };
}

interface InterswitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

/** Normalize string values for comparison */
function normalize(value?: string): string {
    return value?.trim().toLowerCase() || "";
}

/** Normalize date to YYYY-MM-DD */
function normalizeDate(date: string): string {
    return new Date(date).toISOString().split("T")[0];
}

/** Match BVN data with user input */
export function matchBvnFullData(
    bvnData: BvnFullResponse["data"],
    input: { firstName: string; lastName: string; dateOfBirth: string }
): boolean {
    return (
        normalize(bvnData.firstName) === normalize(input.firstName) &&
        normalize(bvnData.lastName) === normalize(input.lastName) &&
        normalizeDate(bvnData.dateOfBirth) === normalizeDate(input.dateOfBirth)
    );
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

/** Get Interswitch OAuth Token (with caching) */
export async function getInterswitchToken(): Promise<string> {
    const now = Date.now();

    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }

    const { clientId, clientSecret, authUrl } = variables.interswitch;

    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        const response = await axios.post<InterswitchTokenResponse>(
            authUrl as string,
            new URLSearchParams({
                grant_type: "client_credentials",
                scope: "profile"
            }),
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        cachedToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

        return cachedToken;
    } catch (error: any) {
        console.error("Interswitch token error:", error.response?.data || error.message);
        throw new Error("Failed to generate Interswitch token");
    }
}

export async function verifyBvnFull(bvn: string): Promise<BvnFullResponse> {
    try {
        const token = await getInterswitchToken();
        const url = `${variables.interswitch.baseUrl}/marketplace-routing/api/v1/verify/identity/bvn/verify`;

        const { data } = await axios.post<BvnFullResponse>(
            url,
            { id: bvn }, // IMPORTANT: field is "id"
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (data.responseCode !== "00") {
            throw new Error(data.responseDescription || "BVN verification failed");
        }

        return data;
    } catch (error: any) {
        console.error("BVN full verification error:", error.response?.data || error.message);
        throw new Error("Failed to verify BVN");
    }
}