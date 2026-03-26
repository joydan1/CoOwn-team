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
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_1 = __importDefault(require("./user"));
const pool_1 = __importDefault(require("./pool"));
let Contribution = class Contribution extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Contribution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pool_1.default),
    (0, typeorm_1.JoinColumn)({ name: 'pool_id' }),
    __metadata("design:type", pool_1.default)
], Contribution.prototype, "pool", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Contribution.prototype, "pool_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.default),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_1.default)
], Contribution.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Contribution.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Contribution.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'NGN' }),
    __metadata("design:type", String)
], Contribution.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Contribution.prototype, "fx_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "payment_ref", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Contribution.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Contribution.prototype, "updatedAt", void 0);
Contribution = __decorate([
    (0, typeorm_1.Entity)('contributions')
], Contribution);
exports.default = Contribution;
//# sourceMappingURL=contribution.js.map