import AppDataSource from "../config/postgres";
import Agreement from "../models/agreement";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class AgreementRepository {

    private repo: Repository<Agreement>;

    constructor(){
        this.repo = AppDataSource.getRepository(Agreement);
    }

    async create(agreement: DeepPartial<Agreement>): Promise<Agreement>{
        return this.repo.save(agreement);
    }

    async findById(id: string): Promise<Agreement | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id }, relations: ['pool'] });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<Agreement[]>{
        return this.repo.find({ ...filter, relations: ['pool'] });
    }

    async updateById(id: string, updates: Partial<Agreement>): Promise<Agreement | null>{
        if(!updates) return null;
        const agreement = await this.findById(id);
        if(!agreement) return null;
        await this.repo.update({ id }, updates);
        return { ...agreement, ...updates } as Agreement;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByPool(poolId: string): Promise<Agreement[]>{
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool'] });
    }

}