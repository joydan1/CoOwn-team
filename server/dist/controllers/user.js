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
exports.AuthController = void 0;
const typedi_1 = __importStar(require("typedi"));
const user_1 = __importDefault(require("../services/user"));
const tsoa_1 = require("tsoa");
let AuthController = class AuthController extends tsoa_1.Controller {
    constructor() {
        super();
        this.userService = typedi_1.default.get(user_1.default);
    }
    /** @summary Get user by ID @description Retrieve user information by their unique ID */
    async getUserById(id) {
        const users = await this.userService.getUserInformation(id);
        return users;
    }
    /** LIST ALL USERS */
    async listAll(role, isActive) {
        const filter = {};
        if (role)
            filter.role = role;
        if (typeof isActive === "boolean")
            filter.isActive = isActive;
        return this.userService.listAllUsers(filter);
    }
    /** UPDATE USER */
    async updateUser(id, updates) {
        return this.userService.updateUser(id, updates);
    }
    /** DELETE USER */
    async deleteUser(id) {
        return this.userService.deleteUser(id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/:id"),
    (0, tsoa_1.Example)({
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+2348012345678",
        verified: true,
        role: "user",
        isActive: true,
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    }),
    (0, tsoa_1.Response)(200, "User found"),
    (0, tsoa_1.Response)(404, "User not found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserById", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.Example)([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            role: "user",
            verified: true,
            isActive: true,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ]),
    (0, tsoa_1.Response)(200, "List of users"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listAll", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Put)("/:id"),
    (0, tsoa_1.Example)({
        firstName: "Jane",
        lastName: "Doe",
        phone: "+2348012345678"
    }),
    (0, tsoa_1.Response)(200, "User updated successfully"),
    (0, tsoa_1.Response)(404, "User not found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Delete)("/:id"),
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    (0, tsoa_1.Response)(200, "User deleted successfully"),
    (0, tsoa_1.Response)(404, "User not found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
exports.AuthController = AuthController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("users"),
    (0, tsoa_1.Tags)("Users"),
    __metadata("design:paramtypes", [])
], AuthController);
//# sourceMappingURL=user.js.map