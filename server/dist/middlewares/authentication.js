"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
async function expressAuthentication(request, securityName) {
    if (securityName !== "jwt") {
        throw new Error("Unknown authentication method");
    }
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new Error("No token provided");
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.variables.jwt.jwtSecret);
        // ensure decoded is of expected type
        if (typeof decoded === 'string') {
            throw new Error("Invalid token payload");
        }
        return {
            id: decoded.id,
            email: decoded.email
        };
    }
    catch {
        throw new Error("Invalid token");
    }
}
//# sourceMappingURL=authentication.js.map