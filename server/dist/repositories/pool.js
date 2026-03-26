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
exports.PoolRepository = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const pool_1 = __importDefault(require("../models/pool"));
const typedi_1 = require("typedi");
let PoolRepository = class PoolRepository {
    constructor() {
        this.repo = postgres_1.default.getRepository(pool_1.default);
    }
    async create(pool) {
        return this.repo.save(pool);
    }
    async findById(id) {
        if (!id)
            return null;
        return this.repo.findOne({ where: { id }, relations: ['property', 'creator'] });
    }
    async listAll(filter = {}) {
        return this.repo.find({ ...filter, relations: ['property', 'creator'] });
    }
    async updateById(id, updates) {
        if (!updates)
            return null;
        const pool = await this.findById(id);
        if (!pool)
            return null;
        await this.repo.update({ id }, updates);
        return { ...pool, ...updates };
    }
    async deleteById(id) {
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }
    async findByCreator(creatorId) {
        return this.repo.find({ where: { creator_id: creatorId }, relations: ['property', 'creator'] });
    }
    async findPublic() {
        return this.repo.find({ where: { is_public: true }, relations: ['property', 'creator'] });
    }
    async findByPropertyId(propertyId) {
        return this.repo.find({ where: { property_id: propertyId, status: 'active' }, relations: ['property', 'creator'] });
    }
};
exports.PoolRepository = PoolRepository;
exports.PoolRepository = PoolRepository = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], PoolRepository);
//# sourceMappingURL=pool.js.map