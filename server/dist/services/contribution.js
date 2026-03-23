// import { Service } from "typedi";
// import Contribution from "../models/contribution";
// import { ContributionRepository } from "../repositories/contribution";
// import { PoolRepository } from "../repositories/pool";
// import { UserRepository } from "../repositories/user";
// import { AppError } from "../common/errors/AppError";
// import PoolService from "./pool";
// import { PaymentDto } from "../dtos";
// @Service()
// export default class ContributionService {
//     constructor(
//         // private contributionRepository: ContributionRepository,
//         private poolRepository: PoolRepository,
//         private userRepository: UserRepository,
//         private poolService: PoolService
//     ) {}
//     public async processPayment(data: PaymentDto): Promise<Contribution> {
//         const pool = await this.poolRepository.findById(data.pool_id);
//         if (!pool) throw new AppError("Pool not found");
//         const user = await this.userRepository.findById(data.user_id);
//         if (!user) throw new AppError("User not found");
//         let fxRate: number | undefined;
//         let finalAmount = data.amount;
//         if (data.paymentMethod === 'cross_border') {
//             // Mock FX conversion (GBP/USD to NGN)
//             // In real implementation, call Interswitch API
//             fxRate = await this.getLiveFxRate(data.currency || 'GBP');
//             finalAmount = data.amount * fxRate;
//         }
//         // Mock payment processing
//         // In real implementation, integrate with Interswitch
//         const paymentRef = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//         return this.poolService.addContribution({
//             pool_id: data.pool_id,
//             user_id: data.user_id,
//             amount: finalAmount,
//             currency: data.currency || 'NGN',
//             fx_rate: fxRate,
//             payment_ref: paymentRef
//         });
//     }
//     private async getLiveFxRate(fromCurrency: string): Promise<number> {
//         // Mock FX rates - in real implementation, call external API
//         const mockRates = {
//             'GBP': 1800, // 1 GBP = 1800 NGN
//             'USD': 1500, // 1 USD = 1500 NGN
//             'EUR': 1600  // 1 EUR = 1600 NGN
//         };
//         return mockRates[fromCurrency as keyof typeof mockRates] || 1500;
//     }
//     public async getContributionsByPool(poolId: string): Promise<Contribution[]> {
//         return this.contributionRepository.findByPool(poolId);
//     }
//     public async getContributionsByUser(userId: string): Promise<Contribution[]> {
//         return this.contributionRepository.findByUser(userId);
//     }
// }
//# sourceMappingURL=contribution.js.map