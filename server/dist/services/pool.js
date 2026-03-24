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
exports.PoolMemberDto = exports.PoolDto = exports.PoolDashboardDto = exports.JoinPoolDto = exports.CreatePoolDto = void 0;
const typedi_1 = require("typedi");
const pool_1 = require("../repositories/pool");
const poolMember_1 = require("../repositories/poolMember");
const contribution_1 = require("../repositories/contribution");
const user_1 = require("../repositories/user");
const property_1 = require("../repositories/property");
const AppError_1 = require("../common/errors/AppError");
const dtos_1 = require("../dtos");
Object.defineProperty(exports, "CreatePoolDto", { enumerable: true, get: function () { return dtos_1.CreatePoolDto; } });
Object.defineProperty(exports, "JoinPoolDto", { enumerable: true, get: function () { return dtos_1.JoinPoolDto; } });
Object.defineProperty(exports, "PoolDashboardDto", { enumerable: true, get: function () { return dtos_1.PoolDashboardDto; } });
Object.defineProperty(exports, "PoolDto", { enumerable: true, get: function () { return dtos_1.PoolDto; } });
Object.defineProperty(exports, "PoolMemberDto", { enumerable: true, get: function () { return dtos_1.PoolMemberDto; } });
const env_1 = require("../config/env");
let PoolService = class PoolService {
    constructor(poolRepository, poolMemberRepository, contributionRepository, userRepository, propertyRepository) {
        this.poolRepository = poolRepository;
        this.poolMemberRepository = poolMemberRepository;
        this.contributionRepository = contributionRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.baseInviteUrl = env_1.variables.pool;
    }
    async getPoolMembers(poolId) {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        return this.poolMemberRepository.findByPool(poolId);
    }
    async getPoolUsers(poolId) {
        const members = await this.getPoolMembers(poolId);
        return members.map((member) => member.user);
    }
    getPoolInviteLink(poolId) {
        return `${this.baseInviteUrl}/${poolId}/join`;
    }
    async createPool(creatorId, data) {
        const property = await this.propertyRepository.findById(data.property_id);
        if (!property)
            throw new AppError_1.AppError("Property not found");
        const creator = await this.userRepository.findById(creatorId);
        if (!creator)
            throw new AppError_1.AppError("Creator not found");
        const poolData = {
            ...data,
            creator_id: creatorId,
            raised_amount: 0,
            status: 'active',
            is_public: data.is_public || false
        };
        const pool = await this.poolRepository.create(poolData);
        await this.poolMemberRepository.create({
            pool_id: pool.id,
            user_id: creatorId,
            declared_amount: 0,
            paid_amount: 0,
            ownership_pct: 0
        });
        return pool;
    }
    async joinPool(poolId, userId, joinData) {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        const user = await this.userRepository.findById(userId);
        if (!user)
            throw new AppError_1.AppError("User not found");
        const existingMember = await this.poolMemberRepository.findByPool(poolId);
        const isMember = existingMember.some(m => m.user_id === userId);
        if (isMember)
            throw new AppError_1.AppError("User is already a member of this pool");
        const declaredAmount = joinData?.investment_amount ?? 0;
        const currency = joinData?.currency ?? 'NGN';
        const member = await this.poolMemberRepository.create({
            pool_id: poolId,
            user_id: userId,
            declared_amount: declaredAmount,
            paid_amount: 0,
            ownership_pct: 0
        });
        await this.recalculateOwnershipPercentages(poolId);
        return member;
    }
    async updateJoinDetails(poolId, userId, joinData) {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        const members = await this.poolMemberRepository.findByPool(poolId);
        const member = members.find(m => m.user_id === userId);
        if (!member)
            throw new AppError_1.AppError("User is not a member of this pool");
        member.declared_amount = joinData.investment_amount;
        await this.poolMemberRepository.updateById(member.id, { declared_amount: joinData.investment_amount });
        await this.recalculateOwnershipPercentages(poolId);
        return member;
    }
    async addContribution(data) {
        const pool = await this.poolRepository.findById(data.pool_id);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        const user = await this.userRepository.findById(data.user_id);
        if (!user)
            throw new AppError_1.AppError("User not found");
        const members = await this.poolMemberRepository.findByPool(data.pool_id);
        const member = members.find(m => m.user_id === data.user_id);
        if (!member)
            throw new AppError_1.AppError("User is not a member of this pool");
        const contribution = await this.contributionRepository.create({
            pool_id: data.pool_id,
            user_id: data.user_id,
            amount: data.amount,
            currency: data.currency || 'NGN',
            fx_rate: data.fx_rate,
            payment_ref: data.payment_ref
        });
        member.paid_amount += data.amount;
        await this.poolMemberRepository.updateById(member.id, { paid_amount: member.paid_amount });
        pool.raised_amount += data.amount;
        await this.poolRepository.updateById(pool.id, { raised_amount: pool.raised_amount });
        await this.recalculateOwnershipPercentages(data.pool_id);
        return contribution;
    }
    async recalculateOwnershipPercentages(poolId) {
        const members = await this.poolMemberRepository.findByPool(poolId);
        const totalRaised = members.reduce((sum, m) => sum + m.paid_amount, 0);
        if (totalRaised === 0)
            return;
        for (const member of members) {
            const ownershipPct = (member.paid_amount / totalRaised) * 100;
            await this.poolMemberRepository.updateById(member.id, { ownership_pct: ownershipPct });
        }
    }
    async getPoolDashboard(poolId) {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        const members = await this.poolMemberRepository.findByPool(poolId);
        const contributions = await this.contributionRepository.findByPool(poolId);
        const progress = pool.target_amount > 0 ? (pool.raised_amount / pool.target_amount) * 100 : 0;
        // Ensure deadline is a Date object before calling getTime()
        const deadlineDate = pool.deadline ? new Date(pool.deadline) : null;
        const daysRemaining = deadlineDate && deadlineDate instanceof Date && !isNaN(deadlineDate.getTime())
            ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
        return {
            pool,
            members,
            contributions,
            progress,
            totalRaised: pool.raised_amount,
            targetAmount: pool.target_amount,
            daysRemaining
        };
    }
    async togglePublic(poolId, creatorId, isPublic) {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        if (pool.creator_id !== creatorId)
            throw new AppError_1.AppError("Only pool creator can toggle public status");
        const updated = await this.poolRepository.updateById(poolId, { is_public: isPublic });
        if (!updated)
            throw new AppError_1.AppError("Failed to update pool");
        return updated;
    }
    async getPools(filter = {}) {
        return this.poolRepository.listAll(filter);
    }
    async getPoolById(id) {
        return this.poolRepository.findById(id);
    }
    async getPublicPools() {
        return this.poolRepository.findPublic();
    }
    async updatePool(id, updates) {
        return this.poolRepository.updateById(id, updates);
    }
    async deletePool(id) {
        return this.poolRepository.deleteById(id);
    }
};
PoolService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [pool_1.PoolRepository,
        poolMember_1.PoolMemberRepository,
        contribution_1.ContributionRepository,
        user_1.UserRepository,
        property_1.PropertyRepository])
], PoolService);
exports.default = PoolService;
//# sourceMappingURL=pool.js.map