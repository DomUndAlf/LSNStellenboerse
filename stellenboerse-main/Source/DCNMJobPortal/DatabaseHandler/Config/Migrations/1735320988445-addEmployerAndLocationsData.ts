import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployerAndLocationsData1735320988445 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM job;`);
        await queryRunner.query(`DELETE FROM employer;`);
        await queryRunner.query(`DELETE FROM location;`);

        await queryRunner.query(`
            INSERT INTO location (Street, HouseNumber, PostalCode, City, created_at) VALUES
            ('Torgauer Straße', '116', '04347', 'Leipzig', NOW()),            
            ('Große Steinstraße', '19', '06108', 'Halle (Saale)', NOW()),
            ('Schönauer Straße', '113a', '04207', 'Leipzig', NOW()),
            ('Perlickstraße', '1', '04103', 'Leipzig', NOW()),
            ('Martin-Luther-Ring', '13', '04109', 'Leipzig', NOW()),
            ('Wächterstraße', '11', '04107', 'Leipzig', NOW()),
            ('Grassistraße', '8', '04107', 'Leipzig', NOW()),
            ('Karl-Liebknecht-Straße', '132', '04277', 'Leipzig', NOW()),
            ('Reichsstraße', '4-6', '04109', 'Leipzig', NOW()),
            ('Goldschmidtstraße', '28', '04103', 'Leipzig', NOW()),
            ('Permoserstraße', '15', '04318', 'Leipzig', NOW()),
            ('Deutscher Platz', '6', '04103', 'Leipzig', NOW()),
            ('Stephanstraße', '1a', '04103', 'Leipzig', NOW()),
            ('Inselstraße', '22', '04103', 'Leipzig', NOW()),
            ('Martin-Luther-Ring', '4', '04109', 'Leipzig', NOW()),
            ('Goethestraße', '6', '04109', 'Leipzig', NOW()),
            ('Ritterstraße', '26', '04109', 'Leipzig', NOW());
        `);

        await queryRunner.query(`
            INSERT INTO employer (LocationID, ShortName, FullName, Website, Emails, created_at) VALUES
            ((SELECT LocationID FROM location WHERE Street = 'Torgauer Straße' AND HouseNumber = '116'), 'LSN', 'Leipzig Science Network e. V.', 'https://www.leipzig-science-network.de/index.php/de-de/stellenboerse', '["info@lsn.de"]', NOW()),            
            ((SELECT LocationID FROM location WHERE Street = 'Schönauer Straße' AND HouseNumber = '113a'), 'Berufsakademie Leipzig', 'Berufsakademie Sachsen Staatliche Studienakademie Leipzig', 'https://www.ba-leipzig.de/die-akademie/stellenangebote', '["info.leipzig@ba-sachsen.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Torgauer Straße' AND HouseNumber = '116'), 'DBFZ', 'Deutsches Biomasseforschungszentrum gemeinnützige GmbH', 'https://www.dbfz.de/karriere/stellenausschreibungen/', '["info@dbfz.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Perlickstraße' AND HouseNumber = '1'), 'Fraunhofer IZI', 'Fraunhofer-Institut für Zelltherapie und Immunologie', 'https://jobs.fraunhofer.de/search/?createNewAlert=false&q=&optionsFacetsDD_customfield1=&optionsFacetsDD_customfield2=&optionsFacetsDD_customfield3=&optionsFacetsDD_customfield5=&optionsFacetsDD_customfield4=IZI+-+Zelltherapie+und+Immunologie&locationsearch=', '["info@izi.fraunhofer.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Martin-Luther-Ring' AND HouseNumber = '13'), 'Frauenhofer IMW', 'Fraunhofer-Zentrum für Internationales Management und Wissensökonomie IMW', 'https://jobs.fraunhofer.de/search/?createNewAlert=false&q=&locationsearch=&optionsFacetsDD_customfield1=&optionsFacetsDD_customfield2=&optionsFacetsDD_customfield3=&optionsFacetsDD_customfield5=&optionsFacetsDD_customfield4=IMW+-+Internationales+Management+und+Wissens%C3%B6konom', '["info@imw.fraunhofer.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Permoserstraße' AND HouseNumber = '15'), 'UFZ', 'Helmholtz-Zentrum für Umweltforschung GmbH - UFZ', 'https://www.ufz.de/index.php?de=34276', '["info@ufz.de"]', NOW()),           
            ((SELECT LocationID FROM location WHERE Street = 'Wächterstraße' AND HouseNumber = '11'), 'HGB', 'Hochschule für Grafik und Buchkunst Leipzig/Academy of Fine Arts Leipzig', 'https://www.hgb-leipzig.de/hochschule/stellen/', '["hgb@hgb-leipzig.de"]', NOW()),          
            ((SELECT LocationID FROM location WHERE Street = 'Grassistraße' AND HouseNumber = '8'), 'HMT', 'Hochschule für Musik und Theater "Felix Mendelssohn Bartholdy" Leipzig', 'https://www.hmt-leipzig.de/de/home/hochschule/vakanzen', '["rektor@hmt-leipzig.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Karl-Liebknecht-Straße' AND HouseNumber = '132'), 'HTWK Leipzig', 'Hochschule für Technik  Wirtschaft und Kultur Leipzig', 'https://www.htwk-leipzig.de/hochschule/stellenangebote/fach-und-fuehrungskraefte', '["info@htwk-leipzig.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Karl-Liebknecht-Straße' AND HouseNumber = '132'), 'HTWK Leipzig', 'Hochschule für Technik  Wirtschaft und Kultur Leipzig', 'https://www.htwk-leipzig.de/hochschule/stellenangebote/professorales-personal', '["info@htwk-leipzig.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Reichsstraße' AND HouseNumber = '4-6'), 'GWZO', 'Leibniz-Institut für Geschichte und Kultur des östlichen Europa (GWZO)', 'https://www.leibniz-gwzo.de/de/institut/personen/stellenangebote', '["info@leibniz-gwzo.de"]', NOW()),         
            ((SELECT LocationID FROM location WHERE Street = 'Goldschmidtstraße' AND HouseNumber = '28'), 'Dubnow-Institut', 'Leibniz-Institut für jüdische Geschichte und Kultur – Simon Dubnow e.V.', 'https://www.dubnow.de/institut/ausschreibungen', '["info@dubnow.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Permoserstraße' AND HouseNumber = '15'), 'IOM', 'Leibniz-Institut für Oberflächenmodifizierung e.V.', 'https://www.iom-leipzig.de/karriere/stellenangebote.html', '["info@iom-leipzig.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Permoserstraße' AND HouseNumber = '15'), 'TROPOS', 'Leibniz-Institut für Troposphärenforschung e.V.', 'https://www.tropos.de/institut/beruf-karriere/stellenausschreibungen', '["info@tropos.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Deutscher Platz' AND HouseNumber = '6'), 'MPI-EVA', 'Max-Planck-Instituts für evolutionäre Anthropologie', 'https://www.eva.mpg.de/de/karriere/stellenangebote', '["info@eva.mpg.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Stephanstraße' AND HouseNumber = '1a'), 'MPI CBS', 'Max-Planck-Institut für Kognitions- und Neurowissenschaften', 'https://www.cbs.mpg.de/stellenmarkt/stellenangebote', '["cschroeder@cbs.mpg.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Inselstraße' AND HouseNumber = '22'), 'MPI MiS', 'MPI für Mathematik in den Naturwissenschaften', 'https://www.mis.mpg.de/de/karriere/stellenangebote', '["managing-director@mis.mpg.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Martin-Luther-Ring' AND HouseNumber = '4'), 'Stadtverwaltung Leipzig', 'Stadtverwaltung Leipzig', 'https://karriere.leipzig.de/stellenangebote', '["personalgewinnung@leipzig.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Goethestraße' AND HouseNumber = '6'), 'Studentenwerk Leipzig', 'Studentenwerk Leipzig', 'https://www.studentenwerk-leipzig.de/ueber-uns/jobs-und-karriere/', '["info@studentenwerk-leipzig.de"]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Ritterstraße' AND HouseNumber = '26'), 'Universität Leipzig', 'Universität Leipzig', 'https://www.uni-leipzig.de/universitaet/arbeiten-an-der-universitaet-leipzig/stellenausschreibungen', '["kommunikation@uni-leipzig.de"]', NOW());
        `);     
  
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM job;`);
        await queryRunner.query(`DELETE FROM employer;`);
        await queryRunner.query(`DELETE FROM location;`);
    }

}
