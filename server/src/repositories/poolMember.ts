import AppDataSource from "../config/postgres";
import PoolMember from "../models/poolMember";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class PoolMemberRepository {

    private repo: Repository<PoolMember>;

    constructor(){
        this.repo = AppDataSource.getRepository(PoolMember);
    }

    async create(poolMember: DeepPartial<PoolMember>): Promise<PoolMember>{
        return this.repo.save(poolMember);
    }

    async findById(id: string): Promise<PoolMember | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id }, relations: ['pool', 'user'] });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<PoolMember[]>{
        return this.repo.find({ ...filter, relations: ['pool', 'user'] });
    }

    async updateById(id: string, updates: Partial<PoolMember>): Promise<PoolMember | null>{
        if(!updates) return null;
        const poolMember = await this.findById(id);
        if(!poolMember) return null;
        await this.repo.update({ id }, updates);
        return { ...poolMember, ...updates } as PoolMember;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByPool(poolId: string): Promise<PoolMember[]>{
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool', 'user'] });
    }

    async findByUser(userId: string): Promise<PoolMember[]>{
        return this.repo.find({ where: { user_id: userId }, relations: ['pool', 'user'] });
    }

}