import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import Pool from "./pool";

@Entity('milestones')
export default class Milestone extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Pool)
    @JoinColumn({ name: 'pool_id' })
    pool!: Pool;

    @Column()
    pool_id!: string;

    @Column()
    title!: string;

    @Column({ default: 'pending' })
    status!: string;

    @Column('int', { default: 0 })
    votes_required!: number;

    @Column('int', { default: 0 })
    votes_received!: number;

    @Column({ type: 'timestamp', nullable: true })
    completed_at?: Date;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}