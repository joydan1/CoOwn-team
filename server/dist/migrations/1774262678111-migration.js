"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1774262678111 = void 0;
class Migration1774262678111 {
    constructor() {
        this.name = 'Migration1774262678111';
    }
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`CREATE TABLE "properties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "location" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "type" character varying NOT NULL, "images" text, "documents" text, "ai_valuation" numeric(10,2), "status" character varying NOT NULL DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pools" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "property_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "name" character varying NOT NULL, "target_amount" numeric(10,2) NOT NULL, "raised_amount" numeric(10,2) NOT NULL DEFAULT '0', "deadline" date, "status" character varying NOT NULL DEFAULT 'active', "is_public" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6708c86fc389259de3ee43230ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pool_id" uuid NOT NULL, "user_id" uuid NOT NULL, "declared_amount" numeric(10,2) NOT NULL DEFAULT '0', "paid_amount" numeric(10,2) NOT NULL DEFAULT '0', "ownership_pct" numeric(5,2) NOT NULL DEFAULT '0', "joined_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1fb453508287fa1f08b059ca753" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "milestones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pool_id" uuid NOT NULL, "title" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "votes_required" integer NOT NULL DEFAULT '0', "votes_received" integer NOT NULL DEFAULT '0', "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0bdbfe399c777a6a8520ff902d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pool_id" uuid NOT NULL, "type" character varying NOT NULL, "url" character varying NOT NULL, "uploaded_by_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uploaded_by" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contributions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pool_id" uuid NOT NULL, "user_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'NGN', "fx_rate" numeric(10,4), "payment_ref" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca2b4f39eb9e32a61278c711f79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "agreements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pool_id" uuid NOT NULL, "content_url" character varying NOT NULL, "signed_by" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_01532f6c999d44c776e3d1fa4c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profilePicture"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bvn_hash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pools" ADD CONSTRAINT "FK_f74950b901ee905329a8fb358ee" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pools" ADD CONSTRAINT "FK_cf070a931fc2d4078055d36b723" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pool_members" ADD CONSTRAINT "FK_3fef267632c31cba741a3765806" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pool_members" ADD CONSTRAINT "FK_88e9683adb257e33cb495ee32d7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD CONSTRAINT "FK_33fc2b96d298c4a9222b6552dbf" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_c928c960fc6c6ff3e5aa69dc20b" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_b9e28779ec77ff2223e2da41f6d" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_8b8e200c9cfecf5e5de6c7b48df" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "FK_1974f0066f8125ca1d548f524db" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agreements" ADD CONSTRAINT "FK_da5e4621a9718444527eb6a52fc" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "agreements" DROP CONSTRAINT "FK_da5e4621a9718444527eb6a52fc"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_1974f0066f8125ca1d548f524db"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_8b8e200c9cfecf5e5de6c7b48df"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_b9e28779ec77ff2223e2da41f6d"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_c928c960fc6c6ff3e5aa69dc20b"`);
        await queryRunner.query(`ALTER TABLE "milestones" DROP CONSTRAINT "FK_33fc2b96d298c4a9222b6552dbf"`);
        await queryRunner.query(`ALTER TABLE "pool_members" DROP CONSTRAINT "FK_88e9683adb257e33cb495ee32d7"`);
        await queryRunner.query(`ALTER TABLE "pool_members" DROP CONSTRAINT "FK_3fef267632c31cba741a3765806"`);
        await queryRunner.query(`ALTER TABLE "pools" DROP CONSTRAINT "FK_cf070a931fc2d4078055d36b723"`);
        await queryRunner.query(`ALTER TABLE "pools" DROP CONSTRAINT "FK_f74950b901ee905329a8fb358ee"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('student', 'teacher', 'parent', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bvn_hash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profilePicture" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "dateOfBirth" date`);
        await queryRunner.query(`DROP TABLE "agreements"`);
        await queryRunner.query(`DROP TABLE "contributions"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TABLE "pool_members"`);
        await queryRunner.query(`DROP TABLE "pools"`);
        await queryRunner.query(`DROP TABLE "properties"`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    }
}
exports.Migration1774262678111 = Migration1774262678111;
//# sourceMappingURL=1774262678111-migration.js.map