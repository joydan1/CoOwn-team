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
exports.MilestoneController = void 0;
const typedi_1 = __importStar(require("typedi"));
const milestone_1 = __importDefault(require("../services/milestone"));
const milestone_2 = require("../repositories/milestone");
const tsoa_1 = require("tsoa");
const AppError_1 = require("../common/errors/AppError");
const dtos_1 = require("../dtos");
let MilestoneController = class MilestoneController extends tsoa_1.Controller {
    constructor() {
        super();
        this.milestoneService = typedi_1.default.get(milestone_1.default);
        this.milestoneRepository = typedi_1.default.get(milestone_2.MilestoneRepository);
    }
    /**
         * Retrieve milestones, optionally filtered by pool ID.
         * @param poolId optional pool ID to filter milestones by pool
         */
    async getMilestones(poolId) {
        if (poolId)
            return this.milestoneService.getMilestonesByPool(poolId);
        return this.milestoneRepository.listAll({});
    }
    /**
         * Get a specific milestone by ID.
         * @param id milestone ID to lookup
         */
    async getMilestoneById(id) {
        return this.milestoneRepository.findById(id);
    }
    /**
         * Create a new milestone for a pool.
         * @param milestone milestone details including pool_id, title and required approvals
         */
    async createMilestone(milestone) {
        return this.milestoneService.createMilestone(milestone);
    }
    /**
         * Record an approval or rejection vote for a milestone by a pool member.
         * @param id milestone ID
         * @param vote vote payload with approve true/false
         */
    async voteOnMilestone(id, vote, req) {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError_1.AppError("Unauthorized");
        return this.milestoneService.voteOnMilestone({
            milestone_id: id,
            user_id: userId,
            approve: vote.approve
        });
    }
    /**
         * Update a milestone's details. Only status and metadata are updated.
         * @param id milestone ID
         * @param updates fields to update (status, description, required_approvals, etc.)
         */
    async updateMilestone(id, updates) {
        return this.milestoneRepository.updateById(id, updates);
    }
    /**
         * Delete a milestone by ID.
         * @param id milestone ID to delete
         */
    async deleteMilestone(id) {
        return this.milestoneRepository.deleteById(id);
    }
};
exports.MilestoneController = MilestoneController;
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.Example)([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            pool_id: "550e8400-e29b-41d4-a716-446655440001",
            title: "Collect 50% of target funds",
            description: "Complete the first funding milestone",
            target_date: new Date("2024-02-15"),
            status: "pending",
            required_approvals: 3,
            current_approvals: 2,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ]),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getMilestones", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}"),
    (0, tsoa_1.Example)({
        id: "550e8400-e29b-41d4-a716-446655440000",
        pool_id: "550e8400-e29b-41d4-a716-446655440001",
        title: "Collect 50% of target funds",
        description: "Complete the first funding milestone",
        target_date: new Date("2024-02-15"),
        status: "pending",
        required_approvals: 3,
        current_approvals: 2,
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    }),
    (0, tsoa_1.Response)(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getMilestoneById", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)("/"),
    (0, tsoa_1.Example)({
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Collect 50% of target funds",
        description: "First major funding milestone",
        target_date: new Date("2024-02-15"),
        required_approvals: 3
    }),
    (0, tsoa_1.Response)(201, "Milestone created successfully"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid milestone data or pool not found",
        statusCode: 400,
        name: "ValidationError"
    }),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.CreateMilestoneDto]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "createMilestone", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)("/{id}/vote"),
    (0, tsoa_1.Example)({ approve: true }),
    (0, tsoa_1.Response)(200, "Vote recorded successfully"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid vote or milestone already completed",
        statusCode: 400,
        name: "ValidationError"
    }),
    (0, tsoa_1.Response)(403, "Forbidden", {
        message: "Only pool members can vote on milestones",
        statusCode: 403,
        name: "ForbiddenError"
    }),
    (0, tsoa_1.Response)(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dtos_1.VoteMilestoneDto, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "voteOnMilestone", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Put)("/{id}"),
    (0, tsoa_1.Response)(200, "Milestone updated successfully"),
    (0, tsoa_1.Response)(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "updateMilestone", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Delete)("/{id}"),
    (0, tsoa_1.Response)(200, "Milestone deleted successfully"),
    (0, tsoa_1.Response)(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "deleteMilestone", null);
exports.MilestoneController = MilestoneController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("milestones"),
    (0, tsoa_1.Tags)("Milestones"),
    __metadata("design:paramtypes", [])
], MilestoneController);
//# sourceMappingURL=milestone.js.map