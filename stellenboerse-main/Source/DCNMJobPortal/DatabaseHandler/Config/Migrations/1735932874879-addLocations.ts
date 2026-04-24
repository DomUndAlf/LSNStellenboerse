import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocations1735932874879 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO location (Street, HouseNumber, PostalCode, City, created_at) VALUES
            ('Schillingallee', '68', '18057', 'Rostock', NOW()),    
            ('Weinbergweg', '22', '06120', 'Halle (Saale)', NOW()),    
            ('Röntgenring', '12', '97070', 'Würzburg', NOW()),    
            ('Leipziger Straße', '70/71', '06108', 'Halle (Saale)', NOW()),    
            ('Theodor-Lieser-Straße', '4', '06120', 'Halle', NOW()),    
            ('Brückstraße', '3a', '39114', 'Magdeburg', NOW()),    
            ('Marschnerstraße', '31', '04109', 'Leipzig', NOW()),    
            ('Johannisallee', '29', '04103', 'Leipzig', NOW()),    
            ('Schillerstraße', '6', '04109', 'Leipzig', NOW()),    
            ('Talstraße', '33', '04103', 'Leipzig', NOW()),    
            ('Augustusplatz', '10', '04109', 'Leipzig', NOW()),    
            ('Linnéstraße', '5', '04103', 'Leipzig', NOW()),    
            ('Beethovenstraße', '15', '04107', 'Leipzig', NOW()),    
            ('Beethovenstraße', '25', '04107', 'Leipzig', NOW()),    
            ('Burgstraße', '27', '04109', 'Leipzig', NOW()),    
            ('Burgstraße', '15', '04109', 'Leipzig', NOW()),    
            ('Jahnallee', '59', '04109', 'Leipzig', NOW()),    
            ('Liebigstraße', '27', '04103', 'Leipzig', NOW()),    
            ('An den Tierkliniken', '19', '04103', 'Leipzig', NOW()),    
            ('Grimmaische Straße', '12', '04109', 'Leipzig', NOW()),    
            ('Beethovenstraße', '6', '04107', 'Leipzig', NOW()),    
            ('Ferdinand-Rhode-Straße', '16', '04107', 'Leipzig', NOW()),    
            ('Losinskiweg', '18', '04347 ', 'Leipzig', NOW()),  
            ('Prager Straße', '118-136', '04092', 'Leipzig', NOW()),
            ('Friedhofsweg', '3', '04092', 'Leipzig', NOW()),
            ('Teichstraße', '20', '04092', 'Leipzig', NOW()),
            ('Burgplatz', '1', '04092', 'Leipzig', NOW()),  
            ('Friedrich-Dittes-Straße', '9', '04318', 'Leipzig', NOW()),  
            ('Am Kirschberg', '41', '04209', 'Leipzig', NOW()),  
            ('Augustusplatz', '12', '04109', 'Leipzig', NOW()),  
            ('Markt', '9', '04109', 'Leipzig', NOW()),  
            ('Dahlienstraße', '30', '04209', 'Leipzig', NOW()),  
            ('Breunsdorffstraße', '1', '04349', 'Leipzig', NOW()),  
            ('Delitzscher Str.', '141', '04129', 'Leipzig', NOW()),  
            ('Elsbethstraße', '19', '04155', 'Leipzig', NOW())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM location WHERE 
                (Street = 'Schillingallee' AND HouseNumber = '68' AND PostalCode = '18057' AND City = 'Rostock') OR
                (Street = 'Weinbergweg' AND HouseNumber = '22' AND PostalCode = '06120' AND City = 'Halle (Saale)') OR
                (Street = 'Röntgenring' AND HouseNumber = '12' AND PostalCode = '97070' AND City = 'Würzburg') OR
                (Street = 'Leipziger Straße' AND HouseNumber = '70/71' AND PostalCode = '06108' AND City = 'Halle (Saale)') OR
                (Street = 'Theodor-Lieser-Straße' AND HouseNumber = '4' AND PostalCode = '06120' AND City = 'Halle') OR
                (Street = 'Brückstraße' AND HouseNumber = '3a' AND PostalCode = '39114' AND City = 'Magdeburg') OR
                (Street = 'Marschnerstraße' AND HouseNumber = '31' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Johannisallee' AND HouseNumber = '29' AND PostalCode = '04103' AND City = 'Leipzig') OR
                (Street = 'Schillerstraße' AND HouseNumber = '6' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Talstraße' AND HouseNumber = '33' AND PostalCode = '04103' AND City = 'Leipzig') OR
                (Street = 'Augustusplatz' AND HouseNumber = '10' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Linnéstraße' AND HouseNumber = '5' AND PostalCode = '04103' AND City = 'Leipzig') OR
                (Street = 'Beethovenstraße' AND HouseNumber = '15' AND PostalCode = '04107' AND City = 'Leipzig') OR
                (Street = 'Beethovenstraße' AND HouseNumber = '25' AND PostalCode = '04107' AND City = 'Leipzig') OR
                (Street = 'Burgstraße' AND HouseNumber = '27' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Jahnallee' AND HouseNumber = '59' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Liebigstraße' AND HouseNumber = '27' AND PostalCode = '04103' AND City = 'Leipzig') OR
                (Street = 'An den Tierkliniken' AND HouseNumber = '19' AND PostalCode = '04103' AND City = 'Leipzig') OR
                (Street = 'Grimmaische Straße' AND HouseNumber = '12' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Beethovenstraße' AND HouseNumber = '6' AND PostalCode = '04107' AND City = 'Leipzig') OR
                (Street = 'Ferdinand-Rhode-Straße' AND HouseNumber = '16' AND PostalCode = '04107' AND City = 'Leipzig') OR
                (Street = 'Losinskiweg' AND HouseNumber = '18' AND PostalCode = '04347 ' AND City = 'Leipzig') OR
                (Street = 'Prager Straße' AND HouseNumber = '118-136' AND PostalCode = '04092' AND City = 'Leipzig') OR
                (Street = 'Friedhofsweg' AND HouseNumber = '3' AND PostalCode = '04092' AND City = 'Leipzig') OR
                (Street = 'Teichstraße' AND HouseNumber = '20' AND PostalCode = '04092' AND City = 'Leipzig') OR
                (Street = 'Burgplatz' AND HouseNumber = '1' AND PostalCode = '04092' AND City = 'Leipzig') OR
                (Street = 'Friedrich-Dittes-Straße' AND HouseNumber = '9' AND PostalCode = '04318' AND City = 'Leipzig') OR
                (Street = 'Am Kirschberg' AND HouseNumber = '41' AND PostalCode = '04209' AND City = 'Leipzig') OR
                (Street = 'Augustusplatz' AND HouseNumber = '12' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Markt' AND HouseNumber = '9' AND PostalCode = '04109' AND City = 'Leipzig') OR
                (Street = 'Dahlienstraße' AND HouseNumber = '30' AND PostalCode = '04209' AND City = 'Leipzig') OR
                (Street = 'Breunsdorffstraße ' AND HouseNumber = '1' AND PostalCode = '04349' AND City = 'Leipzig') OR
                (Street = 'Delitzscher Str.' AND HouseNumber = '141' AND PostalCode = '04129' AND City = 'Leipzig') OR
                (Street = 'Elsbethstraße ' AND HouseNumber = '19' AND PostalCode = '04155' AND City = 'Leipzig')
        `);
    }

}
