"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const user_1 = require("../repositories/user");
const util_1 = require("../common/util");
const class_validator_1 = require("class-validator");
const AppError_1 = require("../common/errors/AppError");
const interswitch_1 = require("../common/interswitch");
const logger_1 = __importDefault(require("../config/logger"));
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async registerUser(data) {
        const { firstName, lastName, email, password } = data;
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError_1.AppError("User already exists");
        }
        const passwordHash = await (0, util_1.hashString)(password);
        const savedData = {
            firstName, lastName, email, password: passwordHash
        };
        const user = await this.userRepository.create(savedData);
        return (0, util_1.cleanedUser)(user);
    }
    async loginUser(req) {
        const { email, password } = req;
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            throw new AppError_1.AppError("Invalid Email or Password");
        const isCorrectPassword = await (0, util_1.compareHash)(password, user.password);
        if (!isCorrectPassword)
            throw new AppError_1.AppError("Invalid Email or Password");
        const accessToken = await (0, util_1.generateAccessToken)(email, user.id);
        const refreshToken = await (0, util_1.generateRefreshToken)(email, user.id);
        await this.userRepository.updateByEmail(email, { token: refreshToken });
        return {
            message: "Login Successful", user: (0, util_1.cleanedUser)(user), token: {
                accessToken, refreshToken
            }
        };
    }
    async refreshToken(req) {
        const { refreshToken } = req;
        try {
            await (0, util_1.verifyToken)(refreshToken);
        }
        catch {
            throw new AppError_1.AppError("Invalid or expired refresh token");
        }
        const user = await this.userRepository.findByToken(refreshToken);
        if (!user)
            throw new AppError_1.AppError("refresh token Invalid!");
        if (user.token !== refreshToken)
            throw new AppError_1.AppError("Refresh token does not match");
        const accessToken = await (0, util_1.generateAccessToken)(user.email, user.id);
        const newRefreshToken = await (0, util_1.generateRefreshToken)(user.email, user.id);
        await this.userRepository.updateByid(user.id, { token: newRefreshToken });
        return { accessToken, refreshToken: newRefreshToken };
    }
    async logout(id) {
        if (!(0, class_validator_1.isUUID)(id))
            throw new AppError_1.AppError("Invalid User id format");
        const user = await this.userRepository.findById(id);
        if (!user || user === null)
            throw new AppError_1.AppError("User not found!");
        this.userRepository.updateByid(id, { token: "" });
        return { message: "Logged out successfully" };
    }
    async getUserInformation(id) {
        const user = await this.userRepository.findById(id);
        logger_1.default.info(`Fetching user with id ${id}`);
        if (!user) {
            logger_1.default.warn(`User not found: ${id}`);
            throw new AppError_1.AppError("User not found!");
        }
        return (0, util_1.cleanedUser)(user);
    }
    /** LIST ALL USERS */
    async listAllUsers(filter = {}) {
        const users = await this.userRepository.listAll(filter);
        return users.map(user => (0, util_1.cleanedUser)(user));
    }
    async updateUser(id, updates) {
        const updated = await this.userRepository.updateByid(id, updates);
        if (!updated)
            throw new AppError_1.AppError("User not found!");
        return (0, util_1.cleanedUser)(updated);
    }
    async deleteUser(id) {
        if (!(0, class_validator_1.isUUID)(id))
            throw new AppError_1.AppError("Invalid User id format");
        const user = await this.userRepository.findById(id);
        if (!user)
            throw new AppError_1.AppError("User not found!");
        const deleted = await this.userRepository.deleteById(id);
        if (!deleted)
            throw new AppError_1.AppError("Failed to delete user");
        return { message: "User deleted successfully" };
    }
    async googleLogin(profile) {
        const email = profile.emails?.[0].value;
        let user = await this.userRepository.findByEmail(email);
        if (!user) {
            const savedData = {
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                email
            };
            user = await this.userRepository.create(savedData);
        }
        const accessToken = await (0, util_1.generateAccessToken)(user.email, user.id);
        const refreshToken = await (0, util_1.generateRefreshToken)(user.email, user.id);
        await this.userRepository.updateByid(user.id, { token: refreshToken });
        return {
            message: "Google Login Successful",
            token: {
                accessToken,
                refreshToken
            }
        };
    }
    async verifyBvn(userId, body) {
        const { bvn, firstName, lastName, dateOfBirth } = body;
        if (!(0, class_validator_1.isUUID)(userId)) {
            throw new AppError_1.AppError("Invalid user ID format");
        }
        if (!/^\d{11}$/.test(bvn)) {
            throw new AppError_1.AppError("Invalid BVN format");
        }
        const user = await this.userRepository.findById(userId);
        if (!user)
            throw new AppError_1.AppError("User not found");
        if (user.bvn_hash) {
            throw new AppError_1.AppError("BVN already verified");
        }
        let response;
        try {
            response = await (0, interswitch_1.verifyBvnFull)(bvn);
        }
        catch (error) {
            throw new AppError_1.AppError(error.message || "BVN verification service unavailable");
        }
        const isMatch = (0, interswitch_1.matchBvnFullData)(response.data, {
            firstName,
            lastName,
            dateOfBirth
        });
        if (!isMatch) {
            throw new AppError_1.AppError("BVN details do not match");
        }
        const bvnHash = await (0, util_1.hashString)(bvn);
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
};
UserService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [user_1.UserRepository])
], UserService);
exports.default = UserService;
//# sourceMappingURL=user.js.map