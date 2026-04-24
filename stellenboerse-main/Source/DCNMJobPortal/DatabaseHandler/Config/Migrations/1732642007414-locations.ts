import { MigrationInterface, QueryRunner } from "typeorm";

export class Locations1732642007414 implements MigrationInterface {
    name = 'Locations1732642007414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` ADD \`LocationID\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`employersEmployerID\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Emails\``);
        await queryRunner.query(`ALTER TABLE \`employer\` ADD \`Emails\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_2a65c355a80fa73f72b702deaec\` FOREIGN KEY (\`employersEmployerID\`) REFERENCES \`employer\`(\`EmployerID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_2a65c355a80fa73f72b702deaec\``);
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Emails\``);
        await queryRunner.query(`ALTER TABLE \`employer\` ADD \`Emails\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`employersEmployerID\``);
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`LocationID\``);
    }

}
