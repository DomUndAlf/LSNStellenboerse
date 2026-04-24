import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageColumn1733130409839 implements MigrationInterface {
    name = 'AddLanguageColumn1733130409839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`Language\` CHAR(2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`Language\``);
    }

}
