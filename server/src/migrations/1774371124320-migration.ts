import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774371124320 implements MigrationInterface {
    name = 'Migration1774371124320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestones" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD "target_date" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestones" DROP COLUMN "target_date"`);
        await queryRunner.query(`ALTER TABLE "milestones" DROP COLUMN "description"`);
    }

}
