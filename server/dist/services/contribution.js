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
const user_1 = require("../repositories/user");
const AppError_1 = require("../common/errors/AppError");
const pool_2 = __importDefault(require("./pool"));
let ContributionService = class ContributionService {
    constructor(contributionRepository, poolRepository, userRepository, poolService) {
        this.contributionRepository = contributionRepository;
        this.poolRepository = poolRepository;
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
    async getLiveFxRate(fromCurrency) {
        const mockRates = {
            'GBP': 1800,
            'USD': 1500,
            'EUR': 1600
        };
        return mockRates[fromCurrency] || 1500;
    }
    async getContributionsByPool(poolId) {
        return this.contributionRepository.findByPool(poolId);
    }
    async getContributionsByUser(userId) {
        return this.contributionRepository.findByUser(userId);
    }
};
ContributionService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [contribution_1.ContributionRepository,
        pool_1.PoolRepository,
        user_1.UserRepository,
        pool_2.default])
], ContributionService);
exports.default = ContributionService;
//# sourceMappingURL=contribution.js.map