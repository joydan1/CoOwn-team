"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_1 = __importDefault(require("../services/user"));
const typedi_1 = __importDefault(require("typedi"));
const userService = typedi_1.default.get(user_1.default);
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.variables.passport.google_client_id,
    clientSecret: env_1.variables.passport.google_client_secret,
    callbackURL: env_1.variables.passport.callbackURL
}, async function (accessToken, refreshToken, profile, done) {
    try {
        const result = await userService.googleLogin(profile);
        return done(null, result);
    }
    catch (error) {
        return done(error);
    }
}));
//# sourceMappingURL=google.js.map