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
exports.PoolMemberRepository = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const poolMember_1 = __importDefault(require("../models/poolMember"));
const typedi_1 = require("typedi");
let PoolMemberRepository = class PoolMemberRepository {
    constructor() {
        this.repo = postgres_1.default.getRepository(poolMember_1.default);
    }
    async create(poolMember) {
        return this.repo.save(poolMember);
    }
    async findById(id) {
        if (!id)
            return null;
        return this.repo.findOne({ where: { id }, relations: ['pool', 'user'] });
    }
    async listAll(filter = {}) {
        return this.repo.find({ ...filter, relations: ['pool', 'user'] });
    }
    async updateById(id, updates) {
        if (!updates)
            return null;
        const poolMember = await this.findById(id);
        if (!poolMember)
            return null;
        await this.repo.update({ id }, updates);
        return { ...poolMember, ...updates };
    }
    async deleteById(id) {
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }
    async findByPool(poolId) {
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool', 'user'] });
    }
    async findByUser(userId) {
        return this.repo.find({ where: { user_id: userId }, relations: ['pool', 'user'] });
    }
};
exports.PoolMemberRepository = PoolMemberRepository;
exports.PoolMemberRepository = PoolMemberRepository = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], PoolMemberRepository);
//# sourceMappingURL=poolMember.js.map