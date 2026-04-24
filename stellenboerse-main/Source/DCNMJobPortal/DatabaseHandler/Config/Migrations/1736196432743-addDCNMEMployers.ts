import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDCNMEMployers1736196432743 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO location (Street, HouseNumber, PostalCode, City, created_at) VALUES
            ('Bautzner Landstraße', '400', '01328', 'Dresden', NOW()),         
            ('Straße der Nationen', '62', '09111', 'Chemnitz', NOW()),         
            ('Königsbrücker Landstraße', '159', '01109', 'Dresden', NOW()),         
            ('Taschenberg', '2', '01067', 'Dresden', NOW()),         
            ('Helmholtzstraße', '10', '01069', 'Dresden', NOW()),         
            ('Fetscherstraße', '74', '01307', 'Dresden', NOW()),         
            ('Nordhäuser Str.', '63', '99089', 'Erfurt', NOW()),         
            ('Corrensstraße', '3', '06466', 'Seeland', NOW()),         
            ('Neuwerk', '7', '06108', 'Halle (Saale)', NOW()),         
            ('Theodor-Lieser-Str.', '2', '06120', 'Halle (Saale)', NOW()),         
            ('Weinberg', '3', '06120', 'Halle (Saale)', NOW()),         
            ('Kleine Märkerstraße', '8', '06108', 'Halle (Saale)', NOW()),         
            ('Universitätsplatz', '10', '06108', 'Halle (Saale)', NOW()),         
            ('Marktplatz', '1', '06108', 'Halle (Saale)', NOW()),         
            ('Fürstengraben', '1', '07743', 'Jena', NOW()),         
            ('Beutenbergstraße', '11', '07745', 'Jena', NOW()),         
            ('Bernburger Straße', '55', '06366', 'Köthen', NOW()),         
            ('Breitscheidstr', '2', '39114', 'Magdeburg', NOW()),         
            ('Alter Markt', '6', '39104', 'Magdeburg', NOW()),         
            ('Universitätsplatz', '2', '39106', 'Magdeburg', NOW()),         
            ('Eberhard-Leibnitz-Straße', '2', '06217', 'Merseburg', NOW())  
        `);

        await queryRunner.query(`
            INSERT INTO employer (LocationID, ShortName, FullName, Website, Emails, created_at) VALUES
            ((SELECT LocationID FROM location WHERE Street = 'Bautzner Landstraße' AND HouseNumber = '400'), 'HZDR', 'Helmholtz-Zentrum Dresden - Rossendorf e. V.', 'https://www.hzdr.de/db/!JobList?pNid=490', '["kontakt@hzdr.de"]', NOW()),            
            ((SELECT LocationID FROM location WHERE Street = 'Straße der Nationen' AND HouseNumber = '62'), 'TU Chemnitz', 'Technische Universität Chemnitz', 'https://www.tu-chemnitz.de/tu/stellen.html', '["rektor@tu-chemnitz.de"]', NOW()),            
            ((SELECT LocationID FROM location WHERE Street = 'Königsbrücker Landstraße' AND HouseNumber = '159'), 'Senckenberg', 'Senckenberg Gesellschaft für Naturforschung', 'https://www.senckenberg.de/de/karriere/', '["info@senckenberg.de"]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Taschenberg' AND HouseNumber = '2'), 'SKD', 'Staatsbetrieb Staatliche Kunstsammlungen Dresden', 'https://jobs.skd.museum/stellenangebote.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Helmholtzstraße' AND HouseNumber = '10'), 'TU Dresden', 'Technische Universität Dresden', 'https://tu-dresden.de/tu-dresden/arbeiten-an-der-tud/stellenangebote/stellenangebote?suche=1&style=cms2&lang=en', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Fetscherstraße' AND HouseNumber = '74'), 'UKD', 'Universitätsklinikum Carl Gustav Carus Dresden', 'https://karriere.ukdd.de/search/', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Nordhäuser Str.' AND HouseNumber = '63'), 'Universität Erfurt', 'Universität Erfurt', 'https://www.uni-erfurt.de/index.php?id=194', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Corrensstraße' AND HouseNumber = '3'), 'IPK', 'Leibniz Institute of Plant Genetics and Crop Plant Research', 'https://www.ipk-gatersleben.de/en/career/job-offers', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Neuwerk' AND HouseNumber = '7'), 'BURG', 'Burg Giebichenstein Kunsthochschule Halle', 'https://www.burg-halle.de/institution/stellenausschreibungen', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Theodor-Lieser-Str.' AND HouseNumber = '2'), 'IAMO', 'Leibniz-Institut für Agrarentwicklung in Transformationsökonomien', 'https://www.iamo.de/karriere/stellenangebote-stipendien', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Weinberg' AND HouseNumber = '3'), 'IPB', 'Leibniz-Institut für Pflanzenbiochemie', 'https://www.ipb-halle.de/karriere/stellenangebote/', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Kleine Märkerstraße' AND HouseNumber = '8'), 'IWH', 'Leibniz-Institut für Wirtschaftsforschung Halle', 'https://www.iwh-halle.de/karriere/jobs/arbeiten-am-iwh', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '10'), 'MLU', 'Martin-Luther-Universität Halle-Wittenberg', 'https://personal.verwaltung.uni-halle.de/jobs/extern/', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '10'), 'MLU', 'Martin-Luther-Universität Halle-Wittenberg', 'https://personal.verwaltung.uni-halle.de/jobs/wissmi/', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '10'), 'MLU', 'Martin-Luther-Universität Halle-Wittenberg', 'https://www.uni-halle.de/universitaet/gremien/senat/legislaturperiode22_26/professorenstellen/', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Marktplatz' AND HouseNumber = '1'), 'Stadt Halle (Saale)', 'Stadt Halle (Saale)', 'https://stadt-halle.stellen.center/', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Fürstengraben' AND HouseNumber = '1'), 'Universität Jena', 'Friedrich-Schiller-Universität Jena', 'https://www.uni-jena.de/122166/stellenmarkt', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Beutenbergstraße' AND HouseNumber = '11'), 'FLI', 'Leibniz-Institut für Alternsforschung', 'https://www.leibniz-fli.de/de/karriere-am-fli/offene-stellen', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Bernburger Straße' AND HouseNumber = '55'), 'Hochschule Anhalt', 'Hochschule Anhalt University of Applied Sciences', 'https://www.hs-anhalt.de/hochschule-anhalt/aktuelles/stellenangebote.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Breitscheidstr' AND HouseNumber = '2'), 'H2', 'Hochschule Magdeburg-Stendal', 'https://www.h2.de/hochschule/jobs-und-karriere/stellenangebote.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Alter Markt' AND HouseNumber = '6'), 'Landeshauptstadt Magdeburg', 'Landeshauptstadt Magdeburg', 'https://www.magdeburg.de/Karriereportal', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '2'), 'OVGU', 'Otto-von-Guericke-Universität Magdeburg', 'https://www.ovgu.de/Karriere/Stellenausschreibungen/Professuren.html ', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '2'), 'OVGU', 'Otto-von-Guericke-Universität Magdeburg', 'https://www.ovgu.de/Karriere_wissenschaftlichesPersonal.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '2'), 'OVGU', 'Otto-von-Guericke-Universität Magdeburg', 'https://www.ovgu.de/Karriere_Personal_VerwaltungTechnik.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '2'), 'OVGU', 'Otto-von-Guericke-Universität Magdeburg', 'https://www.ovgu.de/Karriere/Stellenausschreibungen/Lehrkr%C3%A4fte.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '2'), 'OVGU', 'Otto-von-Guericke-Universität Magdeburg', 'https://www.ovgu.de/Karriere/Stellenausschreibungen/Wissenschaftliche+bzw_+Studentische+Hilfskr%C3%A4fte-p-14001.html', '[""]', NOW()),  
            ((SELECT LocationID FROM location WHERE Street = 'Universitätsplatz' AND HouseNumber = '2'), 'OVGU', 'Otto-von-Guericke-Universität Magdeburg', 'https://www.med.ovgu.de/Karriere/Stellenangebote.html', '[""]', NOW()),
            ((SELECT LocationID FROM location WHERE Street = 'Eberhard-Leibnitz-Straße' AND HouseNumber = '2'), 'Hochschule Merseburg', 'Hochschule Merseburg University of Applied Sciences', 'https://www.hs-merseburg.de/hochschule/information/stellenausschreibungen/', '[""]', NOW())
        `);  
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM employer
            WHERE LocationID IN (
                SELECT LocationID FROM location WHERE Street IN (
                    'Bautzner Landstraße', 'Straße der Nationen', 'Königsbrücker Landstraße',
                    'Taschenberg', 'Helmholtzstraße', 'Fetscherstraße', 'Nordhäuser Str.',
                    'Corrensstraße', 'Neuwerk', 'Theodor-Lieser-Str.', 'Weinberg',
                    'Kleine Märkerstraße', 'Universitätsplatz', 'Marktplatz', 'Fürstengraben',
                    'Beutenbergstraße', 'Bernburger Straße', 'Breitscheidstr', 'Alter Markt',
                    'Eberhard-Leibnitz-Straße'
                )
            );
        `);
    
        await queryRunner.query(`
            DELETE FROM location
            WHERE Street IN (
                'Bautzner Landstraße', 'Straße der Nationen', 'Königsbrücker Landstraße',
                'Taschenberg', 'Helmholtzstraße', 'Fetscherstraße', 'Nordhäuser Str.',
                'Corrensstraße', 'Neuwerk', 'Theodor-Lieser-Str.', 'Weinberg',
                'Kleine Märkerstraße', 'Universitätsplatz', 'Marktplatz', 'Fürstengraben',
                'Beutenbergstraße', 'Bernburger Straße', 'Breitscheidstr', 'Alter Markt',
                'Eberhard-Leibnitz-Straße'
            );
        `);
    }
    

}
