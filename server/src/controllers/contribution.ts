import Container, { Service } from "typedi";
import ContributionService from "../services/contribution";
import { ContributionRepository } from "../repositories/contribution";
import { getIO } from "../config/websocket";
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
import { ContributionDto, PaymentDto, InterswitchPaymentDto, ErrorResponseDto } from "../dtos";

interface AuthenticatedRequest extends ExpressRequest {
    user?: { id: string };
}

@Service()
@Route("contributions")
@Tags("Contributions")
export class ContributionController extends Controller {
    private contributionService: ContributionService;
    private contributionRepository: ContributionRepository;

    constructor(){
        super();
        this.contributionService = Container.get(ContributionService);
        this.contributionRepository = Container.get(ContributionRepository);
    }

/**
     * Get contributions with optional filters for pool or user.
     * @param poolId optional pool ID filter
     * @param userId optional user ID filter
     */
    @Security("jwt")
    @Get("/")
    @Example<ContributionDto[]>([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            pool_id: "550e8400-e29b-41d4-a716-446655440001",
            user_id: "550e8400-e29b-41d4-a716-446655440002",
            amount: 50000,
            currency: "USD",
            fx_rate: 1500,
            payment_ref: "PAY_123456789",
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ])
    public async getContributions(
        @Query() poolId?: string,
        @Query() userId?: string
    ): Promise<ContributionDto[]> {
        if (poolId) return this.contributionService.getContributionsByPool(poolId) as unknown as ContributionDto[];
        if (userId) return this.contributionService.getContributionsByUser(userId) as unknown as ContributionDto[];
        return this.contributionRepository.listAll({}) as unknown as ContributionDto[];
    }
/**
     * Create a contribution for a pool member. Recursively recalculates pool ownership percentages.
     * @param contribution contribution payload including pool_id, user_id and amount
     */    @Security("jwt")
    @Get("/{id}")
    @Example<ContributionDto>({
        id: "550e8400-e29b-41d4-a716-446655440000",
        pool_id: "550e8400-e29b-41d4-a716-446655440001",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        amount: 50000,
        currency: "USD",
        fx_rate: 1500,
        payment_ref: "PAY_123456789",
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    })
    @Response<ErrorResponseDto>(404, "Contribution Not Found", {
        message: "Contribution not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getContributionById(@Path() id: string): Promise<ContributionDto | null> {
        return this.contributionRepository.findById(id);
    }

    @Security("jwt")
    @Post("/pay")
    @Example<PaymentDto>({
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        amount: 50000,
        currency: "USD",
        paymentMethod: "cross_border"
    })
    @Response<ContributionDto>(201, "Payment processed successfully")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid payment data or insufficient funds",
        statusCode: 400,
        name: "ValidationError"
    })
    @Response<ErrorResponseDto>(404, "Pool Not Found", {
        message: "Pool not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async processPayment(
        @Body() payment: PaymentDto,
        @Request() req: AuthenticatedRequest
    ): Promise<ContributionDto> {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized");

        return this.contributionService.processPayment({
            ...payment,
            user_id: userId
        });
    }

    @Post("/verify")
    @Example<InterswitchPaymentDto>({
        pool_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        merchant_code: "MX275869",
        amount: 10000,
        currency: "NGN",
        payment_ref: "FBN|WEB|MX275869|..."
    })
    @Response<ContributionDto>(201, "Payment verified and contribution recorded")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid payment verification data",
        statusCode: 400,
        name: "ValidationError"
    })
    public async verifyContribution(
        @Body() payment: InterswitchPaymentDto,
        @Request() req: AuthenticatedRequest
    ): Promise<ContributionDto> {
        // Temporarily disabled auth checks for testing
        // const userId = req.user?.id;
        // if (!userId) throw new AppError("Unauthorized");

        // if (payment.user_id !== userId) {
        //     throw new AppError("Mismatch between authenticated user and payment user_id", 403);
        // }

        return this.contributionService.verifyAndRecordContribution(payment);
    }

    @Security("jwt")
    @Put("/{id}")
    @Response<ContributionDto>(200, "Contribution updated successfully")
    @Response<ErrorResponseDto>(404, "Contribution Not Found", {
        message: "Contribution not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async updateContribution(
        @Path() id: string,
        @Body() updates: Partial<ContributionDto>
    ): Promise<ContributionDto | null> {
        const contribution = await this.contributionRepository.findById(id);
        if (!contribution) {
            throw new AppError("Contribution not found", 404);
        }

        const updatedContribution = await this.contributionRepository.updateById(id, updates);

        try {
            getIO().to(contribution.pool_id).emit("contributionUpdated", updatedContribution);
        } catch (error) {
            console.error("Failed to emit contributionUpdated event:", error);
        }

        return updatedContribution;
    }

    @Security("jwt")
    @Delete("/{id}")
    @Response<boolean>(200, "Contribution deleted successfully")
    @Response<ErrorResponseDto>(404, "Contribution Not Found", {
        message: "Contribution not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async deleteContribution(@Path() id: string): Promise<boolean> {
        const contribution = await this.contributionRepository.findById(id);
        if (!contribution) {
            throw new AppError("Contribution not found", 404);
        }

        const deleted = await this.contributionRepository.deleteById(id);

        if (deleted) {
            try {
                getIO().to(contribution.pool_id).emit("contributionRemoved", {
                    id: contribution.id,
                    pool_id: contribution.pool_id,
                    user_id: contribution.user_id,
                    amount: contribution.amount,
                    currency: contribution.currency,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error("Failed to emit contributionRemoved event:", error);
            }
        }

        return deleted;
    }
}
