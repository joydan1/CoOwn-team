import { Service } from "typedi";
import User from "../models/user";
import { RegisterUserDto, LoginUserDto, LoginUserResponseDto, refreshTokenDto, tokenDto, VerifyBvnDto } from "../dtos/user";
import { UserRepository } from "../repositories/user";
import { hashString, cleanedUser, compareHash, generateAccessToken, generateRefreshToken, verifyToken } from "../common/util";
import { isUUID } from "class-validator";
import { AppError } from "../common/errors/AppError";
import { Profile } from "passport-google-oauth20";
import { verifyBvnFull, matchBvnFullData } from "../common/interswitch";
import logger from "../config/logger";

@Service()
export default class UserService {

    constructor(
        private userRepository: UserRepository
    ) { }


    public async registerUser(data: RegisterUserDto): Promise<Partial<User>> {
        const { firstName, lastName, email, password } = data;

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new AppError("User already exists");
        }

        const passwordHash = await hashString(password);

        const savedData = {
            firstName, lastName, email, password: passwordHash
        }
        const user = await this.userRepository.create(savedData);


        return cleanedUser(user);
    }


    public async loginUser(req: LoginUserDto): Promise<LoginUserResponseDto> {
        const { email, password } = req;

        const user = await this.userRepository.findByEmail(email);

        if (!user) throw new AppError("Invalid Email or Password");

        const isCorrectPassword = await compareHash(password, user.password as string);

        if (!isCorrectPassword) throw new AppError("Invalid Email or Password");

        const accessToken = await generateAccessToken(email, user.id);
        const refreshToken = await generateRefreshToken(email, user.id);

        await this.userRepository.updateByEmail(email, { token: refreshToken });

        return {
            message: "Login Successful", user: cleanedUser(user), token: {
                accessToken, refreshToken
            }
        } as LoginUserResponseDto;

    }

    public async refreshToken(req: refreshTokenDto): Promise<tokenDto> {
        const { refreshToken } = req;

        try {
            await verifyToken(refreshToken);

        } catch {
            throw new AppError("Invalid or expired refresh token");
        }

        const user = await this.userRepository.findByToken(refreshToken);

        if (!user) throw new AppError("refresh token Invalid!");
        if (user.token !== refreshToken) throw new AppError("Refresh token does not match")
        const accessToken = await generateAccessToken(user.email, user.id);
        const newRefreshToken = await generateRefreshToken(user.email, user.id);

        await this.userRepository.updateByid(user.id, { token: newRefreshToken });

        return { accessToken, refreshToken: newRefreshToken };

    }

    public async logout(id: string) {

        if (!isUUID(id)) throw new AppError("Invalid User id format");

        const user = await this.userRepository.findById(id);

        if (!user || user === null) throw new AppError("User not found!");
        this.userRepository.updateByid(id, { token: "" });

        return { message: "Logged out successfully" };
    }

    public async getUserInformation(id: string): Promise<Partial<User> | null> {
        const user = await this.userRepository.findById(id);
        logger.info(`Fetching user with id ${id}`);
        if (!user) {
            logger.warn(`User not found: ${id}`);
            throw new AppError("User not found!");

        }
        return cleanedUser(user);
    }

    /** LIST ALL USERS */
    public async listAllUsers(filter: Record<string, unknown> = {}): Promise<Partial<User>[]> {
        const users = await this.userRepository.listAll(filter);
        return users.map(user => cleanedUser(user));
    }

    public async updateUser(id: string, updates: Partial<User>): Promise<Partial<User>> {
        const updated = await this.userRepository.updateByid(id, updates);
        if (!updated) throw new AppError("User not found!");
        return cleanedUser(updated as User);
    }

    public async deleteUser(id: string): Promise<{ message: string }> {
        if (!isUUID(id)) throw new AppError("Invalid User id format");
        const user = await this.userRepository.findById(id);
        if (!user) throw new AppError("User not found!");

        const deleted = await this.userRepository.deleteById(id);
        if (!deleted) throw new AppError("Failed to delete user");
        return { message: "User deleted successfully" };
    }

    public async googleLogin(profile: Profile) {

        const email = profile.emails?.[0].value as string;
        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            const savedData = {
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                email
            };

            user = await this.userRepository.create(savedData);

        }
        const accessToken = await generateAccessToken(user.email, user.id);
        const refreshToken = await generateRefreshToken(user.email, user.id);

        await this.userRepository.updateByid(user.id, { token: refreshToken });
        return {
            message: "Google Login Successful",
            token: {
                accessToken,
                refreshToken
            }
        }
    }


    public async verifyBvn(
        userId: string,
        body: VerifyBvnDto
    ): Promise<{
        message: string;
        data: {
            firstName: string;
            lastName: string;
            phone?: string;
        };
    }> {
        const { bvn, firstName, lastName, dateOfBirth } = body;

        if (!isUUID(userId)) {
            throw new AppError("Invalid user ID format");
        }

 
        if (!/^\d{11}$/.test(bvn)) {
            throw new AppError("Invalid BVN format");
        }

        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError("User not found");

 
        if (user.bvn_hash) {
            throw new AppError("BVN already verified");
        }

        let response;


        try {
            response = await verifyBvnFull(bvn);
        } catch (error: any) {
            throw new AppError(
                error.message || "BVN verification service unavailable"
            );
        }


        const isMatch = matchBvnFullData(response.data, {
            firstName,
            lastName,
            dateOfBirth
        });

        if (!isMatch) {
            throw new AppError("BVN details do not match");
        }


        const bvnHash = await hashString(bvn);


        await this.userRepository.updateByid(userId, {
            bvn_hash: bvnHash,
            verified: true,
            phone: response.data.phoneNumber || user.phone,
            firstName: response.data.firstName || user.firstName,
            lastName: response.data.lastName || user.lastName
        });

        return {
            message: "BVN verified successfully",
            data: {
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phone: response.data.phoneNumber
            }
        };
    }
}