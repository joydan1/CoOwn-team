import { Service } from "typedi";
import Pool from "../models/pool";
import PoolMember from "../models/poolMember";
import Contribution from "../models/contribution";
import User from "../models/user";
import { PoolRepository } from "../repositories/pool";
import { PoolMemberRepository } from "../repositories/poolMember";
import { ContributionRepository } from "../repositories/contribution";
import { UserRepository } from "../repositories/user";
import { PropertyRepository } from "../repositories/property";
import { AppError } from "../common/errors/AppError";
import { randomUUID } from 'crypto';
import {
    CreatePoolDto,
    JoinPoolDto,
    PoolDashboardDto,
    PoolDto,
    PoolMemberDto
} from "../dtos";
import { variables } from "../config/env";

type AddContributionDto = Omit<Partial<import("../dtos").ContributionDto>, 'id' | 'created_at' | 'updatedAt'> & {
    pool_id: string;
    user_id: string;
    amount: number;
    currency?: string;
    fx_rate?: number;
    payment_ref?: string;
};

export { CreatePoolDto, JoinPoolDto, PoolDashboardDto, PoolDto, PoolMemberDto };

@Service()
export default class PoolService {
    constructor(
        private poolRepository: PoolRepository,
        private poolMemberRepository: PoolMemberRepository,
        private contributionRepository: ContributionRepository,
        private userRepository: UserRepository,
        private propertyRepository: PropertyRepository
    ) {}

    public async getPoolMembers(poolId: string): Promise<PoolMember[]> {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool) throw new AppError("Pool not found");

        return this.poolMemberRepository.findByPool(poolId);
    }

    public async getPoolUsers(poolId: string): Promise<User[]> {
        const members = await this.getPoolMembers(poolId);
        return members.map((member) => member.user);
    }

    private readonly baseInviteUrl = variables.pool as string;

    public getPoolInviteLink(poolId: string): string {
        return `${this.baseInviteUrl}/${poolId}/join`;
    }
 
    public async createPool(creatorId: string, data: CreatePoolDto): Promise<Pool> {
        const property = await this.propertyRepository.findById(data.property_id);
        if (!property) throw new AppError("Property not found");

        const creator = await this.userRepository.findById(creatorId);
        if (!creator) throw new AppError("Creator not found");

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

    public async joinPool(poolId: string, userId: string, joinData?: JoinPoolDto): Promise<PoolMember> {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool) throw new AppError("Pool not found");

        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError("User not found");

        const existingMember = await this.poolMemberRepository.findByPool(poolId);
        const isMember = existingMember.some(m => m.user_id === userId);
        if (isMember) throw new AppError("User is already a member of this pool");

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

    public async updateJoinDetails(poolId: string, userId: string, joinData: JoinPoolDto): Promise<PoolMember> {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool) throw new AppError("Pool not found");

        const members = await this.poolMemberRepository.findByPool(poolId);
        const member = members.find(m => m.user_id === userId);
        if (!member) throw new AppError("User is not a member of this pool");

        member.declared_amount = joinData.investment_amount;
        await this.poolMemberRepository.updateById(member.id, { declared_amount: joinData.investment_amount });

        await this.recalculateOwnershipPercentages(poolId);

        return member;
    }

    public async addContribution(data: AddContributionDto): Promise<Contribution> {
        const pool = await this.poolRepository.findById(data.pool_id);
        if (!pool) throw new AppError("Pool not found");

        const user = await this.userRepository.findById(data.user_id);
        if (!user) throw new AppError("User not found");

        const members = await this.poolMemberRepository.findByPool(data.pool_id);
        const member = members.find(m => m.user_id === data.user_id);
        if (!member) throw new AppError("User is not a member of this pool");

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

    private async recalculateOwnershipPercentages(poolId: string): Promise<void> {
        const members = await this.poolMemberRepository.findByPool(poolId);
        const totalRaised = members.reduce((sum, m) => sum + m.paid_amount, 0);

        if (totalRaised === 0) return;

        for (const member of members) {
            const ownershipPct = (member.paid_amount / totalRaised) * 100;
            await this.poolMemberRepository.updateById(member.id, { ownership_pct: ownershipPct });
        }
    }

    public async getPoolDashboard(poolId: string): Promise<PoolDashboardDto> {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool) throw new AppError("Pool not found");

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
        } as PoolDashboardDto;
    }

    public async togglePublic(poolId: string, creatorId: string, isPublic: boolean): Promise<Pool> {
        const pool = await this.poolRepository.findById(poolId);
        if (!pool) throw new AppError("Pool not found");
        if (pool.creator_id !== creatorId) throw new AppError("Only pool creator can toggle public status");

        const updated = await this.poolRepository.updateById(poolId, { is_public: isPublic });
        if (!updated) throw new AppError("Failed to update pool");
        return updated;
    }

    public async getPools(filter: Record<string, unknown> = {}): Promise<Pool[]> {
        return this.poolRepository.listAll(filter);
    }

    public async getPoolById(id: string): Promise<Pool | null> {
        return this.poolRepository.findById(id);
    }

    public async getPublicPools(): Promise<Pool[]> {
        return this.poolRepository.findPublic();
    }

    public async updatePool(id: string, updates: Partial<Pool>): Promise<Pool | null> {
        return this.poolRepository.updateById(id, updates);
    }

    public async deletePool(id: string): Promise<boolean> {
        return this.poolRepository.deleteById(id);
    }
}
