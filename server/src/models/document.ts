import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import User from "./user";
import Pool from "./pool";

@Entity('documents')
export default class Document extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Pool)
    @JoinColumn({ name: 'pool_id' })
    pool!: Pool;

    @Column()
    pool_id!: string;

    @Column()
    type!: string;

    @Column()
    url!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploaded_by' })
    uploaded_by!: User;

    @Column()
    uploaded_by_id!: string;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}