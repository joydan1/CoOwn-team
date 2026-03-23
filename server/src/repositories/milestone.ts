import AppDataSource from "../config/postgres";
import Milestone from "../models/milestone";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class MilestoneRepository {

    private repo: Repository<Milestone>;

    constructor(){
        this.repo = AppDataSource.getRepository(Milestone);
    }

    async create(milestone: DeepPartial<Milestone>): Promise<Milestone>{
        return this.repo.save(milestone);
    }

    async findById(id: string): Promise<Milestone | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id }, relations: ['pool'] });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<Milestone[]>{
        return this.repo.find({ ...filter, relations: ['pool'] });
    }

    async updateById(id: string, updates: Partial<Milestone>): Promise<Milestone | null>{
        if(!updates) return null;
        const milestone = await this.findById(id);
        if(!milestone) return null;
        await this.repo.update({ id }, updates);
        return { ...milestone, ...updates } as Milestone;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByPool(poolId: string): Promise<Milestone[]>{
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool'] });
    }

}