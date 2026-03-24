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
import { PoolDto, PoolMemberDto, ErrorResponseDto } from "../dtos";

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

    @Get("/public")
    @Response<PoolDto[]>(200, "Public pools")
    public async getPublicPools(): Promise<Pool[]> {
        return this.poolService.getPublicPools();
    }

    @Security("jwt")
    @Get("/{id}")
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPoolById(@Path() id: string): Promise<PoolDto | null> {
        return this.poolService.getPoolById(id) as unknown as PoolDto | null;
    }

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
        return this.poolService.createPool(userId, pool) as unknown as PoolDto;
    }

    @Security("jwt")
    @Post("/{id}/join")
    @Example<PoolMemberDto>({
        id: "550e8400-e29b-41d4-a716-446655440003",
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        declared_amount: 250000,
        paid_amount: 0,
        ownership_pct: 25.0,
        joined_at: new Date("2024-01-15T10:30:00Z")
    })
    @Response<PoolMemberDto>(201, "Successfully joined pool")
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
        @Body() joinData: JoinPoolDto,
        @Request() req: AuthenticatedRequest
    ): Promise<PoolMemberDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");
        return this.poolService.joinPool(id, userId, joinData);
    }

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

    @Security("jwt")
    @Get("/{id}/members")
    @Example<PoolMemberDto[]>([
        {
            id: "550e8400-e29b-41d4-a716-446655440003",
            pool_id: "550e8400-e29b-41d4-a716-446655440000",
            user_id: "550e8400-e29b-41d4-a716-446655440002",
            declared_amount: 250000,
            paid_amount: 0,
            ownership_pct: 25.0,
            joined_at: new Date("2024-01-15T10:30:00Z")
        }
    ])
    @Response<PoolMemberDto[]>(200, "Pool members")
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPoolMembers(@Path() id: string): Promise<PoolMemberDto[]> {
        return this.poolService.getPoolMembers(id);
    }

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

    @Security("jwt")
    @Put("/{id}")
    public async updatePool(@Path() id: string, @Body() updates: Partial<Pool>): Promise<Pool | null> {
        return this.poolService.updatePool(id, updates);
    }

    @Security("jwt")
    @Delete("/{id}")
    public async deletePool(@Path() id: string): Promise<boolean> {
        return this.poolService.deletePool(id);
    }
}
