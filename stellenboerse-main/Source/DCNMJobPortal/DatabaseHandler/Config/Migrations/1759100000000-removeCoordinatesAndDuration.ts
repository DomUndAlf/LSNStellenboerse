import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCoordinatesAndDuration1759100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.dropColumnIfExists(queryRunner, "location", "Longitute");
    await this.dropColumnIfExists(queryRunner, "location", "Latitute");
    await this.dropColumnIfExists(queryRunner, "job", "Duration");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnIfMissing(
      queryRunner,
      "location",
      "Longitute",
      "varchar(10) NULL DEFAULT NULL",
    );
    await this.addColumnIfMissing(
      queryRunner,
      "location",
      "Latitute",
      "varchar(10) NULL DEFAULT NULL",
    );
    await this.addColumnIfMissing(queryRunner, "job", "Duration", "int NULL DEFAULT NULL");
  }

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (!(await this.columnExists(queryRunner, tableName, columnName))) {
      return;
    }

    await queryRunner.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    columnDefinition: string,
  ): Promise<void> {
    if (await this.columnExists(queryRunner, tableName, columnName)) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE \`${tableName}\` ADD \`${columnName}\` ${columnDefinition}`,
    );
  }

  private async columnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const RESULT: Array<{ columnCount: number | string }> = await queryRunner.query(
      `
        SELECT COUNT(*) AS columnCount
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return Number(RESULT[0]?.columnCount ?? 0) > 0;
  }
}
