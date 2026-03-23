// import Container, { Service } from "typedi";
// import PoolService, { CreatePoolDto, JoinPoolDto, PoolDashboardDto } from "../services/pool";
// import { PoolRepository } from "../repositories/pool";
// import PoolMember from "../models/poolMember";
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
// import Pool from "../models/pool";
// import { Request as ExpressRequest } from 'express';
// import { AppError } from "../common/errors/AppError";
// import { PoolDto, PoolMemberDto, ErrorResponseDto } from "../dtos";
// interface AuthenticatedRequest extends ExpressRequest {
//     user?: { id: string };
// }
// @Service()
// @Route("pools")
// @Tags("Pools")
// export class PoolController extends Controller {
//     private poolService: PoolService;
//     private poolRepository: PoolRepository;
//     constructor(){
//         super();
//         this.poolService = Container.get(PoolService);
//         this.poolRepository = Container.get(PoolRepository);
//     }
//     @Get("/")
//     @Summary("Get all pools with optional filters")
//     @Description("Retrieve a list of co-ownership pools. Can filter by creator or public visibility.")
//     @Example<PoolDto[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             property: {
//                 id: "550e8400-e29b-41d4-a716-446655440001",
//                 title: "3 Bedroom Luxury Apartment in Lekki",
//                 location: "Lekki Phase 1, Lagos",
//                 price: 15000000,
//                 type: "apartment",
//                 status: "available"
//             },
//             creator: {
//                 id: "550e8400-e29b-41d4-a716-446655440002",
//                 firstName: "John",
//                 lastName: "Doe",
//                 email: "john.doe@example.com",
//                 role: "user",
//                 verified: true
//             },
//             name: "Lagos Luxury Apartment Co-Own",
//             target_amount: 5000000,
//             raised_amount: 3250000,
//             deadline: "2024-12-31",
//             status: "active",
//             is_public: false,
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid filter parameters",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     public async getPools(
//         @Query() @Description("Filter by creator ID") creatorId?: string,
//         @Query() @Description("Filter by public visibility") isPublic?: boolean
//     ): Promise<PoolDto[]> {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const filter: any = {};
//         if (creatorId) {
//             filter.where = { creator_id: creatorId };
//         }
//         if (isPublic !== undefined) {
//             if (!filter.where) filter.where = {};
//             filter.where.is_public = isPublic;
//         }
//         return this.poolRepository.listAll(filter);
//     }
//     @Security("jwt")
//     @Get("/{id}")
//     @Summary("Get pool by ID")
//     @Description("Retrieve detailed information about a specific co-ownership pool.")
//     @Example<PoolDto>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         property: {
//             id: "550e8400-e29b-41d4-a716-446655440001",
//             title: "3 Bedroom Luxury Apartment in Lekki",
//             location: "Lekki Phase 1, Lagos",
//             price: 15000000,
//             type: "apartment",
//             status: "available"
//         },
//         creator: {
//             id: "550e8400-e29b-41d4-a716-446655440002",
//             firstName: "John",
//             lastName: "Doe",
//             email: "john.doe@example.com",
//             role: "user",
//             verified: true
//         },
//         name: "Lagos Luxury Apartment Co-Own",
//         target_amount: 5000000,
//         raised_amount: 3250000,
//         deadline: "2024-12-31",
//         status: "active",
//         is_public: false,
//         created_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<ErrorResponseDto>(404, "Pool Not Found", {
//         message: "Pool not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getPoolById(@Path() @Description("Pool ID") id: string): Promise<PoolDto | null> {
//         return this.poolRepository.findById(id);
//     }
//     @Security("jwt")
//     @Post("/")
//     @Summary("Create a new co-ownership pool")
//     @Description("Create a new co-ownership pool for a property. The creator automatically becomes the first member.")
//     @Example<CreatePoolDto>({
//         property_id: "550e8400-e29b-41d4-a716-446655440000",
//         name: "Lagos Luxury Apartment Co-Own",
//         target_amount: 5000000,
//         deadline: "2024-12-31",
//         is_public: false
//     })
//     @Response<PoolDto>(201, "Pool Created Successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid pool data or property not found",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(401, "Unauthorized", {
//         message: "Authentication required",
//         statusCode: 401,
//         name: "UnauthorizedError"
//     })
//     public async createPool(
//         @Body() @Description("Pool creation data") pool: CreatePoolDto,
//         @Request() req: AuthenticatedRequest
//     ): Promise<PoolDto> {
//         const userId = req.user?.id;
//         if (!userId) throw new AppError("Unauthorized");
//         return this.poolService.createPool(userId, pool);
//     }
//     @Security("jwt")
//     @Post("/{id}/join")
//     @Summary("Join a co-ownership pool")
//     @Description("Join an existing co-ownership pool by declaring the amount you want to contribute.")
//     @Example<JoinPoolDto>({
//         declared_amount: 100000
//     })
//     @Response<PoolMemberDto>(201, "Successfully joined pool")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid amount or already a member",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(404, "Pool Not Found", {
//         message: "Pool not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async joinPool(
//         @Path() @Description("Pool ID to join") id: string,
//         @Body() @Description("Join pool data") joinData: JoinPoolDto,
//         @Request() req: AuthenticatedRequest
//     ): Promise<PoolMemberDto> {
//         const userId = req.user?.id;
//         if (!userId) throw new AppError("Unauthorized");
//         return this.poolService.joinPool({
//             pool_id: id,
//             user_id: userId,
//             declared_amount: joinData.declared_amount
//         });
//     }
//     @Security("jwt")
//     @Get("/{id}/dashboard")
//     @Summary("Get pool dashboard")
//     @Description("Get comprehensive dashboard data for a pool including progress, members, and contributions.")
//     @Example<PoolDashboardDto>({
//         pool: {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             property: {
//                 id: "550e8400-e29b-41d4-a716-446655440001",
//                 title: "3 Bedroom Luxury Apartment in Lekki",
//                 location: "Lekki Phase 1, Lagos",
//                 price: 15000000,
//                 type: "apartment",
//                 status: "available"
//             },
//             creator: {
//                 id: "550e8400-e29b-41d4-a716-446655440002",
//                 firstName: "John",
//                 lastName: "Doe",
//                 email: "john.doe@example.com",
//                 role: "user",
//                 verified: true
//             },
//             name: "Lagos Luxury Apartment Co-Own",
//             target_amount: 5000000,
//             raised_amount: 3250000,
//             deadline: "2024-12-31",
//             status: "active",
//             is_public: false,
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         },
//         members: [
//             {
//                 id: "550e8400-e29b-41d4-a716-446655440003",
//                 pool_id: "550e8400-e29b-41d4-a716-446655440000",
//                 user_id: "550e8400-e29b-41d4-a716-446655440002",
//                 declared_amount: 100000,
//                 paid_amount: 75000,
//                 ownership_pct: 15.5,
//                 joined_at: "2024-01-15T10:30:00Z",
//                 updatedAt: "2024-01-15T10:30:00Z"
//             }
//         ],
//         contributions: [],
//         progress: 65.0,
//         totalRaised: 3250000,
//         targetAmount: 5000000,
//         daysRemaining: 45
//     })
//     @Response<ErrorResponseDto>(404, "Pool Not Found", {
//         message: "Pool not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getPoolDashboard(@Path() @Description("Pool ID") id: string): Promise<PoolDashboardDto> {
//         return this.poolService.getPoolDashboard(id);
//     }
//     @Security("jwt")
//     @Put("/{id}/toggle-public")
//     @Summary("Toggle pool public visibility")
//     @Description("Toggle whether a pool is publicly visible. Only the pool creator can perform this action.")
//     @Example<{ is_public: boolean }>({
//         is_public: true
//     })
//     @Response<PoolDto>(200, "Pool visibility updated")
//     @Response<ErrorResponseDto>(403, "Forbidden", {
//         message: "Only pool creator can toggle public status",
//         statusCode: 403,
//         name: "ForbiddenError"
//     })
//     @Response<ErrorResponseDto>(404, "Pool Not Found", {
//         message: "Pool not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async togglePublic(
//         @Path() @Description("Pool ID") id: string,
//         @Body() @Description("Public visibility setting") data: { is_public: boolean },
//         @Request() req: AuthenticatedRequest
//     ): Promise<PoolDto> {
//         const userId = req.user?.id;
//         if (!userId) throw new AppError("Unauthorized");
//         return this.poolService.togglePublic(id, userId, data.is_public);
//     }
//     @Security("jwt")
//     @Put("/{id}")
//     public async updatePool(@Path() id: string, @Body() updates: Partial<Pool>): Promise<Pool | null> {
//         return this.poolRepository.updateById(id, updates);
//     }
//     @Security("jwt")
//     @Delete("/{id}")
//     public async deletePool(@Path() id: string): Promise<boolean> {
//         return this.poolRepository.deleteById(id);
//     }
//     @Get("/public")
//     public async getPublicPools(): Promise<Pool[]> {
//         return this.poolRepository.findPublic();
//     }
// }
//# sourceMappingURL=pool.js.map