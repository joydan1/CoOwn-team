import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm"

@Entity('properties')
export default class Property extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column()
    location!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @Column()
    type!: string;

    @Column('simple-array', { nullable: true })
    images?: string[];

    @Column('simple-array', { nullable: true })
    documents?: string[];

    @Column('bigint', { nullable: true })
    ai_valuation?: number;

    @Column({ default: 'available' })
    status!: string;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}