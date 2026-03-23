// import { Service } from "typedi";
// import Property from "../models/property";
// import { PropertyRepository } from "../repositories/property";
// import { AppError } from "../common/errors/AppError";
// export interface CreatePropertyDto {
//     title: string;
//     location: string;
//     price: number;
//     type: string;
//     images?: string[];
//     documents?: string[];
// }
// @Service()
// export default class PropertyService {
//     constructor(
//         private propertyRepository: PropertyRepository
//     ) {}
//     public async createProperty(data: CreatePropertyDto): Promise<Property> {
//         // Calculate AI valuation (mock)
//         const aiValuation = await this.calculateAiValuation(data);
//         return this.propertyRepository.create({
//             ...data,
//             ai_valuation: aiValuation,
//             status: 'available'
//         });
//     }
//     private async calculateAiValuation(property: CreatePropertyDto): Promise<number> {
//         // Mock AI valuation calculation
//         // In real implementation, call AI/ML service or model
//         const basePrice = property.price;
//         const locationMultiplier = this.getLocationMultiplier(property.location);
//         const typeMultiplier = this.getTypeMultiplier(property.type);
//         return Math.round(basePrice * locationMultiplier * typeMultiplier);
//     }
//     private getLocationMultiplier(location: string): number {
//         // Mock location-based adjustments
//         const premiumLocations = ['Lagos', 'Abuja', 'Port Harcourt'];
//         return premiumLocations.some(loc => location.includes(loc)) ? 1.2 : 1.0;
//     }
//     private getTypeMultiplier(type: string): number {
//         // Mock type-based adjustments
//         const multipliers = {
//             'land': 0.8,
//             'apartment': 1.1,
//             'house': 1.0,
//             'commercial': 1.3
//         };
//         return multipliers[type as keyof typeof multipliers] || 1.0;
//     }
//     public async getPropertyValuation(propertyId: string): Promise<{ estimatedValue: number; confidence: string }> {
//         const property = await this.propertyRepository.findById(propertyId);
//         if (!property) throw new AppError("Property not found");
//         const valuation = property.ai_valuation || await this.calculateAiValuation(property);
//         const confidence = valuation > property.price * 1.1 ? 'High' : valuation > property.price * 0.9 ? 'Medium' : 'Low';
//         return {
//             estimatedValue: valuation,
//             confidence
//         };
//     }
//     public async updatePropertyStatus(propertyId: string, status: string): Promise<Property> {
//         const property = await this.propertyRepository.findById(propertyId);
//         if (!property) throw new AppError("Property not found");
//         const updated = await this.propertyRepository.updateById(propertyId, { status });
//         if (!updated) throw new AppError("Failed to update property status");
//         return updated;
//     }
// }
//# sourceMappingURL=property.js.map