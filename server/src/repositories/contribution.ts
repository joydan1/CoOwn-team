import AppDataSource from "../config/postgres";
import Contribution from "../models/contribution";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class ContributionRepository {

    private repo: Repository<Contribution>;

    constructor(){
        this.repo = AppDataSource.getRepository(Contribution);
    }

    async create(contribution: DeepPartial<Contribution>): Promise<Contribution>{
        return this.repo.save(contribution);
    }

    async findById(id: string): Promise<Contribution | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id }, relations: ['pool', 'user'] });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<Contribution[]>{
        return this.repo.find({ ...filter, relations: ['pool', 'user'] });
    }

    async updateById(id: string, updates: Partial<Contribution>): Promise<Contribution | null>{
        if(!updates) return null;
        const contribution = await this.findById(id);
        if(!contribution) return null;
        await this.repo.update({ id }, updates);
        return { ...contribution, ...updates } as Contribution;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByPool(poolId: string): Promise<Contribution[]>{
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool', 'user'] });
    }

    async findByUser(userId: string): Promise<Contribution[]>{
        return this.repo.find({ where: { user_id: userId }, relations: ['pool', 'user'] });
    }

}