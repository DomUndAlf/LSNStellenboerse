import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveFlag1737922047826 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` ADD COLUMN \`isActive\` TINYINT(1) DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`employer\` DROP COLUMN \`isActive\``
        );
    }

}
