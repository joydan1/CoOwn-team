import AppDataSource from "../config/postgres";
import User from "../models/user";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class UserRepository {

    private repo: Repository<User>;

    constructor(){
        this.repo = AppDataSource.getRepository(User);
    }

    async create(user: DeepPartial<User>): Promise<User>{
        return this.repo.save(user);
    }

    async findById(id: string): Promise<Partial<User> | null>{
        if(!id) return null;
        const user = this.repo.findOne( { where: { id } });
        return user;
    }
    async findByEmail(email: string): Promise<User | null>{
        if(!email) return null;
        const user = this.repo.findOne({ where: { email }});
        return user;
        
    }

    async findByToken(token: string): Promise<User | null>{
        if(!token) return null;
        const user = this.repo.findOne({ where: {token}});
        return user;
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<(User)[]>{
        return this.repo.find({where : { ...filter }})
    }

    async updateByid(id: string, updates?: Partial<User>): Promise<Partial<User | null>>{
        if(!updates) return null;
      
        const user = await this.findById(id);
        if(!user) return null;
        
        await this.repo.update({ id }, updates);
        return {...user, ...updates};
    
    }

    async updateByEmail(email: string, updates?: Partial<User>): Promise<Partial<User | null>>{
        if(!updates) return null;
      
        const user = await this.findByEmail(email);
        if(!user) return null;
        
        await this.repo.update({ email }, updates);
        return {...user, ...updates};
    
    }

    async deleteById(id: string): Promise<boolean> {
    if (!id) return false;

    const result = await this.repo.delete({ id });

    return (result.affected ?? 0) > 0;
}
    
    async updateBvnHash(userId: string, bvnHash: string): Promise<Partial<User> | null> {
        return this.updateByid(userId, { bvn_hash: bvnHash });
    }
}