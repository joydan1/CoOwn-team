import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import User from "./user";
import Property from "./property";

@Entity('pools')
export default class Pool extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Property)
    @JoinColumn({ name: 'property_id' })
    property!: Property;

    @Column()
    property_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator!: User;

    @Column()
    creator_id!: string;

    @Column()
    name!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    target_amount!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    raised_amount!: number;

    @Column({ type: 'date', nullable: true })
    deadline?: Date;

    @Column({ default: 'active' })
    status!: string;

    @Column({ default: false })
    is_public!: boolean;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}