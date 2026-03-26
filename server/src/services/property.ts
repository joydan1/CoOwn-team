import { Service } from "typedi";
import Property from "../models/property";
import { PropertyRepository } from "../repositories/property";
import { PoolRepository } from "../repositories/pool";
import { AppError } from "../common/errors/AppError";
import { getAiValuation, AiValuationInput } from "./aivaluation";

export interface CreatePropertyDto {
    title: string;
    location: string;
    price: number;
    type: "apartment" | "house" | "land" | "commercial";
    images?: string[];
    documents?: string[];
}

@Service()
export default class PropertyService {
    constructor(
        private propertyRepository: PropertyRepository,
        private poolRepository: PoolRepository
    ) {}

    // ✅ CREATE PROPERTY (with AI valuation)
    public async createProperty(data: CreatePropertyDto): Promise<Property> {
        const valuation = await getAiValuation(data);

        return this.propertyRepository.create({
            ...data,
            ai_valuation: valuation.estimatedValue,
            status: "available"
        });
    }


    public async getPropertyById(id: string): Promise<Property | null> {
        return this.propertyRepository.findById(id);
    }


    public async updateProperty(
        id: string,
        updates: Partial<Property>
    ): Promise<Property | null> {
        const property = await this.propertyRepository.findById(id);
        if (!property) throw new AppError("Property not found");

        return this.propertyRepository.updateById(id, updates);
    }

   
    public async deleteProperty(id: string): Promise<boolean> {
        const property = await this.propertyRepository.findById(id);
        if (!property) throw new AppError("Property not found");

        const activePools = await this.poolRepository.findByPropertyId(id);
        if (activePools.length > 0) {
            throw new AppError("Cannot delete property with active pools");
        }

        return this.propertyRepository.deleteById(id);
    }

   
 public async getPropertyValuation(propertyId: string): Promise<{
    estimatedValue: number;
    confidence: string;
    source: "primary" | "gemini" | "local";
}> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) throw new AppError("Property not found");

    
    const aiInput: AiValuationInput = {
        title: property.title,
        location: property.location,
        price: Number(property.price),
        type: property.type as any,
    };

    const valuation = await getAiValuation(aiInput);

    // optional: persist new valuation to DB
    await this.propertyRepository.updateById(propertyId, {
        ai_valuation: valuation.estimatedValue,
    });

    // ✅ Confidence logic
    const price = Number(property.price);
    const difference = Math.abs(valuation.estimatedValue - price) / price;

    let confidence: string = "Low";
    if (difference < 0.05) confidence = "High";
    else if (difference < 0.15) confidence = "Medium";

    return {
        estimatedValue: valuation.estimatedValue,
        confidence,
        source: valuation.source!,
    };
}
    public async getPropertyListings(): Promise<Property[]> {
        return this.propertyRepository.listAll({ where: { status: 'available' } });
    }
}