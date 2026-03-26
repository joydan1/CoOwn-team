import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import User from "./user";
import Pool from "./pool";

@Entity('pool_members')
export default class PoolMember extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Pool)
    @JoinColumn({ name: 'pool_id' })
    pool!: Pool;

    @Column()
    pool_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column()
    user_id!: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    declared_amount!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    paid_amount!: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    ownership_pct!: number;

    @CreateDateColumn()
    joined_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}