import { MigrationInterface, QueryRunner } from "typeorm";

export class ClearAllEmails1736201045109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE employer
            SET Emails = '["lsn.job.approval@gmail.com"]';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Assuming we cannot revert to the original emails (no backup exists),
        // we'll set Emails to an empty array as a fallback.
        await queryRunner.query(`
            UPDATE employer
            SET Emails = '[]';
        `);
    }
}
