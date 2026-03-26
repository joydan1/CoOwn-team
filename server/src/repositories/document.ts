import AppDataSource from "../config/postgres";
import Document from "../models/document";
import { Repository, DeepPartial } from "typeorm";
import { Service } from "typedi";

@Service()
export class DocumentRepository {

    private repo: Repository<Document>;

    constructor(){
        this.repo = AppDataSource.getRepository(Document);
    }

    async create(document: DeepPartial<Document>): Promise<Document>{
        return this.repo.save(document);
    }

    async findById(id: string): Promise<Document | null>{
        if(!id) return null;
        return this.repo.findOne({ where: { id }, relations: ['pool', 'uploaded_by'] });
    }

    async listAll(filter: Record<string, unknown> = {}): Promise<Document[]>{
        return this.repo.find({ ...filter, relations: ['pool', 'uploaded_by'] });
    }

    async updateById(id: string, updates: Partial<Document>): Promise<Document | null>{
        if(!updates) return null;
        const document = await this.findById(id);
        if(!document) return null;
        await this.repo.update({ id }, updates);
        return { ...document, ...updates } as Document;
    }

    async deleteById(id: string): Promise<boolean>{
        const result = await this.repo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async findByPool(poolId: string): Promise<Document[]>{
        return this.repo.find({ where: { pool_id: poolId }, relations: ['pool', 'uploaded_by'] });
    }

}