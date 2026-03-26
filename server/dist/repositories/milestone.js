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
exports.MilestoneRepository = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const milestone_1 = __importDefault(require("../models/milestone"));
const typedi_1 = require("typedi");
let MilestoneRepository = class MilestoneRepository {
    constructor() {
        this.repo = postgres_1.default.getRepository(milestone_1.default);
    }
    async create(milestone) {
        return this.repo.save(milestone);
    }
    async findById(id) {
        if (!id)
            return null;
        return this.repo.findOne({ where: { id }, relations: ['pool'] });
    }
    async listAll(filter = {}) {
        return this.repo.find({ ...filter, relations: ['pool'] });
    }
    async updateById(id, updates) {
        if (!updates)
            return null;
        const milestone = await this.findById(id);
        if (!milestone)
            return null;
        await this.repo.update({ id }, updates);
        return { ...milestone, ...updates };
    }
    async deleteById(id) {
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }
    async findByPool(poolId) {
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool'] });
    }
};
exports.MilestoneRepository = MilestoneRepository;
exports.MilestoneRepository = MilestoneRepository = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], MilestoneRepository);
//# sourceMappingURL=milestone.js.map