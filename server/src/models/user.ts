import "reflect-metadata";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm"

@Entity('users')
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    firstName?: string;

    @Column()
    lastName?: string;

    @Column()
    email!: string;
    
    @Column({ nullable: true })
    password?: string;
    
    @Column({ nullable: true })
    token?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    bvn_hash?: string;

    @Column({ default: false })
    verified?: boolean;

    @Column({ default: "user" })
    role?: string;

    @Column({ default: false })
    isActive?: boolean;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

}

