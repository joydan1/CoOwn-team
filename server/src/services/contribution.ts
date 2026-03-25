import { Service } from "typedi";
import Contribution from "../models/contribution";
import { ContributionRepository } from "../repositories/contribution";
import { PoolRepository } from "../repositories/pool";
import { UserRepository } from "../repositories/user";
import { AppError } from "../common/errors/AppError";
import PoolService from "./pool";
import { variables } from "../config/env";
import { PaymentDto, InterswitchPaymentDto } from "../dtos";
import { verifyInterswitchTransaction } from "../common/interswitch";

@Service()
export default class ContributionService {

    constructor(
        private contributionRepository: ContributionRepository,
        private poolRepository: PoolRepository,
        private userRepository: UserRepository,
        private poolService: PoolService
    ) {}

    public async processPayment(data: PaymentDto): Promise<Contribution> {
        const pool = await this.poolRepository.findById(data.pool_id);
        if (!pool) throw new AppError("Pool not found");

        const user = await this.userRepository.findById(data.user_id);
        if (!user) throw new AppError("User not found");

        let fxRate: number | undefined;
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

    public async verifyAndRecordContribution(data: InterswitchPaymentDto): Promise<Contribution> {
        const merchantCode = data.merchant_code || variables.interswitch.merchantCode;

        const verified = await verifyInterswitchTransaction(
            merchantCode,
            data.payment_ref,
            data.amount
        );

        if (!verified || verified.ResponseCode !== "00") {
            throw new AppError("Interswitch payment not successful", 400);
        }

        const expectedAmount = Number(data.amount);
        const verifiedAmount = Number(verified.Amount);

        if (expectedAmount !== verifiedAmount) {
            throw new AppError("Payment amount does not match Interswitch verification", 400);
        }

        const contributionAmount = Number(data.amount) / 100; // convert kobo to Naira for pool

        // skip strict currency if unavailable from response
        if (data.currency && verified.CurrencyCode && data.currency.toUpperCase() !== verified.CurrencyCode.toString().toUpperCase()) {
            throw new AppError("Payment currency does not match Interswitch verification", 400);
        }

        return this.poolService.addContribution({
            pool_id: data.pool_id,
            user_id: data.user_id,
            amount: contributionAmount,
            currency: data.currency || "NGN",
            payment_ref: verified.PaymentReference || data.payment_ref
        });
    }

    private async getLiveFxRate(fromCurrency: string): Promise<number> {
        const mockRates = {
            'GBP': 1800,
            'USD': 1500,
            'EUR': 1600
        };
        return mockRates[fromCurrency as keyof typeof mockRates] || 1500;
    }

    public async getContributionsByPool(poolId: string): Promise<Contribution[]> {
        return this.contributionRepository.findByPool(poolId);
    }

    public async getContributionsByUser(userId: string): Promise<Contribution[]> {
        return this.contributionRepository.findByUser(userId);
    }

}