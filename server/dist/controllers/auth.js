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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const typedi_1 = __importStar(require("typedi"));
const user_1 = __importDefault(require("../services/user"));
const tsoa_1 = require("tsoa");
const user_2 = require("../dtos/user");
let UserController = class UserController extends tsoa_1.Controller {
    constructor() {
        super();
        this.userService = typedi_1.default.get(user_1.default);
    }
    /** @summary Register a new user @description Create a new user account with email and password */
    async register(req) {
        const user = await this.userService.registerUser(req);
        return user;
    }
    /** @summary User login @description Authenticate user with email and password, returns JWT tokens */
    async login(req) {
        const user = await this.userService.loginUser(req);
        return user;
    }
    /** @summary Refresh access token @description Generate new access token using refresh token */
    async refresh(req) {
        const token = await this.userService.refreshToken(req);
        return token;
    }
    /** @summary User logout @description Logout user by invalidating their session */
    async logout(id) {
        return this.userService.logout(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, tsoa_1.Post)("/register"),
    (0, tsoa_1.Example)({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "SecurePass123!"
    }),
    (0, tsoa_1.Response)(201, "User registered successfully", {
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        verified: false,
        role: "user",
        isActive: true,
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    }),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_2.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, tsoa_1.Post)("/login"),
    (0, tsoa_1.Example)({
        email: "john.doe@example.com",
        password: "SecurePass123!"
    }),
    (0, tsoa_1.Response)(200, "Login successful", {
        message: "Login successful",
        token: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        user: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            verified: true,
            role: "user",
            isActive: true
        }
    }),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_2.LoginUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, tsoa_1.Post)("/refresh"),
    (0, tsoa_1.Example)({
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }),
    (0, tsoa_1.Response)(200, "Token refreshed successfully", {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_2.refreshTokenDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "refresh", null);
__decorate([
    (0, tsoa_1.Delete)("/logout"),
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    (0, tsoa_1.Response)(200, "Logout successful", true),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "logout", null);
exports.UserController = UserController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("auth"),
    (0, tsoa_1.Tags)("Authentication"),
    __metadata("design:paramtypes", [])
], UserController);
//# sourceMappingURL=auth.js.map