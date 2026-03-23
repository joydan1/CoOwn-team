// import { Service } from "typedi";
// import Milestone from "../models/milestone";
// import { MilestoneRepository } from "../repositories/milestone";
// import { PoolRepository } from "../repositories/pool";
// import { PoolMemberRepository } from "../repositories/poolMember";
// import { AppError } from "../common/errors/AppError";
// import { CreateMilestoneDto } from "../dtos";

// export interface VoteDto {
//     milestone_id: string;
//     user_id: string;
//     approve: boolean;
// }

// @Service()
// export default class MilestoneService {

//     constructor(
//         private milestoneRepository: MilestoneRepository,
//         private poolRepository: PoolRepository,
//         private poolMemberRepository: PoolMemberRepository
//     ) {}

//     public async createMilestone(data: CreateMilestoneDto): Promise<Milestone> {
//         const pool = await this.poolRepository.findById(data.pool_id);
//         if (!pool) throw new AppError("Pool not found");

//         return this.milestoneRepository.create({
//             pool_id: data.pool_id,
//             title: data.title,
//             status: 'pending',
//             required_approvals: data.required_approvals,
//             current_approvals: 0
//         });
//     }

//     public async voteOnMilestone(data: VoteDto): Promise<Milestone> {
//         const milestone = await this.milestoneRepository.findById(data.milestone_id);
//         if (!milestone) throw new AppError("Milestone not found");

//         // Check if user is member of the pool
//         const members = await this.poolMemberRepository.findByPool(milestone.pool_id);
//         const isMember = members.some(m => m.user_id === data.user_id);
//         if (!isMember) throw new AppError("User is not a member of this pool");

//         if (data.approve) {
//             milestone.votes_received += 1;
//         }

//         // Check if milestone is approved
//         if (milestone.votes_received >= milestone.votes_required) {
//             milestone.status = 'completed';
//             milestone.completed_at = new Date();
//         }

//         const updated = await this.milestoneRepository.updateById(data.milestone_id, {
//             votes_received: milestone.votes_received,
//             status: milestone.status,
//             completed_at: milestone.completed_at
//         });
//         if (!updated) throw new AppError("Failed to vote on milestone");
//         return updated;
//     }

//     public async getMilestonesByPool(poolId: string): Promise<Milestone[]> {
//         return this.milestoneRepository.findByPool(poolId);
//     }

// }