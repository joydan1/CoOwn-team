"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = hashString;
exports.compareHash = compareHash;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
exports.cleanedUser = cleanedUser;
const bcrypt = __importStar(require("bcrypt"));
const env_1 = require("../config/env");
const jwt = __importStar(require("jsonwebtoken"));
async function hashString(input) {
    if (!input)
        return "";
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(input, salt);
    return hash;
}
async function compareHash(input, hash) {
    const status = bcrypt.compareSync(input, hash);
    return status;
}
async function generateAccessToken(email, id) {
    const payload = {
        email, id
    };
    return jwt.sign(payload, env_1.variables.jwt.jwtSecret, { expiresIn: '30m', issuer: env_1.variables.jwt.issuer });
}
async function generateRefreshToken(email, id) {
    const payload = {
        email, id
    };
    return jwt.sign(payload, env_1.variables.jwt.jwtSecret, { expiresIn: '7d', issuer: env_1.variables.jwt.issuer });
}
async function verifyToken(token) {
    return jwt.verify(token, env_1.variables.jwt.jwtSecret);
}
// export function cleanedUser(input: Partial<User>){
//     delete input.password;
//     delete input.token;
//     return input;
// }
function cleanedUser(input) {
    const { password, token, ...rest } = input;
    return rest;
}
//# sourceMappingURL=util.js.map