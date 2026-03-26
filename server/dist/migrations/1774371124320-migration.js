"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1774371124320 = void 0;
class Migration1774371124320 {
    constructor() {
        this.name = 'Migration1774371124320';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "milestones" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD "target_date" date`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "milestones" DROP COLUMN "target_date"`);
        await queryRunner.query(`ALTER TABLE "milestones" DROP COLUMN "description"`);
    }
}
exports.Migration1774371124320 = Migration1774371124320;
//# sourceMappingURL=1774371124320-migration.js.map