import { IsString, IsStrongPassword, IsOptional } from "class-validator";
import User from "../models/user";


export class RegisterUserDto{
    @IsString({ message: "first Name must be a string"})
    firstName?: string;

    @IsString({ message: "last Name must be a string"})
    lastName?: string;

    @IsString({ message: "Email must be string"})
    email!: string;

    @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "Password should be a minimum of 8 characters, with at least 1 uppercase, 1 lowercase, 1 number and 1 special character" })
    password!: string;
}

export class RegisterUserResponseDto{
    @IsOptional()
    message?: string

    @IsOptional()
    user?: User
}




export class LoginUserDto{
    @IsString({ message: "Email must be string"})
    email!: string;

    @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "Password should be a minimum of 8 characters, with at least 1 uppercase, 1 lowercase, 1 number and 1 special character" })
    password!: string;
}

export class tokenDto {
    accessToken?: string;
    refreshToken?: string;
}

export class refreshTokenDto{  
    @IsString()
    refreshToken!: string;
}

export class LoginUserResponseDto{
    @IsOptional()
    message?: string

    @IsOptional()
    token?: tokenDto

    @IsOptional()
    user?: Partial<User>
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
}


export interface VerifyBvnDto {
    bvn: string;          
    firstName: string;     
    lastName: string;
    dateOfBirth: string;  
}