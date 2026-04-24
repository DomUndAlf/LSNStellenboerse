import { MigrationInterface, QueryRunner } from "typeorm";

export class HousenumberToString1735320973463 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`location\` 
            MODIFY COLUMN \`HouseNumber\` VARCHAR(15) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`location\` 
            MODIFY COLUMN \`HouseNumber\` INT NULL
        `);
    }

}
