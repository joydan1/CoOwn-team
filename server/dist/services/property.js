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
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const property_1 = require("../repositories/property");
const pool_1 = require("../repositories/pool");
const AppError_1 = require("../common/errors/AppError");
const aivaluation_1 = require("./aivaluation");
let PropertyService = class PropertyService {
    constructor(propertyRepository, poolRepository) {
        this.propertyRepository = propertyRepository;
        this.poolRepository = poolRepository;
    }
    // ✅ CREATE PROPERTY (with AI valuation)
    async createProperty(data) {
        const valuation = await (0, aivaluation_1.getAiValuation)(data);
        return this.propertyRepository.create({
            ...data,
            ai_valuation: valuation.estimatedValue,
            status: "available"
        });
    }
    async getPropertyById(id) {
        return this.propertyRepository.findById(id);
    }
    async updateProperty(id, updates) {
        const property = await this.propertyRepository.findById(id);
        if (!property)
            throw new AppError_1.AppError("Property not found");
        return this.propertyRepository.updateById(id, updates);
    }
    async deleteProperty(id) {
        const property = await this.propertyRepository.findById(id);
        if (!property)
            throw new AppError_1.AppError("Property not found");
        const activePools = await this.poolRepository.findByPropertyId(id);
        if (activePools.length > 0) {
            throw new AppError_1.AppError("Cannot delete property with active pools");
        }
        return this.propertyRepository.deleteById(id);
    }
    async getPropertyValuation(propertyId) {
        const property = await this.propertyRepository.findById(propertyId);
        if (!property)
            throw new AppError_1.AppError("Property not found");
        const aiInput = {
            title: property.title,
            location: property.location,
            price: Number(property.price),
            type: property.type,
        };
        const valuation = await (0, aivaluation_1.getAiValuation)(aiInput);
        // optional: persist new valuation to DB
        await this.propertyRepository.updateById(propertyId, {
            ai_valuation: valuation.estimatedValue,
        });
        // ✅ Confidence logic
        const price = Number(property.price);
        const difference = Math.abs(valuation.estimatedValue - price) / price;
        let confidence = "Low";
        if (difference < 0.05)
            confidence = "High";
        else if (difference < 0.15)
            confidence = "Medium";
        return {
            estimatedValue: valuation.estimatedValue,
            confidence,
            source: valuation.source,
        };
    }
    async getPropertyListings() {
        return this.propertyRepository.listAll({ where: { status: 'available' } });
    }
};
PropertyService = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [property_1.PropertyRepository,
        pool_1.PoolRepository])
], PropertyService);
exports.default = PropertyService;
//# sourceMappingURL=property.js.map