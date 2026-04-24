import { MigrationInterface, QueryRunner } from "typeorm";

export class IsValidColumnAddedToJob1730284143548 implements MigrationInterface {
    name = 'IsValidColumnAddedToJob1730284143548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` ADD \`isValid\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`isValid\``);
    }

}
