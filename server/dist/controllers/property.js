"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const typedi_1 = __importStar(require("typedi"));
const property_1 = __importDefault(require("../services/property"));
const property_2 = require("../repositories/property");
const tsoa_1 = require("tsoa");
const dtos_1 = require("../dtos");
let PropertyController = class PropertyController extends tsoa_1.Controller {
    constructor() {
        super();
        this.propertyService = typedi_1.default.get(property_1.default);
        this.propertyRepository = typedi_1.default.get(property_2.PropertyRepository);
    }
    /**
         * Retrieve a list of properties, with optional filtering by location, type, and status.
         */
    async getProperties(location, type, status) {
        const filter = {};
        if (location)
            filter["location"] = location;
        if (type)
            filter["type"] = type;
        if (status)
            filter["status"] = status;
        const query = {};
        if (Object.keys(filter).length > 0)
            query.where = filter;
        return this.propertyRepository.listAll(query);
    }
    /**
         * Get the list of property listings that are currently active for investment search.
         */
    async getPropertyListings() {
        return this.propertyService.getPropertyListings();
    }
    /**
     * Get details for a specific property by ID.
     */
    async getPropertyById(id) {
        return this.propertyRepository.findById(id);
    }
    async getPropertyValuation(id) {
        return this.propertyService.getPropertyValuation(id);
    }
    async createProperty(property) {
        return this.propertyService.createProperty(property);
    }
    async updateProperty(id, updates) {
        return this.propertyService.updateProperty(id, updates);
    }
    async deleteProperty(id) {
        return this.propertyService.deleteProperty(id);
    }
};
exports.PropertyController = PropertyController;
__decorate([
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.Example)([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            title: "3 Bedroom Luxury Apartment in Lekki",
            location: "Lekki Phase 1, Lagos",
            price: 15000000,
            type: "apartment",
            images: ["https://example.com/image1.jpg"],
            documents: ["https://example.com/title-deed.pdf"],
            ai_valuation: 16500000,
            status: "available",
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ]),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid filter parameters",
        statusCode: 400,
        name: "ValidationError"
    }),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "getProperties", null);
__decorate([
    (0, tsoa_1.Get)("/listings"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "getPropertyListings", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}"),
    (0, tsoa_1.Example)({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "3 Bedroom Luxury Apartment in Lekki",
        location: "Lekki Phase 1, Lagos",
        price: 15000000,
        type: "apartment",
        images: ["https://example.com/image1.jpg"],
        documents: ["https://example.com/title-deed.pdf"],
        ai_valuation: 16500000,
        status: "available",
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    }),
    (0, tsoa_1.Response)(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "getPropertyById", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("/{id}/valuation"),
    (0, tsoa_1.Example)({
        estimatedValue: 16500000,
        confidence: "High"
    }),
    (0, tsoa_1.Response)(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "getPropertyValuation", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)("/"),
    (0, tsoa_1.Example)({
        title: "3 Bedroom Luxury Apartment in Lekki",
        location: "Lekki Phase 1, Lagos",
        price: 15000000,
        type: "apartment",
        images: ["https://example.com/image1.jpg"],
        documents: ["https://example.com/title-deed.pdf"]
    }),
    (0, tsoa_1.Response)(201, "Property created successfully"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Invalid property data",
        statusCode: 400,
        name: "ValidationError"
    }),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.CreatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "createProperty", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Put)("/{id}"),
    (0, tsoa_1.Response)(200, "Property updated successfully"),
    (0, tsoa_1.Response)(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "updateProperty", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Delete)("/{id}"),
    (0, tsoa_1.Response)(200, "Property deleted successfully"),
    (0, tsoa_1.Response)(400, "Bad Request", {
        message: "Cannot delete property with active pools",
        statusCode: 400,
        name: "ValidationError"
    }),
    (0, tsoa_1.Response)(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    }),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "deleteProperty", null);
exports.PropertyController = PropertyController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("properties"),
    (0, tsoa_1.Tags)("Properties"),
    __metadata("design:paramtypes", [])
], PropertyController);
//# sourceMappingURL=property.js.map