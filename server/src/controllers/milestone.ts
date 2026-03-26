import Container, { Service } from "typedi";
import MilestoneService from "../services/milestone";
import { MilestoneRepository } from "../repositories/milestone";
import {
    Controller,
    Route,
    Get,
    Post,
    Put,
    Delete,
    Path,
    Body,
    Query,
    Security,
    Request,
    Tags,
    Response,
    Example
} from "tsoa";
import { Request as ExpressRequest } from 'express';
import { AppError } from "../common/errors/AppError";
import { MilestoneDto, CreateMilestoneDto, VoteMilestoneDto, ErrorResponseDto } from "../dtos";

interface AuthenticatedRequest extends ExpressRequest {
    user?: { id: string };
}

@Service()
@Route("milestones")
@Tags("Milestones")
export class MilestoneController extends Controller {
    private milestoneService: MilestoneService;
    private milestoneRepository: MilestoneRepository;

    constructor(){
        super();
        this.milestoneService = Container.get(MilestoneService);
        this.milestoneRepository = Container.get(MilestoneRepository);
    }

/**
     * Retrieve milestones, optionally filtered by pool ID.
     * @param poolId optional pool ID to filter milestones by pool
     */
    @Security("jwt")
    @Get("/")
    @Example<MilestoneDto[]>([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            pool_id: "550e8400-e29b-41d4-a716-446655440001",
            title: "Collect 50% of target funds",
            description: "Complete the first funding milestone",
            target_date: new Date("2024-02-15"),
            status: "pending",
            required_approvals: 3,
            current_approvals: 2,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ])
    public async getMilestones(@Query() poolId?: string): Promise<MilestoneDto[]> {
        if (poolId) return this.milestoneService.getMilestonesByPool(poolId) as unknown as MilestoneDto[];
        return this.milestoneRepository.listAll({}) as unknown as MilestoneDto[];
    }

/**
     * Get a specific milestone by ID.
     * @param id milestone ID to lookup
     */
    @Security("jwt")
    @Get("/{id}")
    @Example<MilestoneDto>({
        id: "550e8400-e29b-41d4-a716-446655440000",
        pool_id: "550e8400-e29b-41d4-a716-446655440001",
        title: "Collect 50% of target funds",
        description: "Complete the first funding milestone",
        target_date: new Date("2024-02-15"),
        status: "pending",
        required_approvals: 3,
        current_approvals: 2,
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    })
    @Response<ErrorResponseDto>(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getMilestoneById(@Path() id: string): Promise<MilestoneDto | null> {
        return this.milestoneRepository.findById(id) as unknown as MilestoneDto | null;
    }

/**
     * Create a new milestone for a pool.
     * @param milestone milestone details including pool_id, title and required approvals
     */
    @Security("jwt")
    @Post("/")
    @Example<CreateMilestoneDto>({
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Collect 50% of target funds",
        description: "First major funding milestone",
        target_date: new Date("2024-02-15"),
        required_approvals: 3
    })
    @Response<MilestoneDto>(201, "Milestone created successfully")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid milestone data or pool not found",
        statusCode: 400,
        name: "ValidationError"
    })
    public async createMilestone(@Body() milestone: CreateMilestoneDto): Promise<MilestoneDto> {
        return this.milestoneService.createMilestone(milestone) as unknown as MilestoneDto;
    }

/**
     * Record an approval or rejection vote for a milestone by a pool member.
     * @param id milestone ID
     * @param vote vote payload with approve true/false
     */
    @Security("jwt")
    @Post("/{id}/vote")
    @Example<VoteMilestoneDto>({ approve: true })
    @Response<MilestoneDto>(200, "Vote recorded successfully")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid vote or milestone already completed",
        statusCode: 400,
        name: "ValidationError"
    })
    @Response<ErrorResponseDto>(403, "Forbidden", {
        message: "Only pool members can vote on milestones",
        statusCode: 403,
        name: "ForbiddenError"
    })
    @Response<ErrorResponseDto>(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async voteOnMilestone(
        @Path() id: string,
        @Body() vote: VoteMilestoneDto,
        @Request() req: AuthenticatedRequest
    ): Promise<MilestoneDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");
        return this.milestoneService.voteOnMilestone({
            milestone_id: id,
            user_id: userId,
            approve: vote.approve
        }) as unknown as MilestoneDto;
    }

/**
     * Update a milestone's details. Only status and metadata are updated.
     * @param id milestone ID
     * @param updates fields to update (status, description, required_approvals, etc.)
     */
    @Security("jwt")
    @Put("/{id}")
    @Response<MilestoneDto>(200, "Milestone updated successfully")
    @Response<ErrorResponseDto>(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async updateMilestone(
        @Path() id: string,
        @Body() updates: Partial<MilestoneDto>
    ): Promise<MilestoneDto | null> {
        return this.milestoneRepository.updateById(id, updates) as unknown as MilestoneDto | null;
    }

/**
     * Delete a milestone by ID.
     * @param id milestone ID to delete
     */
    @Security("jwt")
    @Delete("/{id}")
    @Response<boolean>(200, "Milestone deleted successfully")
    @Response<ErrorResponseDto>(404, "Milestone Not Found", {
        message: "Milestone not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async deleteMilestone(@Path() id: string): Promise<boolean> {
        return this.milestoneRepository.deleteById(id);
    }
}
