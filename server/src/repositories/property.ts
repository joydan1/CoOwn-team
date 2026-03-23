import AppDataSource from "../config/postgres";
import Property from "../models/property";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class PropertyRepository {

    private repo: Repository<Property>;

    constructor(){
        this.repo = AppDataSource.getRepository(Property);
    }

    async create(property: DeepPartial<Property>): Promise<Property>{
        return this.repo.save(property);
    }

    async findById(id: string): Promise<Property | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id } });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<Property[]>{
        return this.repo.find({ ...filter });
    }

    async updateById(id: string, updates: Partial<Property>): Promise<Property | null>{
        if(!updates) return null;
        const property = await this.findById(id);
        if(!property) return null;
        await this.repo.update({ id }, updates);
        return { ...property, ...updates } as Property;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByLocation(location: string): Promise<Property[]>{
        return this.repo.find({ where: { location } });
    }

    async findByType(type: string): Promise<Property[]>{
        return this.repo.find({ where: { type } });
    }

}