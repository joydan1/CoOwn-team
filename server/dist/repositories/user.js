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
exports.UserRepository = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const user_1 = __importDefault(require("../models/user"));
const typedi_1 = require("typedi");
let UserRepository = class UserRepository {
    constructor() {
        this.repo = postgres_1.default.getRepository(user_1.default);
    }
    async create(user) {
        return this.repo.save(user);
    }
    async findById(id) {
        if (!id)
            return null;
        const user = this.repo.findOne({ where: { id } });
        return user;
    }
    async findByEmail(email) {
        if (!email)
            return null;
        const user = this.repo.findOne({ where: { email } });
        return user;
    }
    async findByToken(token) {
        if (!token)
            return null;
        const user = this.repo.findOne({ where: { token } });
        return user;
    }
    async listAll(filter = {}) {
        return this.repo.find({ where: { ...filter } });
    }
    async updateByid(id, updates) {
        if (!updates)
            return null;
        const user = await this.findById(id);
        if (!user)
            return null;
        await this.repo.update({ id }, updates);
        return { ...user, ...updates };
    }
    async updateByEmail(email, updates) {
        if (!updates)
            return null;
        const user = await this.findByEmail(email);
        if (!user)
            return null;
        await this.repo.update({ email }, updates);
        return { ...user, ...updates };
    }
    async deleteById(id) {
        if (!id)
            return false;
        const result = await this.repo.delete({ id });
        return (result.affected ?? 0) > 0;
    }
    async updateBvnHash(userId, bvnHash) {
        return this.updateByid(userId, { bvn_hash: bvnHash });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], UserRepository);
//# sourceMappingURL=user.js.map