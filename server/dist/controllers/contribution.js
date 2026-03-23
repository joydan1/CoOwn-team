// import Container, { Service } from "typedi";
// import ContributionService from "../services/contribution";
// import { ContributionRepository } from "../repositories/contribution";
// import {
//     Controller,
//     Route,
//     Get,
//     Post,
//     Put,
//     Delete,
//     Path,
//     Body,
//     Query,
//     Security,
//     Request,
//     Tags,
//     Response,
//     Example
// } from "tsoa";
// import Contribution from "../models/contribution";
// import { Request as ExpressRequest } from 'express';
// import { AppError } from "../common/errors/AppError";
// import { ContributionDto, PaymentDto, ErrorResponseDto } from "../dtos";
// interface AuthenticatedRequest extends ExpressRequest {
//     user?: { id: string };
// }
// @Service()
// @Route("contributions")
// @Tags("Contributions")
// export class ContributionController extends Controller {
//     private contributionService: ContributionService;
//     private contributionRepository: ContributionRepository;
//     constructor(){
//         super();
//         this.contributionService = Container.get(ContributionService);
//         this.contributionRepository = Container.get(ContributionRepository);
//     }
//     @Security("jwt")
//     @Get("/")
//     @Summary("Get contributions with optional filters")
//     @Description("Retrieve contributions filtered by pool or user. If no filters provided, returns all contributions.")
//     @Example<ContributionDto[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             pool_id: "550e8400-e29b-41d4-a716-446655440001",
//             user_id: "550e8400-e29b-41d4-a716-446655440002",
//             amount: 50000,
//             currency: "USD",
//             fx_rate: 1500,
//             payment_ref: "PAY_123456789",
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     public async getContributions(
//         @Query() @Description("Filter by pool ID") poolId?: string,
//         @Query() @Description("Filter by user ID") userId?: string
//     ): Promise<ContributionDto[]> {
//         if (poolId) return this.contributionService.getContributionsByPool(poolId);
//         if (userId) return this.contributionService.getContributionsByUser(userId);
//         return this.contributionRepository.listAll({});
//     }
//     @Security("jwt")
//     @Get("/{id}")
//     @Summary("Get contribution by ID")
//     @Description("Retrieve detailed information about a specific contribution.")
//     @Example<ContributionDto>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         pool_id: "550e8400-e29b-41d4-a716-446655440001",
//         user_id: "550e8400-e29b-41d4-a716-446655440002",
//         amount: 50000,
//         currency: "USD",
//         fx_rate: 1500,
//         payment_ref: "PAY_123456789",
//         created_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<ErrorResponseDto>(404, "Contribution Not Found", {
//         message: "Contribution not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getContributionById(@Path() @Description("Contribution ID") id: string): Promise<ContributionDto | null> {
//         return this.contributionRepository.findById(id);
//     }
//     @Security("jwt")
//     @Post("/pay")
//     @Summary("Process a payment contribution")
//     @Description("Process a payment contribution to a co-ownership pool. Supports both local (NGN) and cross-border payments (USD, GBP, EUR) with automatic FX conversion.")
//     @Example<PaymentDto>({
//         pool_id: "550e8400-e29b-41d4-a716-446655440000",
//         amount: 50000,
//         currency: "USD"
//     })
//     @Response<ContributionDto>(201, "Payment processed successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid payment data or insufficient funds",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(404, "Pool Not Found", {
//         message: "Pool not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async processPayment(
//         @Body() @Description("Payment processing data") payment: PaymentDto,
//         @Request() req: AuthenticatedRequest
//     ): Promise<ContributionDto> {
//         const userId = req.user?.id;
//         if (!userId) throw new AppError("Unauthorized");
//         return this.contributionService.processPayment({
//             ...payment,
//             user_id: userId
//         });
//     }
//     @Security("jwt")
//     @Put("/{id}")
//     @Summary("Update contribution")
//     @Description("Update contribution details. Only certain fields can be updated after creation.")
//     @Response<ContributionDto>(200, "Contribution updated successfully")
//     @Response<ErrorResponseDto>(404, "Contribution Not Found", {
//         message: "Contribution not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async updateContribution(
//         @Path() @Description("Contribution ID") id: string,
//         @Body() @Description("Updated contribution data") updates: Partial<ContributionDto>
//     ): Promise<ContributionDto | null> {
//         return this.contributionRepository.updateById(id, updates);
//     }
//     @Security("jwt")
//     @Delete("/{id}")
//     @Summary("Delete contribution")
//     @Description("Delete a contribution record. This should be used carefully as it affects pool calculations.")
//     @Response<boolean>(200, "Contribution deleted successfully")
//     @Response<ErrorResponseDto>(404, "Contribution Not Found", {
//         message: "Contribution not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async deleteContribution(@Path() @Description("Contribution ID") id: string): Promise<boolean> {
//         return this.contributionRepository.deleteById(id);
//     }
// }
//# sourceMappingURL=contribution.js.map