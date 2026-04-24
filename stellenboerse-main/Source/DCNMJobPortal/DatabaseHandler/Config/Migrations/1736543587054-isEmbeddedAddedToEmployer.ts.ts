import { MigrationInterface, QueryRunner } from "typeorm";

export class IsEmbeddedAddedToEmployer1736543587054 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE employer
            ADD COLUMN isEmbedded BOOLEAN DEFAULT false;
        `);

        await queryRunner.query(`
            UPDATE employer
            SET isEmbedded = true
            WHERE ShortName IN ('HGB', 'HMT', 'BURG', 'FLI', 'H2');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE employer
            DROP COLUMN isEmbedded;
        `);
    }
}
