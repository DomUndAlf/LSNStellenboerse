import { MigrationInterface, QueryRunner } from "typeorm";

export class FullNameAndShortNameAddedToEmployer1729106544228 implements MigrationInterface {
  name: string = "FullNameAndShortNameAddedToEmployer1729106544228";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`employer\` ADD \`ShortName\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`employer\` ADD \`FullName\` varchar(255) NULL`);
    await queryRunner.query(`UPDATE employer SET ShortName = Name`);
    await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`Name\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`employer\` ADD \`Name\` varchar(255) NOT NULL`);
    await queryRunner.query(`UPDATE employer SET Name = ShortName`);
    await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`FullName\``);
    await queryRunner.query(`ALTER TABLE \`employer\` DROP COLUMN \`ShortName\``);
  }
}
