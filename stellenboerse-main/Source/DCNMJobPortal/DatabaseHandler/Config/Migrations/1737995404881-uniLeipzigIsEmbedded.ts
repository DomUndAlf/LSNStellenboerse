import { MigrationInterface, QueryRunner } from "typeorm";

export class UniLeipzigIsEmbedded1737995404881 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE employer
            SET isEmbedded = true
            WHERE ShortName IN ('Universität Leipzig');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE employer
            SET isEmbedded = false
            WHERE ShortName IN ('Universität Leipzig');
        `);
    }

}