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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const contribution_1 = require("../repositories/contribution");
const pool_1 = require("../repositories/pool");
const poolMember_1 = require("../repositories/poolMember");
const user_1 = require("../repositories/user");
const AppError_1 = require("../common/errors/AppError");
const pool_2 = __importDefault(require("./pool"));
const env_1 = require("../config/env");
const interswitch_1 = require("../common/interswitch");
const websocket_1 = require("../config/websocket");
let ContributionService = class ContributionService {
    constructor(contributionRepository, poolRepository, poolMemberRepository, userRepository, poolService) {
        this.contributionRepository = contributionRepository;
        this.poolRepository = poolRepository;
        this.poolMemberRepository = poolMemberRepository;
        this.userRepository = userRepository;
        this.poolService = poolService;
    }
    async processPayment(data) {
        const pool = await this.poolRepository.findById(data.pool_id);
        if (!pool)
            throw new AppError_1.AppError("Pool not found");
        const user = await this.userRepository.findById(data.user_id);
        if (!user)
            throw new AppError_1.AppError("User not found");
        let fxRate;
        let finalAmount = data.amount;
        if (data.paymentMethod === 'cross_border') {
            fxRate = await this.getLiveFxRate(data.currency || 'GBP');
            finalAmount = data.amount * fxRate;
        }
        const paymentRef = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const contribution = await this.poolService.addContribution({
            pool_id: data.pool_id,
            user_id: data.user_id,
            amount: finalAmount,
            currency: data.currency || 'NGN',
            fx_rate: fxRate,
            payment_ref: paymentRef
        });
        return contribution;
    }
    async verifyAndRecordContribution(data) {
        const merchantCode = data.merchant_code || env_1.variables.interswitch.merchantCode;
        const verified = await (0, interswitch_1.verifyInterswitchTransaction)(merchantCode, data.payment_ref, data.amount);
        if (!verified || verified.ResponseCode !== "00") {
            throw new AppError_1.AppError("Interswitch payment not successful", 400);
        }
        const expectedAmount = Number(data.amount);
        const verifiedAmount = Number(verified.Amount);
        if (expectedAmount !== verifiedAmount) {
            throw new AppError_1.AppError("Payment amount does not match Interswitch verification", 400);
        }
        const contributionAmount = Number(data.amount) / 100; // convert kobo to Naira for pool
        // skip strict currency if unavailable from response
        if (data.currency && verified.CurrencyCode && data.currency.toUpperCase() !== verified.CurrencyCode.toString().toUpperCase()) {
            throw new AppError_1.AppError("Payment currency does not match Interswitch verification", 400);
        }
        const contribution = await this.poolService.addContribution({
            pool_id: data.pool_id,
            user_id: data.user_id,
            amount: contributionAmount,
            currency: data.currency || "NGN",
            payment_ref: verified.PaymentReference || data.payment_ref
        });
        // Emit real-time update
        try {
            const io = (0, websocket_1.getIO)();
            io.to(data.pool_id).emit("contributionAdded", {
                pool_id: data.pool_id,
                user_id: data.user_id,
                amount: contributionAmount,
                currency: data.currency || "NGN",
                timestamp: new Date()
            });
        }
        catch (error) {
            console.error("Failed to emit contribution event:", error);
        }
        return contribution;
    }
    async getLiveFxRate(fromCurrency) {
        const mockRates = {
            'GBP': 1800,
            'USD': 1500,
            'EUR': 1600
        };
        return mockRates[fromCurrency] || 1500;
    }
    async getContributionsByPool(poolId) {
        const contributions = await this.contributionRepository.findByPool(poolId);
        // Get pool members to map ownership percentages
        const members = await this.poolService.getPoolMembers(poolId);
        const membershipMap = new Map(members.map(m => [m.user_id, m]));
        // Map contributions to include ownership_pct (ensure no NaN values)
        return contributions.map(contrib => ({
            id: contrib.id,
            pool_id: contrib.pool_id,
            user_id: contrib.user_id,
            amount: contrib.amount,
            currency: contrib.currency,
            ownership_pct: Number(membershipMap.get(contrib.user_id)?.ownership_pct) || 0,
            fx_rate: contrib.fx_rate,
            payment_ref: contrib.payment_ref,
            created_at: contrib.created_at,
            updatedAt: contrib.updatedAt
        }));
    }
    async getContributionsByUser(userId) {
        const contributions = await this.contributionRepository.findByUser(userId);
        // Fetch all memberships for this user
        const memberships = await this.poolMemberRepository.findByUser(userId);
        const membershipMap = new Map(memberships.map(m => [m.pool_id, m]));
        // Map contributions to include ownership_pct (ensure no NaN values)
        return contributions.map(contrib => ({
            id: contrib.id,
            pool_id: contrib.pool_id,
            user_id: contrib.user_id,
            amount: contrib.amount,
            currency: contrib.currency,
            ownership_pct: Number(membershipMap.get(contrib.pool_id)?.ownership_pct) || 0,
            fx_rate: contrib.fx_rate,
            payment_ref: contrib.payment_ref,
            created_at: contrib.created_at,
            updatedAt: contrib.updatedAt
        }));
    }
};
ContributionService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [contribution_1.ContributionRepository,
        pool_1.PoolRepository,
        poolMember_1.PoolMemberRepository,
        user_1.UserRepository,
        pool_2.default])
], ContributionService);
exports.default = ContributionService;
//# sourceMappingURL=contribution.js.map