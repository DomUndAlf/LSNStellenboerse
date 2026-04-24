import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLookUpTableForLocation1735320004916 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`employer_keyword_location\` (
                \`ID\` INT AUTO_INCREMENT PRIMARY KEY,
                \`EmployerID\` INT NOT NULL,
                \`LocationID\` INT NOT NULL,
                \`Keyword\` VARCHAR(255) NOT NULL,
                CONSTRAINT \`FK_Employer\` FOREIGN KEY (\`EmployerID\`) REFERENCES \`employer\`(\`EmployerID\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_Location\` FOREIGN KEY (\`LocationID\`) REFERENCES \`location\`(\`LocationID\`) ON DELETE CASCADE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`employer_keyword_location\`;
        `);
    }

}
