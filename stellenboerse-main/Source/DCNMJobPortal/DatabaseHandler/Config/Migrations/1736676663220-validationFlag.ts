import { MigrationInterface, QueryRunner } from "typeorm";

export class ValidationFlag1736676663220 implements MigrationInterface {
    name = 'ValidationFlag1736676663220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` ADD COLUMN \`toValidate\` TINYINT(1) DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`employer\` DROP COLUMN \`toValidate\``
        );
    }

}
