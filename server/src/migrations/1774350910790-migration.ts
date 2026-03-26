import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774350910790 implements MigrationInterface {
    name = 'Migration1774350910790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "ai_valuation"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "ai_valuation" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "ai_valuation"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "ai_valuation" numeric(10,2)`);
    }

}
