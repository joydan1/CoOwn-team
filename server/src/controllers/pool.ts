import Container, { Service } from "typedi";
import PoolService, { CreatePoolDto, JoinPoolDto, PoolDashboardDto } from "../services/pool";
import PoolMember from "../models/poolMember";
import User from "../models/user";
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
import Pool from "../models/pool";
import { Request as ExpressRequest } from 'express';
import { AppError } from "../common/errors/AppError";
import { PoolDto, PoolMemberDto, ErrorResponseDto, OwnershipCertificateDto } from "../dtos";

interface AuthenticatedRequest extends ExpressRequest {
    user?: { id: string };
}

@Service()
@Route("pools")
@Tags("Pools")
export class PoolController extends Controller {
    private poolService: PoolService;

    constructor(){
        super();
        this.poolService = Container.get(PoolService);
    }

    /**
     * Retrieve a list of pools. Optionally filter by creator ID or public status.
     */
    @Get("/")
    @Example<PoolDto[]>([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            property: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                title: "3 Bedroom Luxury Apartment in Lekki",
                location: "Lekki Phase 1, Lagos",
                price: 15000000,
                type: "apartment",
                status: "available"
            },
            creator: {
                id: "550e8400-e29b-41d4-a716-446655440002",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                role: "user",
                verified: true,
                isActive: true
            },
            name: "Lagos Luxury Apartment Co-Own",
            target_amount: 5000000,
            raised_amount: 3250000,
            deadline: new Date("2024-12-31"),
            status: "active",
            is_public: false,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ])
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid filter parameters",
        statusCode: 400,
        name: "ValidationError"
    })
    public async getPools(
        @Query() creatorId?: string,
        @Query() isPublic?: boolean
    ): Promise<PoolDto[]> {
        const filter: Record<string, unknown> = {};
        if (creatorId) filter['creator_id'] = creatorId;
        if (isPublic !== undefined) filter['is_public'] = isPublic;

        const query: any = {};
        if (Object.keys(filter).length > 0) query.where = filter;
        return this.poolService.getPools(query) as unknown as PoolDto[];
    }

    /**
     * Retrieve a list of all public pools available for joining.
     */
    @Get("/public")
    @Response<PoolDto[]>(200, "Public pools")
    public async getPublicPools(): Promise<Pool[]> {
        return this.poolService.getPublicPools();
    }

    /**
     * Retrieve detailed information about a specific pool by its ID.
     */
    @Security("jwt")
    @Get("/{id}")
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPoolById(
        @Path() id: string,
        @Request() req: AuthenticatedRequest
    ): Promise<PoolDto | null> {
        const userId = req.user?.id;
        return this.poolService.getPoolById(id, userId) as unknown as PoolDto | null;
    }

    /**
     * Create a new co-ownership pool for a property. Returns the created pool with an invite link.
     */
    @Security("jwt")
    @Post("/")
    @Response<PoolDto>(201, "Pool Created Successfully")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid pool data or property not found",
        statusCode: 400,
        name: "ValidationError"
    })
    @Response<ErrorResponseDto>(401, "Unauthorized", {
        message: "Authentication required",
        statusCode: 401,
        name: "UnauthorizedError"
    })
    public async createPool(
        @Body() pool: CreatePoolDto,
        @Request() req: AuthenticatedRequest
    ): Promise<PoolDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");

        const createdPool = await this.poolService.createPool(userId, pool);
        const inviteLink = this.poolService.getPoolInviteLink(createdPool.id);

        return {
            ...createdPool,
            invite_link: inviteLink
        } as unknown as PoolDto;
    }

    /**
     * Generate and retrieve the invite link for a pool to share with potential members.
     */
    @Security("jwt")
    @Get("/{id}/invite")
    public async getInviteLink(@Path() id: string): Promise<{ invite_link: string }> {
        const pool = await this.poolService.getPoolById(id);
        if (!pool) throw new AppError("Pool not found");

        return { invite_link: this.poolService.getPoolInviteLink(id) };
    }

    /**
     * Join a pool instantly with default investment amount (0). Update details later via PUT endpoint.
     */
    @Security("jwt")
    @Get("/{id}/join")
    @Example<PoolMemberDto>({
        id: "550e8400-e29b-41d4-a716-446655440003",
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        declared_amount: 0,
        paid_amount: 0,
        ownership_pct: 0.0,
        joined_at: new Date("2024-01-15T10:30:00Z")
    })
    @Response<PoolMemberDto>(200, "Successfully joined pool")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid amount or already a member",
        statusCode: 400,
        name: "ValidationError"
    })
    @Response<ErrorResponseDto>(401, "Unauthorized", {
        message: "Authentication required",
        statusCode: 401,
        name: "UnauthorizedError"
    })
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async joinPool(
        @Path() id: string,
        @Request() req: AuthenticatedRequest
    ): Promise<PoolMemberDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");
        return this.poolService.joinPool(id, userId);
    }

    /**
     * Update the investment amount and currency for an existing pool membership.
     */
    @Security("jwt")
    @Put("/{id}/join")
    @Response<PoolMemberDto>(200, "Join details updated")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid data or not a member",
        statusCode: 400,
        name: "ValidationError"
    })
    @Response<ErrorResponseDto>(401, "Unauthorized", {
        message: "Authentication required",
        statusCode: 401,
        name: "UnauthorizedError"
    })
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async updateJoinDetails(
        @Path() id: string,
        @Body() joinData: JoinPoolDto,
        @Request() req: AuthenticatedRequest
    ): Promise<PoolMemberDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");
        return this.poolService.updateJoinDetails(id, userId, joinData);
    }

    /**
     * Retrieve comprehensive dashboard data for a pool, including members, contributions, and progress.
     */
    @Security("jwt")
    @Get("/{id}/dashboard")
    @Response<PoolDashboardDto>(200, "Pool dashboard")
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPoolDashboard(@Path() id: string): Promise<PoolDashboardDto> {
        return this.poolService.getPoolDashboard(id);
    }

    /**
     * Generate an ownership certificate for the requesting pool member.
     */
    @Security("jwt")
    @Get("/{id}/certificate")
    @Response<OwnershipCertificateDto>(200, "Ownership certificate")
    @Response<ErrorResponseDto>(404, "Pool or member not found", {
        message: "Pool or user not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPoolCertificate(
        @Path() id: string,
        @Request() req: AuthenticatedRequest
    ): Promise<OwnershipCertificateDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");

        return this.poolService.getOwnershipCertificate(id, userId);
    }

    /**
     * Retrieve the list of user objects for all members of a specific pool.
     */
    @Security("jwt")
    @Get("/{id}/users")
    @Response(200, "Pool member users")
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPoolUsers(@Path() id: string): Promise<User[]> {
        return this.poolService.getPoolUsers(id);
    }

    /**
     * Toggle the public visibility of a pool. Only the pool creator can perform this action.
     */
    @Security("jwt")
    @Put("/{id}/toggle-public")
    @Response<PoolDto>(200, "Pool visibility updated")
    @Response<ErrorResponseDto>(403, "Forbidden", {
        message: "Only pool creator can toggle public status",
        statusCode: 403,
        name: "ForbiddenError"
    })
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async togglePublic(
        @Path() id: string,
        @Body() data: { is_public: boolean },
        @Request() req: AuthenticatedRequest
    ): Promise<PoolDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");
        return this.poolService.togglePublic(id, userId, data.is_public) as unknown as PoolDto;
    }

    /**
     * Update pool details such as name, target amount, or deadline.
     */
    @Security("jwt")
    @Put("/{id}")
    public async updatePool(@Path() id: string, @Body() updates: Partial<Pool>): Promise<Pool | null> {
        return this.poolService.updatePool(id, updates);
    }

    /**
     * Delete a pool. This action cannot be undone.
     */
    @Security("jwt")
    @Delete("/{id}")
    public async deletePool(@Path() id: string): Promise<boolean> {
        return this.poolService.deletePool(id);
    }
}
