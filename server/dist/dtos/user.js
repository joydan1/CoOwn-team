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
exports.LoginUserResponseDto = exports.refreshTokenDto = exports.tokenDto = exports.LoginUserDto = exports.RegisterUserResponseDto = exports.RegisterUserDto = void 0;
const class_validator_1 = require("class-validator");
const user_1 = __importDefault(require("../models/user"));
class RegisterUserDto {
}
exports.RegisterUserDto = RegisterUserDto;
__decorate([
    (0, class_validator_1.IsString)({ message: "first Name must be a string" }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "last Name must be a string" }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Email must be string" }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsStrongPassword)({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "Password should be a minimum of 8 characters, with at least 1 uppercase, 1 lowercase, 1 number and 1 special character" }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "password", void 0);
class RegisterUserResponseDto {
}
exports.RegisterUserResponseDto = RegisterUserResponseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterUserResponseDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", user_1.default)
], RegisterUserResponseDto.prototype, "user", void 0);
class LoginUserDto {
}
exports.LoginUserDto = LoginUserDto;
__decorate([
    (0, class_validator_1.IsString)({ message: "Email must be string" }),
    __metadata("design:type", String)
], LoginUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsStrongPassword)({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "Password should be a minimum of 8 characters, with at least 1 uppercase, 1 lowercase, 1 number and 1 special character" }),
    __metadata("design:type", String)
], LoginUserDto.prototype, "password", void 0);
class tokenDto {
}
exports.tokenDto = tokenDto;
class refreshTokenDto {
}
exports.refreshTokenDto = refreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], refreshTokenDto.prototype, "refreshToken", void 0);
class LoginUserResponseDto {
}
exports.LoginUserResponseDto = LoginUserResponseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoginUserResponseDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", tokenDto)
], LoginUserResponseDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], LoginUserResponseDto.prototype, "user", void 0);
//# sourceMappingURL=user.js.map