import { MigrationInterface, QueryRunner } from "typeorm";

export class ValidationKeyAddedToJob1729257481648 implements MigrationInterface {
  name: string = "ValidationKeyAddedToJob1729257481648";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`job\` ADD \`ValidationKey\` varchar(24) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`ValidationKey\``);
  }
}
