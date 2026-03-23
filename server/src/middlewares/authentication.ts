import { Request } from "express";
import jwt from "jsonwebtoken";
import { variables } from "../config/env";

export async function expressAuthentication(
  request: Request,
  securityName: string
): Promise<{ id: string; email: string }> {

  if (securityName !== "jwt") {
    throw new Error("Unknown authentication method");
  }

  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, variables.jwt.jwtSecret!);

    // ensure decoded is of expected type
    if (typeof decoded === 'string') {
      throw new Error("Invalid token payload");
    }

    return {
      id: decoded.id as string,
      email: decoded.email as string
    };
  } catch {
    throw new Error("Invalid token");
  }
}