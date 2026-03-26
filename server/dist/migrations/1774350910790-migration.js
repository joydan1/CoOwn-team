"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1774350910790 = void 0;
class Migration1774350910790 {
    constructor() {
        this.name = 'Migration1774350910790';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "ai_valuation"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "ai_valuation" bigint`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "ai_valuation"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "ai_valuation" numeric(10,2)`);
    }
}
exports.Migration1774350910790 = Migration1774350910790;
//# sourceMappingURL=1774350910790-migration.js.map