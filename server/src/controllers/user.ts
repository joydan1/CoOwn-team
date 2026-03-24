import Container, { Service } from "typedi";
import UserService from "../services/user";
import { Controller, Route, Get, Path, Security, Tags, Example, Response, Delete, Body, Put, Query } from "tsoa";
import User from "../models/user";
import { UpdateUserDto } from "../dtos/user";



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

    
}