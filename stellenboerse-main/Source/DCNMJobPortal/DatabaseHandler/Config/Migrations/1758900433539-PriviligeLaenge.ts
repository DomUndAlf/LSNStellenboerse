import { MigrationInterface, QueryRunner } from "typeorm";

export class PriviligeLaenge1758900433539 implements MigrationInterface {
    name = 'PriviligeLaenge1758900433539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`privilege\` DROP COLUMN \`PrivilegeKey\``);
        await queryRunner.query(`ALTER TABLE \`privilege\` ADD \`PrivilegeKey\` varchar(64) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`privilege\` DROP COLUMN \`PrivilegeKey\``);
        await queryRunner.query(`ALTER TABLE \`privilege\` ADD \`PrivilegeKey\` varchar(24) NULL`);
    }

}
