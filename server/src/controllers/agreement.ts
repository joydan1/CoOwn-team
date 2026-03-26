// import Container, { Service } from "typedi";
// import AgreementService from "../services/agreement";
// import { AgreementRepository } from "../repositories/agreement";
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
// import Agreement from "../models/agreement";
// import { Request as ExpressRequest } from 'express';
// import { AppError } from "../common/errors/AppError";
// import { AgreementDto, ErrorResponseDto } from "../dtos";

// interface AuthenticatedRequest extends ExpressRequest {
//     user?: { id: string };
// }

// @Service()
// @Route("agreements")
// @Tags("Agreements")
// export class AgreementController extends Controller {
//     private agreementService: AgreementService;
//     private agreementRepository: AgreementRepository;

//     constructor(){
//         super();
//         this.agreementService = Container.get(AgreementService);
//         this.agreementRepository = Container.get(AgreementRepository);
//     }

//     /** @summary Get agreements with optional filters @description Retrieve agreements filtered by pool. If no filters provided, returns all agreements. */
//     @Security("jwt")
//     @Get("/")
//     @Example<AgreementDto[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             pool_id: "550e8400-e29b-41d4-a716-446655440001",
//             title: "Co-Ownership Agreement",
//             content: "This agreement outlines the terms of co-ownership...",
//             status: "signed",
//             required_signatures: 3,
//             current_signatures: 3,
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     public async getAgreements(
//         @Query() poolId?: string
//     ): Promise<AgreementDto[]> {
//         if (poolId) {
//             const agreement = await this.agreementService.getAgreementByPool(poolId);
//             return agreement ? [agreement] : [];
//         }
//         return this.agreementRepository.listAll({});
//     }

//     /** @summary Get agreement by ID @description Retrieve detailed information about a specific co-ownership agreement. */
//     @Security("jwt")
//     @Get("/{id}")
//     @Example<AgreementDto>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         pool_id: "550e8400-e29b-41d4-a716-446655440001",
//         title: "Co-Ownership Agreement",
//         content: "This agreement outlines the terms of co-ownership...",
//         status: "signed",
//         required_signatures: 3,
//         current_signatures: 3,
//         created_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<ErrorResponseDto>(404, "Agreement Not Found", {
//         message: "Agreement not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getAgreementById(@Path() id: string): Promise<AgreementDto | null> {
//         return this.agreementRepository.findById(id);
//     }

//     @Security("jwt")
//     @Post("/generate/{poolId}")
//     @Summary("Generate co-ownership agreement")
//     @Description("Generate a new co-ownership agreement for a pool. Agreement is auto-generated based on pool composition and member contributions.")
//     @Response<AgreementDto>(201, "Agreement generated successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Pool not ready for agreement generation or insufficient contributions",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(404, "Pool Not Found", {
//         message: "Pool not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async generateAgreement(@Path() @Description("Pool ID to generate agreement for") poolId: string): Promise<AgreementDto> {
//         return this.agreementService.generateAgreement(poolId);
//     }

//     @Security("jwt")
//     @Post("/{id}/sign")
//     @Summary("Sign co-ownership agreement")
//     @Description("Sign a co-ownership agreement. Only pool members can sign agreements. Agreement becomes legally binding when all members have signed.")
//     @Response<AgreementDto>(200, "Agreement signed successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Agreement already signed by this user",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(403, "Forbidden", {
//         message: "Only pool members can sign agreements",
//         statusCode: 403,
//         name: "ForbiddenError"
//     })
//     @Response<ErrorResponseDto>(404, "Agreement Not Found", {
//         message: "Agreement not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async signAgreement(
//         @Path() @Description("Agreement ID to sign") id: string,
//         @Request() req: AuthenticatedRequest
//     ): Promise<AgreementDto> {
//         const userId = req.user?.id;
//         if (!userId) throw new AppError("Unauthorized");
//         return this.agreementService.signAgreement(id, userId);
//     }

//     @Security("jwt")
//     @Put("/{id}")
//     @Summary("Update agreement")
//     @Description("Update agreement details. Most fields are read-only after creation.")
//     @Response<AgreementDto>(200, "Agreement updated successfully")
//     @Response<ErrorResponseDto>(404, "Agreement Not Found", {
//         message: "Agreement not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async updateAgreement(
//         @Path() @Description("Agreement ID") id: string,
//         @Body() @Description("Updated agreement data") updates: Partial<AgreementDto>
//     ): Promise<AgreementDto | null> {
//         return this.agreementRepository.updateById(id, updates);
//     }

//     @Security("jwt")
//     @Delete("/{id}")
//     @Summary("Delete agreement")
//     @Description("Delete an agreement. This should be used carefully as it affects legal records.")
//     @Response<boolean>(200, "Agreement deleted successfully")
//     @Response<ErrorResponseDto>(404, "Agreement Not Found", {
//         message: "Agreement not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async deleteAgreement(@Path() @Description("Agreement ID") id: string): Promise<boolean> {
//         return this.agreementRepository.deleteById(id);
//     }

// }