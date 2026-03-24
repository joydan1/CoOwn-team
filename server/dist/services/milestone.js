"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const milestone_1 = require("../repositories/milestone");
const pool_1 = require("../repositories/pool");
const poolMember_1 = require("../repositories/poolMember");
const AppError_1 = require("../common/errors/AppError");
let MilestoneService = class MilestoneService {
    constructor(milestoneRepository, poolRepository, poolMemberRepository) {
        this.milestoneRepository = milestoneRepository;
        this.poolRepository = poolRepository;
        this.poolMemberRepository = poolMemberRepository;
    }
    async createMilestone(data) {
        const pool = await this.poolRepository.findById(data.pool_id);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        return this.milestoneRepository.create({
            pool_id: data.pool_id,
            title: data.title,
            description: data.description,
            target_date: data.target_date,
            status: 'pending',
            votes_required: data.required_approvals,
            votes_received: 0
        });
    }
    async voteOnMilestone(data) {
        const milestone = await this.milestoneRepository.findById(data.milestone_id);
        if (!milestone)
            throw new AppError_1.AppError("Milestone not found");
        const members = await this.poolMemberRepository.findByPool(milestone.pool_id);
        const isMember = members.some(m => m.user_id === data.user_id);
        if (!isMember)
            throw new AppError_1.AppError("User is not a member of this pool");
        if (milestone.status === 'completed')
            throw new AppError_1.AppError("Milestone already completed");
        if (data.approve) {
            milestone.votes_received += 1;
        }
        if (milestone.votes_received >= milestone.votes_required) {
            milestone.status = 'completed';
            milestone.completed_at = new Date();
        }
        const updated = await this.milestoneRepository.updateById(data.milestone_id, {
            votes_received: milestone.votes_received,
            status: milestone.status,
            completed_at: milestone.completed_at
        });
        if (!updated)
            throw new AppError_1.AppError("Failed to vote on milestone");
        return updated;
    }
    async getMilestonesByPool(poolId) {
        return this.milestoneRepository.findByPool(poolId);
    }
};
MilestoneService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [milestone_1.MilestoneRepository,
        pool_1.PoolRepository,
        poolMember_1.PoolMemberRepository])
], MilestoneService);
exports.default = MilestoneService;
//# sourceMappingURL=milestone.js.map