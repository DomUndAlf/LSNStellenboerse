import { MigrationInterface, QueryRunner } from "typeorm";

export class BlacklistAndWhitelistAddedToEmployerts1730639270748 implements MigrationInterface {
    name = "BlacklistAndWhitelistAddedToEmployerts1730639270748";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` ADD \`Blacklist\` JSON NULL`);
        await queryRunner.query(`ALTER TABLE \`employer\` ADD \`Whitelist\` JSON NULL`);
        await queryRunner.query(`ALTER TABLE \`employer\` MODIFY \`Website\` VARCHAR(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Whitelist\``);
        await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Blacklist\``);
        await queryRunner.query(`ALTER TABLE \`employer\` MODIFY \`Website\` VARCHAR(255)`);
    }
}
