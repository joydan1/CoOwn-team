import Container, { Service } from "typedi";
import UserService from "../services/user";
import { Post, Body, Controller, Route, Delete, Query, Tags, Example, Response, Security, Request } from "tsoa";
import { LoginUserDto, LoginUserResponseDto, refreshTokenDto, RegisterUserDto, tokenDto, VerifyBvnDto } from "../dtos/user";
import User from "../models/user";



@Service()
@Route("auth")
@Tags("Authentication")
export class UserController extends Controller{
      private userService: UserService
    
    constructor(
  
    ){
        super();
       this.userService = Container.get(UserService);

    
    }

    /** @summary Register a new user @description Create a new user account with email and password */
    @Post("/register")
    @Example<RegisterUserDto>({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "SecurePass123!"
    })
    @Response<LoginUserResponseDto>(201, "User registered successfully", {
        message: "Registration Successful",
        user: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            verified: false,
            role: "user",
            isActive: true,
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        },
        token: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    })
    public async register(@Body() req: RegisterUserDto): Promise<LoginUserResponseDto>{
        const result = await this.userService.registerUser(req);
        return result;
    }

    /** @summary User login @description Authenticate user with email and password, returns JWT tokens */
    @Post("/login")
    @Example<LoginUserDto>({
        email: "john.doe@example.com",
        password: "SecurePass123!"
    })
    @Response<LoginUserResponseDto>(200, "Login successful", {
        message: "Login successful",
        token: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        user: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            verified: true,
            role: "user",
            isActive: true
        }
    })
    public async login(@Body() req: LoginUserDto): Promise<LoginUserResponseDto>{
        const user = await this.userService.loginUser(req);
        return user;
    }


   /** @summary Refresh access token @description Generate new access token using refresh token */
   @Post("/refresh")
   @Example<refreshTokenDto>({
       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   })
   @Response<tokenDto>(200, "Token refreshed successfully", {
       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   })
    public async refresh(@Body() req: refreshTokenDto): Promise<tokenDto>{
        const token = await this.userService.refreshToken(req);
        return token;
    }    

    /** @summary User logout @description Logout user by invalidating their session */
    @Delete("/logout")
    @Example<string>("550e8400-e29b-41d4-a716-446655440000")
    @Response<boolean>(200, "Logout successful", true)
    public async logout(@Query() id: string){
        return this.userService.logout(id);
    }

//   /** @summary Verify BVN @description Verify user's BVN and update profile */
//   @Post("/verify-bvn")
//   @Example<VerifyBvnDto>({
//     bvn: "12345678901",
//     firstName: "John",
//     lastName: "Doe",
//     dateOfBirth: "1990-01-01",
//   })
//   @Response(200, "BVN verified successfully", {
//     message: "BVN verified successfully (dummy)",
//     data: {
//       firstName: "John",
//       lastName: "Doe",
//       phone: "08012345678",
//     },
//   })
//   public async verifyBvn(
//     @Body() body: VerifyBvnDto
//   ): Promise<{
//     message: string;
//     data: { firstName: string; lastName: string; phone?: string };
//   }> {
//     // In a real app, userId would come from JWT/session. For now, we pass a dummy userId
//     const userId = "65c49bdc-7a4a-41d2-8239-03c95c1efce1";
//     const result = await this.userService.verifyBvn(userId, body);
//     return result;
//   }
}
