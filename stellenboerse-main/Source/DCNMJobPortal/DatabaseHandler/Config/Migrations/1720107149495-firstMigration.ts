import { MigrationInterface, QueryRunner } from "typeorm";

export class MyMigration1720107149495 implements MigrationInterface {
  name: string = "MyMigration1720107149495";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`employer\` (\`EmployerID\` int NOT NULL AUTO_INCREMENT, \`Name\` varchar(255) NOT NULL, \`Website\` varchar(255) NULL, \`Email\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`EmployerID\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`location\` (\`LocationID\` int NOT NULL AUTO_INCREMENT, \`Street\` varchar(225) NULL, \`HouseNumber\` int NULL, \`PostalCode\` varchar(5) NULL, \`City\` varchar(100) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`LocationID\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`job\` (\`JobID\` int NOT NULL AUTO_INCREMENT, \`EmployerID\` int NOT NULL, \`LocationID\` int NOT NULL, \`WebsiteID\` int NOT NULL, \`Title\` varchar(255) NOT NULL, \`Description\` text NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`JobID\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`website\` (\`WebsiteID\` int NOT NULL AUTO_INCREMENT, \`JobURL\` text NOT NULL, \`ETag\` text NOT NULL, \`Hash\` text NOT NULL, \`LastModified\` text NOT NULL, PRIMARY KEY (\`WebsiteID\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD CONSTRAINT \`FK_35f624a94b6b16f710c9618d312\` FOREIGN KEY (\`EmployerID\`) REFERENCES \`employer\`(\`EmployerID\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD CONSTRAINT \`FK_6ddf0ab698dd4379ffc670afbfb\` FOREIGN KEY (\`LocationID\`) REFERENCES \`location\`(\`LocationID\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD CONSTRAINT \`FK_f7dfd76050804275cb6aec1f72b\` FOREIGN KEY (\`WebsiteID\`) REFERENCES \`website\`(\`WebsiteID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_f7dfd76050804275cb6aec1f72b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_6ddf0ab698dd4379ffc670afbfb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_35f624a94b6b16f710c9618d312\``,
    );
    await queryRunner.query(`DROP TABLE \`website\``);
    await queryRunner.query(`DROP TABLE \`job\``);
    await queryRunner.query(`DROP TABLE \`location\``);
    await queryRunner.query(`DROP TABLE \`employer\``);
  }
}
