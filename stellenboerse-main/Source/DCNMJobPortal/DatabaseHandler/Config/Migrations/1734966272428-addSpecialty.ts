import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpecialty1734966272428 implements MigrationInterface {
    name: string = "AddSpecialty1734966272428";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD COLUMN \`Specialty\` JSON NULL`);
        await queryRunner.query(`ALTER TABLE \`job\` MODIFY COLUMN \`Description\` TEXT NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`Specialty\``);
        await queryRunner.query(`ALTER TABLE \`job\` MODIFY COLUMN \`Description\` TEXT NOT NULL`);
    }
}
