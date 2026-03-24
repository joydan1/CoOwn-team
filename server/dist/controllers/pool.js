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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolController = void 0;
const typedi_1 = __importStar(require("typedi"));
const pool_1 = __importStar(require("../services/pool"));
const tsoa_1 = require("tsoa");
const AppError_1 = require("../common/errors/AppError");
let PoolController = class PoolController extends tsoa_1.Controller {
    constructor() {
        super();
        this.poolService = typedi_1.default.get(pool_1.default);
    }
    async getPools(creatorId, isPublic) {
        const filter = {};
        if (creatorId)
            filter['creator_id'] = creatorId;
        if (isPublic !== undefined)
            filter['is_public'] = isPublic;
        const query = {};
        if (Object.keys(filter).length > 0)
            query.where = filter;
        return this.poolService.getPools(query);
    }
    async getPublicPools() {
        return this.poolService.getPublicPools();
    }
    async getPoolById(id) {
        return this.poolService.getPoolById(id);
    }
    async createPool(pool, req) {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError_1.AppError("Unauthorized");
        return this.poolService.createPool(userId, pool);
    }
    async joinPool(id, joinData, req) {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError_1.AppError("Unauthorized");
        return this.poolService.joinPool(id, userId, joinData);
    }
    async getPoolDashboard(id) {
        return this.poolService.getPoolDashboard(id);
    }
    async getPoolMembers(id) {
        return this.poolService.getPoolMembers(id);
    }
    async getPoolUsers(id) {
        return this.poolService.getPoolUsers(id);
    }
    async togglePublic(id, data, req) {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError_1.AppError("Unauthorized");
        return this.poolService.togglePublic(id, userId, data.is_public);
    }
    async updatePool(id, updates) {
        return this.poolService.updatePool(id, updates);
    }
    async deletePool(id) {
        return this.poolService.deletePool(id);
    }
};
exports.PoolController = PoolController;
__decorate([
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.Example)([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            property: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                title: "3 Bedroom Luxury Apartment in Lekki",
                location: "Lekki Phase 1, Lagos",
                price: 15000000,
                type: "apartment",
                status: "available"
            },
            creator: {
                id: "550e8400-e29b-41d4-a716-446655440002",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                role: "user",
                verified: true,
                isActive: true
            },
            name: "Lagos Luxury Apartment Co-Own",
            target_amount: 5000000,
            raised_amount: 3250000,
            deadline: new Date("2024-12-31"),
            status: "active",
            is_public: false,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ]),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid filter parameters",
        statusCode: 400,
        name: "ValidationError"
    }),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPools", null);
__decorate([
    (0, tsoa_1.Get)("/public"),
    (0, tsoa_1.Response)(200, "Public pools"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPublicPools", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}"),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolById", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)("/"),
    (0, tsoa_1.Response)(201, "Pool Created Successfully"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid pool data or property not found",
        statusCode: 400,
        name: "ValidationError"
    }),
    (0, tsoa_1.Response)(401, "Unauthorized", {
        message: "Authentication required",
        statusCode: 401,
        name: "UnauthorizedError"
    }),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pool_1.CreatePoolDto, Object]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "createPool", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)("/{id}/join"),
    (0, tsoa_1.Example)({
        id: "550e8400-e29b-41d4-a716-446655440003",
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        declared_amount: 250000,
        paid_amount: 0,
        ownership_pct: 25.0,
        joined_at: new Date("2024-01-15T10:30:00Z")
    }),
    (0, tsoa_1.Response)(201, "Successfully joined pool"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid amount or already a member",
        statusCode: 400,
        name: "ValidationError"
    }),
    (0, tsoa_1.Response)(401, "Unauthorized", {
        message: "Authentication required",
        statusCode: 401,
        name: "UnauthorizedError"
    }),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pool_1.JoinPoolDto, Object]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "joinPool", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}/dashboard"),
    (0, tsoa_1.Response)(200, "Pool dashboard"),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolDashboard", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}/members"),
    (0, tsoa_1.Example)([
        {
            id: "550e8400-e29b-41d4-a716-446655440003",
            pool_id: "550e8400-e29b-41d4-a716-446655440000",
            user_id: "550e8400-e29b-41d4-a716-446655440002",
            declared_amount: 250000,
            paid_amount: 0,
            ownership_pct: 25.0,
            joined_at: new Date("2024-01-15T10:30:00Z")
        }
    ]),
    (0, tsoa_1.Response)(200, "Pool members"),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolMembers", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}/users"),
    (0, tsoa_1.Response)(200, "Pool member users"),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPoolUsers", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Put)("/{id}/toggle-public"),
    (0, tsoa_1.Response)(200, "Pool visibility updated"),
    (0, tsoa_1.Response)(403, "Forbidden", {
        message: "Only pool creator can toggle public status",
        statusCode: 403,
        name: "ForbiddenError"
    }),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "togglePublic", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Put)("/{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "updatePool", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Delete)("/{id}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "deletePool", null);
exports.PoolController = PoolController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("pools"),
    (0, tsoa_1.Tags)("Pools"),
    __metadata("design:paramtypes", [])
], PoolController);
//# sourceMappingURL=pool.js.map