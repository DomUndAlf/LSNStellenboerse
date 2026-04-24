import { MigrationInterface, QueryRunner } from "typeorm";

export class MulltipleEmails1731589380736 implements MigrationInterface {
    name = 'MulltipleEmails1731589380736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` ADD COLUMN \`Emails\` JSON NULL`);
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Email\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Emails\``);
        await queryRunner.query(`ALTER TABLE \`employer\` ADD COLUMN \`Email\` VARCHAR(255) NULL`);
    }

}
