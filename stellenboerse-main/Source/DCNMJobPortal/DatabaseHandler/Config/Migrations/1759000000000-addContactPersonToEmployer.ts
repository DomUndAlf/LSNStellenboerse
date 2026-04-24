import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactPersonToEmployer1759000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`employer\` ADD \`ContactPerson\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employer\` ADD \`showContact\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`employer\` DROP COLUMN \`showContact\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employer\` DROP COLUMN \`ContactPerson\``,
    );
  }
}
