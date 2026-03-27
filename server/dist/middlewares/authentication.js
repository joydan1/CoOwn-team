"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../common/errors/AppError");
async function expressAuthentication(request, securityName) {
    if (securityName !== "jwt") {
        throw new AppError_1.AppError("Unknown authentication method", 401);
    }
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        console.warn('🔐 [AUTH] No authorization header provided');
        throw new AppError_1.AppError("No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.warn('🔐 [AUTH] Authorization header malformed, no token found');
        throw new AppError_1.AppError("No token provided", 401);
    }
    console.log('🔐 [AUTH] Verifying token with:');
    console.log('   Secret exists:', !!env_1.variables.jwt.jwtSecret);
    console.log('   Issuer:', env_1.variables.jwt.issuer);
    console.log('   Token preview:', token.substring(0, 20) + '...');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.variables.jwt.jwtSecret, {
            issuer: env_1.variables.jwt.issuer
        });
        console.log('✅ [AUTH] Token verified successfully:', { id: decoded.id, email: decoded.email });
        return {
            id: decoded.id,
            email: decoded.email
        };
    }
    catch (error) {
        console.error('❌ [AUTH] Token verification failed:', {
            errorName: error.name,
            errorMessage: error.message,
            tokenPreview: token.substring(0, 30) + '...'
        });
        throw new AppError_1.AppError("Invalid token", 401);
    }
}
//# sourceMappingURL=authentication.js.map