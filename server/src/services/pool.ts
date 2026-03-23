// import { Service } from "typedi";
// import Pool from "../models/pool";
// import PoolMember from "../models/poolMember";
// import Contribution from "../models/contribution";
// import { PoolRepository } from "../repositories/pool";
// import { PoolMemberRepository } from "../repositories/poolMember";
// import { ContributionRepository } from "../repositories/contribution";
// import { UserRepository } from "../repositories/user";
// import { PropertyRepository } from "../repositories/property";
// import { AppError } from "../common/errors/AppError";
// import { randomUUID } from 'crypto';
// import {
//     CreatePoolDto,
//     JoinPoolDto,
//     ContributionDto,
//     PoolDashboardDto,
//     PoolDto,
//     PoolMemberDto,
//     ContributionDto as ContributionDtoType
// } from "../dtos";

// export { CreatePoolDto, JoinPoolDto, ContributionDto, PoolDashboardDto, PoolDto, PoolMemberDto };

// @Service()
// export default class PoolService {

//     constructor(
//         private poolRepository: PoolRepository,
//         private poolMemberRepository: PoolMemberRepository,
//         private contributionRepository: ContributionRepository,
//         private userRepository: UserRepository,
//         private propertyRepository: PropertyRepository
//     ) {}

//     public async createPool(creatorId: string, data: CreatePoolDto): Promise<Pool> {
//         // Validate property exists
//         const property = await this.propertyRepository.findById(data.property_id);
//         if (!property) throw new AppError("Property not found");

//         // Validate creator exists
//         const creator = await this.userRepository.findById(creatorId);
//         if (!creator) throw new AppError("Creator not found");

//         // Generate unique shareable link (for future use in email/SMS invites)
//         const shareableLink = `https://coown.app/pool/${randomUUID()}`;
//         void shareableLink; // Mark as intentionally unused for now
//         const poolData = {
//             ...data,
//             creator_id: creatorId,
//             raised_amount: 0,
//             status: 'active',
//             is_public: data.is_public || false
//         };

//         const pool = await this.poolRepository.create(poolData);

//         // Add creator as first member
//         await this.poolMemberRepository.create({
//             pool_id: pool.id,
//             user_id: creatorId,
//             declared_amount: 0, // Creator can contribute later
//             paid_amount: 0,
//             ownership_pct: 0
//         });

//         return pool;
//     }

//     public async joinPool(data: JoinPoolDto): Promise<PoolMember> {
//         const pool = await this.poolRepository.findById(data.pool_id);
//         if (!pool) throw new AppError("Pool not found");

//         const user = await this.userRepository.findById(data.user_id);
//         if (!user) throw new AppError("User not found");

//         // Check if already a member
//         const existingMember = await this.poolMemberRepository.findByPool(data.pool_id);
//         const isMember = existingMember.some(m => m.user_id === data.user_id);
//         if (isMember) throw new AppError("User is already a member of this pool");

//         const member = await this.poolMemberRepository.create({
//             pool_id: data.pool_id,
//             user_id: data.user_id,
//             declared_amount: data.declared_amount,
//             paid_amount: 0,
//             ownership_pct: 0
//         });

//         // Recalc percentages
//         await this.recalculateOwnershipPercentages(data.pool_id);

//         return member;
//     }

//     public async addContribution(data: ContributionDto): Promise<Contribution> {
//         const pool = await this.poolRepository.findById(data.pool_id);
//         if (!pool) throw new AppError("Pool not found");

//         const user = await this.userRepository.findById(data.user_id);
//         if (!user) throw new AppError("User not found");

//         // Check if user is member
//         const members = await this.poolMemberRepository.findByPool(data.pool_id);
//         const member = members.find(m => m.user_id === data.user_id);
//         if (!member) throw new AppError("User is not a member of this pool");

//         const contribution = await this.contributionRepository.create({
//             pool_id: data.pool_id,
//             user_id: data.user_id,
//             amount: data.amount,
//             currency: data.currency || 'NGN',
//             fx_rate: data.fx_rate,
//             payment_ref: data.payment_ref
//         });

//         // Update member's paid_amount
//         member.paid_amount += data.amount;
//         await this.poolMemberRepository.updateById(member.id, { paid_amount: member.paid_amount });

//         // Update pool raised_amount
//         pool.raised_amount += data.amount;
//         await this.poolRepository.updateById(pool.id, { raised_amount: pool.raised_amount });

//         // Recalc percentages
//         await this.recalculateOwnershipPercentages(data.pool_id);

//         return contribution;
//     }

//     private async recalculateOwnershipPercentages(poolId: string): Promise<void> {
//         const members = await this.poolMemberRepository.findByPool(poolId);
//         const totalRaised = members.reduce((sum, m) => sum + m.paid_amount, 0);

//         if (totalRaised === 0) return;

//         for (const member of members) {
//             const ownershipPct = (member.paid_amount / totalRaised) * 100;
//             await this.poolMemberRepository.updateById(member.id, { ownership_pct: ownershipPct });
//         }
//     }

//     public async getPoolDashboard(poolId: string): Promise<Record<string, unknown>> {
//         const pool = await this.poolRepository.findById(poolId);
//         if (!pool) throw new AppError("Pool not found");

//         const members = await this.poolMemberRepository.findByPool(poolId);
//         const contributions = await this.contributionRepository.findByPool(poolId);

//         const progress = pool.target_amount > 0 ? (pool.raised_amount / pool.target_amount) * 100 : 0;

//         return {
//             pool,
//             members,
//             contributions,
//             progress,
//             totalRaised: pool.raised_amount,
//             targetAmount: pool.target_amount,
//             daysRemaining: pool.deadline ? Math.ceil((pool.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
//         };
//     }

//     public async togglePublic(poolId: string, creatorId: string, isPublic: boolean): Promise<Pool> {
//         const pool = await this.poolRepository.findById(poolId);
//         if (!pool) throw new AppError("Pool not found");
//         if (pool.creator_id !== creatorId) throw new AppError("Only pool creator can toggle public status");

//         const updated = await this.poolRepository.updateById(poolId, { is_public: isPublic });
//         if (!updated) throw new AppError("Failed to update pool");
//         return updated;
//     }

// }