import Container, { Service } from "typedi";
import UserService from "../services/user";
import { Controller, Route, Get, Path, Security, Tags, Example, Response, Delete, Body, Put, Query, Post, Request } from "tsoa";
import User from "../models/user";
import { UpdateUserDto } from "../dtos/user";
import { VerifyBvnDto, BvnVerificationResponseDto, ErrorResponseDto } from "../dtos";
import { Request as ExpressRequest } from "express";

interface AuthenticatedRequest extends ExpressRequest {
    user?: { id: string };
}



@Service()
@Route("users")
@Tags("Users")
export class AuthController extends Controller{
    private userService: UserService
    
    constructor(

    ){
        super();
        this.userService = Container.get(UserService);

    
    }

    /** @summary Get user by ID @description Retrieve user information by their unique ID */
    @Security("jwt")
    @Get("/:id")
    @Example<Partial<User>>({
        id: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+2348012345678",
        verified: true,
        role: "user",
        isActive: true,
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    })
    @Response<Partial<User | null>>(200, "User found")
    @Response(404, "User not found")
    public async getUserById(
        @Path() id: string
    ): Promise<Partial<User | null>>{
        const users = await this.userService.getUserInformation(id);
        return users;
    }


      /** LIST ALL USERS */
    @Security("jwt")
    @Get("/")
    @Example<Partial<User>[]>([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            role: "user",
            verified: true,
            isActive: true,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ])
    @Response<Partial<User>[]>(200, "List of users")
    public async listAll(@Query() role?: string, @Query() isActive?: boolean): Promise<Partial<User>[]> {
        const filter: Record<string, unknown> = {};
        if (role) filter.role = role;
        if (typeof isActive === "boolean") filter.isActive = isActive;
        return this.userService.listAllUsers(filter);
    }


    /** UPDATE USER */
    @Security("jwt")
    @Put("/:id")
    @Example<Partial<User>>({
        firstName: "Jane",
        lastName: "Doe",
        phone: "+2348012345678"
    })
    @Response<Partial<User>>(200, "User updated successfully")
    @Response(404, "User not found")
   public async updateUser(@Path() id: string, @Body() updates: UpdateUserDto): Promise<Partial<User>> {
        return this.userService.updateUser(id, updates);
    }

    /** DELETE USER */
    @Security("jwt")
    @Delete("/:id")
    @Example<string>("550e8400-e29b-41d4-a716-446655440000")
    @Response<{ message: string }>(200, "User deleted successfully")
    @Response(404, "User not found")
    public async deleteUser(@Path() id: string): Promise<{ message: string }> {
        return this.userService.deleteUser(id);
    }

    /** VERIFY BVN */
    @Security("jwt")
    @Post("/:id/verify-bvn")
    @Example<BvnVerificationResponseDto>({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        firstName: "John",
        lastName: "Doe",
        middleName: "Michael",
        dateOfBirth: "1990-01-15",
        phoneNumber: "+2348012345678",
        nin: "12345678901",
        verified: true,
        verifiedAt: new Date("2026-03-25T22:36:21.732Z"),
        message: "BVN verified successfully"
    })
    @Response<BvnVerificationResponseDto>(200, "BVN verified successfully")
    @Response<ErrorResponseDto>(400, "Invalid BVN or verification failed", {
        message: "BVN verification failed",
        statusCode: 400,
        name: "VerificationError"
    })
    @Response<ErrorResponseDto>(404, "User not found", {
        message: "User not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async verifyBvn(
        @Path() id: string,
        @Body() body: VerifyBvnDto
    ): Promise<BvnVerificationResponseDto> {
        return this.userService.verifyBvn(id, body.bvn);
    }

    
}