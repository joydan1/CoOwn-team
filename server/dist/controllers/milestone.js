// import Container, { Service } from "typedi";
// import MilestoneService from "../services/milestone";
// import { MilestoneRepository } from "../repositories/milestone";
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
// import Milestone from "../models/milestone";
// import { Request as ExpressRequest } from 'express';
// import { AppError } from "../common/errors/AppError";
// import { MilestoneDto, CreateMilestoneDto, VoteMilestoneDto, ErrorResponseDto } from "../dtos";
// interface AuthenticatedRequest extends ExpressRequest {
//     user?: { id: string };
// }
// @Service()
// @Route("milestones")
// @Tags("Milestones")
// export class MilestoneController extends Controller {
//     private milestoneService: MilestoneService;
//     private milestoneRepository: MilestoneRepository;
//     constructor(){
//         super();
//         this.milestoneService = Container.get(MilestoneService);
//         this.milestoneRepository = Container.get(MilestoneRepository);
//     }
//     @Security("jwt")
//     @Get("/")
//     @Summary("Get milestones with optional filters")
//     @Description("Retrieve milestones filtered by pool. If no filters provided, returns all milestones.")
//     @Example<MilestoneDto[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             pool_id: "550e8400-e29b-41d4-a716-446655440001",
//             title: "Collect 50% of target funds",
//             status: "pending",
//             votes_required: 3,
//             votes_received: 2,
//             completed_at: null,
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     public async getMilestones(
//         @Query() @Description("Filter by pool ID") poolId?: string
//     ): Promise<MilestoneDto[]> {
//         if (poolId) return this.milestoneService.getMilestonesByPool(poolId);
//         return this.milestoneRepository.listAll({});
//     }
//     @Security("jwt")
//     @Get("/{id}")
//     @Summary("Get milestone by ID")
//     @Description("Retrieve detailed information about a specific milestone.")
//     @Example<MilestoneDto>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         pool_id: "550e8400-e29b-41d4-a716-446655440001",
//         title: "Collect 50% of target funds",
//         status: "pending",
//         votes_required: 3,
//         votes_received: 2,
//         completed_at: null,
//         created_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<ErrorResponseDto>(404, "Milestone Not Found", {
//         message: "Milestone not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getMilestoneById(@Path() @Description("Milestone ID") id: string): Promise<MilestoneDto | null> {
//         return this.milestoneRepository.findById(id);
//     }
//     @Security("jwt")
//     @Post("/")
//     @Summary("Create a new milestone")
//     @Description("Create a new governance milestone for a co-ownership pool that requires member voting.")
//     @Example<CreateMilestoneDto>({
//         pool_id: "550e8400-e29b-41d4-a716-446655440000",
//         title: "Collect 50% of target funds",
//         required_approvals: 3
//     })
//     @Response<MilestoneDto>(201, "Milestone created successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid milestone data or pool not found",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     public async createMilestone(@Body() @Description("Milestone creation data") milestone: CreateMilestoneDto): Promise<MilestoneDto> {
//         return this.milestoneService.createMilestone(milestone);
//     }
//     @Security("jwt")
//     @Post("/{id}/vote")
//     @Summary("Vote on a milestone")
//     @Description("Cast a vote on a milestone. Only pool members can vote. Milestone is completed when required votes are reached.")
//     @Example<VoteMilestoneDto>({
//         approve: true
//     })
//     @Response<MilestoneDto>(200, "Vote recorded successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid vote or milestone already completed",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(403, "Forbidden", {
//         message: "Only pool members can vote on milestones",
//         statusCode: 403,
//         name: "ForbiddenError"
//     })
//     @Response<ErrorResponseDto>(404, "Milestone Not Found", {
//         message: "Milestone not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async voteOnMilestone(
//         @Path() @Description("Milestone ID to vote on") id: string,
//         @Body() @Description("Vote data") vote: VoteMilestoneDto,
//         @Request() req: AuthenticatedRequest
//     ): Promise<MilestoneDto> {
//         const userId = req.user?.id;
//         if (!userId) throw new AppError("Unauthorized");
//         return this.milestoneService.voteOnMilestone({
//             milestone_id: id,
//             user_id: userId,
//             approve: vote.approve
//         });
//     }
//     @Security("jwt")
//     @Put("/{id}")
//     @Summary("Update milestone")
//     @Description("Update milestone details. Some fields may be restricted after voting has started.")
//     @Response<MilestoneDto>(200, "Milestone updated successfully")
//     @Response<ErrorResponseDto>(404, "Milestone Not Found", {
//         message: "Milestone not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async updateMilestone(
//         @Path() @Description("Milestone ID") id: string,
//         @Body() @Description("Updated milestone data") updates: Partial<MilestoneDto>
//     ): Promise<MilestoneDto | null> {
//         return this.milestoneRepository.updateById(id, updates);
//     }
//     @Security("jwt")
//     @Delete("/{id}")
//     @Summary("Delete milestone")
//     @Description("Delete a milestone. This should be used carefully as it affects pool governance.")
//     @Response<boolean>(200, "Milestone deleted successfully")
//     @Response<ErrorResponseDto>(404, "Milestone Not Found", {
//         message: "Milestone not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async deleteMilestone(@Path() @Description("Milestone ID") id: string): Promise<boolean> {
//         return this.milestoneRepository.deleteById(id);
//     }
// }
//# sourceMappingURL=milestone.js.map