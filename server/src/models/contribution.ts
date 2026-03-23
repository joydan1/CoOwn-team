import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import User from "./user";
import Pool from "./pool";

@Entity('contributions')
export default class Contribution extends BaseEntity {
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

    @Column('decimal', { precision: 10, scale: 2 })
    amount!: number;

    @Column({ default: 'NGN' })
    currency!: string;

    @Column('decimal', { precision: 10, scale: 4, nullable: true })
    fx_rate?: number;

    @Column({ nullable: true })
    payment_ref?: string;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}