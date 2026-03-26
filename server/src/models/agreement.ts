import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import Pool from "./pool";

@Entity('agreements')
export default class Agreement extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Pool)
    @JoinColumn({ name: 'pool_id' })
    pool!: Pool;

    @Column()
    pool_id!: string;

    @Column()
    content_url!: string;

    @Column('simple-array', { nullable: true })
    signed_by?: string[];

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}