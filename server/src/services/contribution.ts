import { Service } from "typedi";
import Contribution from "../models/contribution";
import { ContributionRepository } from "../repositories/contribution";
import { PoolRepository } from "../repositories/pool";
import { PoolMemberRepository } from "../repositories/poolMember";
import { UserRepository } from "../repositories/user";
import { AppError } from "../common/errors/AppError";
import PoolService from "./pool";
import { variables } from "../config/env";
import { PaymentDto, InterswitchPaymentDto, ContributionDto } from "../dtos";
import { verifyInterswitchTransaction } from "../common/interswitch";
import { getIO } from "../config/websocket";

@Service()
export default class ContributionService {

    constructor(
        private contributionRepository: ContributionRepository,
        private poolRepository: PoolRepository,
        private poolMemberRepository: PoolMemberRepository,
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

        // Interswitch may return CurrencyCode as ISO string (e.g. "NGN") or numeric minor code (e.g. 566).
        // Normalize both before comparing so verification doesn't fail unnecessarily.
        const normalizeCurrency = (value: unknown): string | null => {
            if (value === null || value === undefined) return null

            // If it's already a known ISO-like string, keep it.
            if (typeof value === "string") {
                const v = value.trim().toUpperCase()
                if (["NGN", "USD", "GBP", "EUR"].includes(v)) return v

                // Handle numeric strings like "566"
                const asNum = Number(v)
                if (!Number.isNaN(asNum)) return normalizeCurrency(asNum)
                return v
            }

            if (typeof value === "number") {
                const code = value
                const map: Record<number, string> = {
                    566: "NGN",
                    840: "USD",
                    826: "GBP",
                    978: "EUR",
                }
                return map[code] ?? String(code)
            }

            return String(value)
        }

        const expectedCurrency = normalizeCurrency(data.currency)
        const actualCurrency = normalizeCurrency(verified.CurrencyCode)

        // Skip strict currency check if Interswitch didn't return a usable currency value.
        if (expectedCurrency && actualCurrency && expectedCurrency !== actualCurrency) {
            throw new AppError("Payment currency does not match Interswitch verification", 400);
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
            const io = getIO();
            io.to(data.pool_id).emit("contributionAdded", {
                pool_id: data.pool_id,
                user_id: data.user_id,
                amount: contributionAmount,
                currency: data.currency || "NGN",
                timestamp: new Date()
            });

        } catch (error) {
            console.error("Failed to emit contribution event:", error);
        }

        return contribution;
    }

    private async getLiveFxRate(fromCurrency: string): Promise<number> {
        const mockRates = {
            'GBP': 1800,
            'USD': 1500,
            'EUR': 1600
        };
        return mockRates[fromCurrency as keyof typeof mockRates] || 1500;
    }

    public async getContributionsByPool(poolId: string): Promise<ContributionDto[]> {
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
        })) as ContributionDto[];
    }

    public async getContributionsByUser(userId: string): Promise<ContributionDto[]> {
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
        })) as ContributionDto[];
    }

}