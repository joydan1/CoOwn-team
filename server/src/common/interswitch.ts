import axios from "axios";
import { variables } from "../config/env";

interface InterswitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;
let tokenPromise: Promise<string> | null = null;

export async function getInterswitchToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const { authUrl, clientId, clientSecret } = variables.interswitch;

      if (!clientId || !clientSecret) {
        throw new Error("Missing Interswitch credentials");
      }

      const credentials = Buffer.from(
        `${clientId.trim()}:${clientSecret.trim()}`
      ).toString("base64");

      const response = await axios.post<InterswitchTokenResponse>(
        `${authUrl}?grant_type=client_credentials`,
        null,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        }
      );

      const { access_token, expires_in } = response.data;

      cachedToken = access_token;
      tokenExpiry = Date.now() + (expires_in - 60) * 1000;

      return cachedToken;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

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

export async function verifyBvn(bvn: string): Promise<BvnFullResponse["data"]> {
 
  if (!/^\d{11}$/.test(bvn)) {
    throw new Error("BVN must be 11 digits");
  }

  try {
 
    const token = await getInterswitchToken();

    // const url = `${variables.interswitch.baseUrl}/marketplace-routing/api/v1/verify/identity/bvn/verify`;
    const url = "https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1/verify/identity/bvn/verify"
 
    const response = await axios.post<BvnFullResponse>(
      url,
      { id: bvn },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, 
      }
    );

    const result = response.data;

    if (result.responseCode !== "00") {
      throw new Error(
        result.responseDescription || "BVN verification failed"
      );
    }

    return result.data;

  } catch (error: any) {
    console.error("BVN verification error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw new Error(
      error.response?.data?.responseDescription ||
      "Failed to verify BVN"
    );
  }
}

export interface InterswitchTransactionVerificationResponse {
  Amount: number;
  CardNumber: string;
  MerchantReference: string;
  PaymentReference: string;
  RetrievalReferenceNumber: string;
  SplitAccounts: unknown[];
  TransactionDate: string;
  ResponseCode: string;
  ResponseDescription: string;
  AccountNumber?: string;
  TransactionReference?: string;
  CurrencyCode?: string | number;
}

export async function verifyInterswitchTransaction(merchantCode: string, transactionReference: string, amount: number): Promise<InterswitchTransactionVerificationResponse> {
  if (!merchantCode) {
    throw new Error("Missing Interswitch merchant code");
  }

  if (!transactionReference) {
    throw new Error("Missing Interswitch transaction reference");
  }

  const token = await getInterswitchToken();
  const verifyUrl =
    variables.interswitch.getTransactionUrl ||
    "https://qa.interswitchng.com/collections/api/v1/gettransaction.json";

  const queryString = new URLSearchParams({
    merchantcode: merchantCode,
    transactionreference: transactionReference,
    amount: amount.toString(),
  }).toString();

  try {
    const response = await axios.get<InterswitchTransactionVerificationResponse>(
      `${verifyUrl}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    const result = response.data;

    console.log('Interswitch verification response:', result);

    if (result.ResponseCode !== "00") {
      throw new Error(result.ResponseDescription || "Interswitch transaction verification failed");
    }

    return result;
  } catch (error: any) {
    console.error("Interswitch transaction verification error:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    throw new Error(
      error?.response?.data?.ResponseDescription ||
      "Failed to verify Interswitch transaction"
    );
  }
}
