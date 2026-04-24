import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationDeadlineAddedToJob1730806620347 implements MigrationInterface {
    name: string = "ApplicationDeadlineAddedToJob1730806620347";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`ApplicationDeadline\` DATE NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\`  DROP COLUMN \`ApplicationDeadline\``);
    }
}
 