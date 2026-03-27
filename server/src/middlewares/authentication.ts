import { Request } from "express";
import jwt from "jsonwebtoken";
import { variables } from "../config/env";
import { AppError } from "../common/errors/AppError";

export async function expressAuthentication(
  request: Request,
  securityName: string
): Promise<{ id: string; email: string }> {

  if (securityName !== "jwt") {
    throw new AppError("Unknown authentication method", 401);
  }

  const authHeader = request.headers.authorization;

  if (!authHeader) {
    console.warn('🔐 [AUTH] No authorization header provided');
    throw new AppError("No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.warn('🔐 [AUTH] Authorization header malformed, no token found');
    throw new AppError("No token provided", 401);
  }

  console.log('🔐 [AUTH] Verifying token with:');
  console.log('   Secret exists:', !!variables.jwt.jwtSecret);
  console.log('   Issuer:', variables.jwt.issuer);
  console.log('   Token preview:', token.substring(0, 20) + '...');

  try {
    const decoded = jwt.verify(token, variables.jwt.jwtSecret!, {
      issuer: variables.jwt.issuer
    }) as any;

    console.log('✅ [AUTH] Token verified successfully:', { id: decoded.id, email: decoded.email });
    
    return {
      id: decoded.id as string,
      email: decoded.email as string
    };
  } catch (error: any) {
    console.error('❌ [AUTH] Token verification failed:', {
      errorName: error.name,
      errorMessage: error.message,
      tokenPreview: token.substring(0, 30) + '...'
    });
    throw new AppError("Invalid token", 401);
  }
}