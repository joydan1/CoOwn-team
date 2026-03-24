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
exports.ContributionController = void 0;
const typedi_1 = __importStar(require("typedi"));
const contribution_1 = __importDefault(require("../services/contribution"));
const contribution_2 = require("../repositories/contribution");
const tsoa_1 = require("tsoa");
const AppError_1 = require("../common/errors/AppError");
const dtos_1 = require("../dtos");
let ContributionController = class ContributionController extends tsoa_1.Controller {
    constructor() {
        super();
        this.contributionService = typedi_1.default.get(contribution_1.default);
        this.contributionRepository = typedi_1.default.get(contribution_2.ContributionRepository);
    }
    /**
         * Get contributions with optional filters for pool or user.
         * @param poolId optional pool ID filter
         * @param userId optional user ID filter
         */
    async getContributions(poolId, userId) {
        if (poolId)
            return this.contributionService.getContributionsByPool(poolId);
        if (userId)
            return this.contributionService.getContributionsByUser(userId);
        return this.contributionRepository.listAll({});
    }
    /**
         * Create a contribution for a pool member. Recursively recalculates pool ownership percentages.
         * @param contribution contribution payload including pool_id, user_id and amount
         */ async getContributionById(id) {
        return this.contributionRepository.findById(id);
    }
    async processPayment(payment, req) {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError_1.AppError("Unauthorized");
        return this.contributionService.processPayment({
            ...payment,
            user_id: userId
        });
    }
    async updateContribution(id, updates) {
        return this.contributionRepository.updateById(id, updates);
    }
    async deleteContribution(id) {
        return this.contributionRepository.deleteById(id);
    }
};
exports.ContributionController = ContributionController;
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.Example)([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            pool_id: "550e8400-e29b-41d4-a716-446655440001",
            user_id: "550e8400-e29b-41d4-a716-446655440002",
            amount: 50000,
            currency: "USD",
            fx_rate: 1500,
            payment_ref: "PAY_123456789",
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ]),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "getContributions", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}"),
    (0, tsoa_1.Example)({
        id: "550e8400-e29b-41d4-a716-446655440000",
        pool_id: "550e8400-e29b-41d4-a716-446655440001",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        amount: 50000,
        currency: "USD",
        fx_rate: 1500,
        payment_ref: "PAY_123456789",
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    }),
    (0, tsoa_1.Response)(404, "Contribution Not Found", {
        message: "Contribution not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "getContributionById", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)("/pay"),
    (0, tsoa_1.Example)({
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        amount: 50000,
        currency: "USD",
        paymentMethod: "cross_border"
    }),
    (0, tsoa_1.Response)(201, "Payment processed successfully"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid payment data or insufficient funds",
        statusCode: 400,
        name: "ValidationError"
    }),
    (0, tsoa_1.Response)(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.PaymentDto, Object]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "processPayment", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Put)("/{id}"),
    (0, tsoa_1.Response)(200, "Contribution updated successfully"),
    (0, tsoa_1.Response)(404, "Contribution Not Found", {
        message: "Contribution not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "updateContribution", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Delete)("/{id}"),
    (0, tsoa_1.Response)(200, "Contribution deleted successfully"),
    (0, tsoa_1.Response)(404, "Contribution Not Found", {
        message: "Contribution not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "deleteContribution", null);
exports.ContributionController = ContributionController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("contributions"),
    (0, tsoa_1.Tags)("Contributions"),
    __metadata("design:paramtypes", [])
], ContributionController);
//# sourceMappingURL=contribution.js.map