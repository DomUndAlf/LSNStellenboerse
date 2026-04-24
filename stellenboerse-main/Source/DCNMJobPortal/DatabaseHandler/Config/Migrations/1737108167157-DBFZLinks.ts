import { MigrationInterface, QueryRunner } from "typeorm";

export class DBFZLinks1737108167157 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO employer (LocationID, ShortName, FullName, Website, Emails, created_at) VALUES
            ((SELECT LocationID FROM location WHERE Street = 'Torgauer Straße' AND HouseNumber = '116'), 'DBFZ', 'Deutsches Biomasseforschungszentrum gemeinnützige GmbH', 'https://www.dbfz.de/karriere/ausbildung/duales-studium', '["lsn.job.approval@gmail.com"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Torgauer Straße' AND HouseNumber = '116'), 'DBFZ', 'Deutsches Biomasseforschungszentrum gemeinnützige GmbH', 'https://www.dbfz.de/karriere/studentische-hilfskraefte', '["lsn.job.approval@gmail.com"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Torgauer Straße' AND HouseNumber = '116'), 'DBFZ', 'Deutsches Biomasseforschungszentrum gemeinnützige GmbH', 'https://www.dbfz.de/karriere/praktikumsthemen-und-abschlussarbeiten', '["lsn.job.approval@gmail.com"]', NOW())
        `);     
  
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM employer
            WHERE LocationID = (SELECT LocationID FROM location WHERE Street = 'Torgauer Straße' AND HouseNumber = '116')
            AND ShortName = 'DBFZ'
            AND FullName = 'Deutsches Biomasseforschungszentrum gemeinnützige GmbH'
            AND Website IN (
                'https://www.dbfz.de/karriere/ausbildung/duales-studium',
                'https://www.dbfz.de/karriere/studentische-hilfskraefte',
                'https://www.dbfz.de/karriere/praktikumsthemen-und-abschlussarbeiten'
            );
        `);
    }

}
