import AppDataSource from "../config/postgres";
import Pool from "../models/pool";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class PoolRepository {

    private repo: Repository<Pool>;

    constructor(){
        this.repo = AppDataSource.getRepository(Pool);
    }

    async create(pool: DeepPartial<Pool>): Promise<Pool>{
        return this.repo.save(pool);
    }

    async findById(id: string): Promise<Pool | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id }, relations: ['property', 'creator'] });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<Pool[]>{
        return this.repo.find({ ...filter, relations: ['property', 'creator'] });
    }

    async updateById(id: string, updates: Partial<Pool>): Promise<Pool | null>{
        if(!updates) return null;
        const pool = await this.findById(id);
        if(!pool) return null;
        await this.repo.update({ id }, updates);
        return { ...pool, ...updates } as Pool;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByCreator(creatorId: string): Promise<Pool[]>{
        return this.repo.find({ where: { creator_id: creatorId }, relations: ['property', 'creator'] });
    }

    async findPublic(): Promise<Pool[]>{
        return this.repo.find({ where: { is_public: true }, relations: ['property', 'creator'] });
    }
    async findByPropertyId(propertyId: string): Promise<Pool[]> {
        return this.repo.find({ where: { property_id: propertyId, status: 'active' }, relations: ['property', 'creator'] });
    }
}