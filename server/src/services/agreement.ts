// import { Service } from "typedi";
// import Agreement from "../models/agreement";
// import PoolMember from "../models/poolMember";
// import Pool from "../models/pool";
// import { AgreementRepository } from "../repositories/agreement";
// import { PoolRepository } from "../repositories/pool";
// import { PoolMemberRepository } from "../repositories/poolMember";
// import { AppError } from "../common/errors/AppError";

// @Service()
// export default class AgreementService {

//     constructor(
//         private agreementRepository: AgreementRepository,
//         private poolRepository: PoolRepository,
//         private poolMemberRepository: PoolMemberRepository
//     ) {}

//     public async generateAgreement(poolId: string): Promise<Agreement> {
//         const pool = await this.poolRepository.findById(poolId);
//         if (!pool) throw new AppError("Pool not found");

//         const members = await this.poolMemberRepository.findByPool(poolId);
//         if (members.length === 0) throw new AppError("Pool has no members");

//         // Check if all members have contributed (paid_amount > 0)
//         const allContributed = members.every(m => m.paid_amount > 0);
//         if (!allContributed) throw new AppError("All members must have contributed before generating agreement");

//         // Generate agreement content (mock PDF URL)
//         const contentUrl = `https://coown-agreements.com/${poolId}.pdf`; // Mock URL

//         const agreement = await this.agreementRepository.create({
//             pool_id: poolId,
//             content_url: contentUrl,
//             signed_by: [] // Initially empty
//         });

//         return agreement;
//     }

//     private generateAgreementText(pool: Pool, members: PoolMember[]): string {
//         // Mock agreement text generation
//         let text = `CO-OWNERSHIP AGREEMENT

// Pool: ${pool.name}
// Property: ${pool.property.title}
// Target Amount: ₦${pool.target_amount}

// Members:
// `;

//         members.forEach(member => {
//             text += `- ${member.user.firstName} ${member.user.lastName}: ${member.ownership_pct}% ownership\n`;
//         });

//         text += `
// This agreement is legally binding and outlines the co-ownership terms.
// Signatures required from all parties.
// `;

//         return text;
//     }

//     public async signAgreement(agreementId: string, userId: string): Promise<Agreement> {
//         const agreement = await this.agreementRepository.findById(agreementId);
//         if (!agreement) throw new AppError("Agreement not found");

//         // Check if user is member of the pool
//         const members = await this.poolMemberRepository.findByPool(agreement.pool_id);
//         const isMember = members.some(m => m.user_id === userId);
//         if (!isMember) throw new AppError("User is not a member of this pool");

//         // Add to signed_by if not already signed
//         const signedBy = agreement.signed_by || [];
//         if (!signedBy.includes(userId)) {
//             signedBy.push(userId);
//             const updated = await this.agreementRepository.updateById(agreementId, { signed_by: signedBy });
//             if (!updated) throw new AppError("Failed to sign agreement");
//             return updated;
//         }

//         return agreement;
//     }

//     public async getAgreementByPool(poolId: string): Promise<Agreement | null> {
//         const agreements = await this.agreementRepository.findByPool(poolId);
//         return agreements[0] || null; // Return first agreement
//     }

// }