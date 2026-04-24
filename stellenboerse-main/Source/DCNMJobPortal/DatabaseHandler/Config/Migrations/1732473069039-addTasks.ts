import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTasks1732473069039 implements MigrationInterface {
    name: string = "AddTasks1732473069039";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD COLUMN \`Tasks\` JSON NULL`);
        await queryRunner.query(`ALTER TABLE \`job\` MODIFY COLUMN \`Description\` TEXT NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`Tasks\``);
        await queryRunner.query(`ALTER TABLE \`job\` MODIFY COLUMN \`Description\` TEXT NOT NULL`);
    }
}
