import { MigrationInterface, QueryRunner } from "typeorm";

const keywords = [
    { employerName: 'Fraunhofer IZI', locationStreet: 'Perlickstraße', locationHouseNumber: '1', keyword: 'Leipzig' },
    { employerName: 'Fraunhofer IZI', locationStreet: 'Schillingallee', locationHouseNumber: '68', keyword: 'Rostock' },
    { employerName: 'Fraunhofer IZI', locationStreet: 'Röntgenring', locationHouseNumber: '12', keyword: 'Würzburg' },
    { employerName: 'Fraunhofer IZI', locationStreet: 'Weinbergweg', locationHouseNumber: '22', keyword: 'Halle (Saale)' },
    { employerName: 'Frauenhofer IMW', locationStreet: 'Martin-Luther-Ring', locationHouseNumber: '13', keyword: 'Leipzig' },
    { employerName: 'Frauenhofer IMW', locationStreet: 'Leipziger Straße', locationHouseNumber: '70/71', keyword: 'Halle (Saale)' },
    { employerName: 'UFZ', locationStreet: 'Permoserstraße', locationHouseNumber: '15', keyword: 'Leipzig' },
    { employerName: 'UFZ', locationStreet: 'Theodor-Lieser-Straße', locationHouseNumber: '4', keyword: 'Halle' },
    { employerName: 'UFZ', locationStreet: 'Brückstraße', locationHouseNumber: '3a', keyword: 'Magdeburg' },
    { employerName: 'Studentenwerk Leipzig', locationStreet: 'Wächterstraße', locationHouseNumber: '11', keyword: 'HGB' },
    { employerName: 'Universität Leipzig', locationStreet: 'Marschnerstraße', locationHouseNumber: '31', keyword: 'Erziehungswissenschaftliche Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Johannisallee', locationHouseNumber: '29', keyword: 'Fakultät für Chemie und Mineralogie' },
    { employerName: 'Universität Leipzig', locationStreet: 'Schillerstraße', locationHouseNumber: '6', keyword: 'Fakultät für Geschichte, Kunst- und Regionalwissenschaften' },
    { employerName: 'Universität Leipzig', locationStreet: 'Talstraße', locationHouseNumber: '33', keyword: 'Fakultät für Lebenswissenschaften' },
    { employerName: 'Universität Leipzig', locationStreet: 'Augustusplatz', locationHouseNumber: '10', keyword: 'Fakultät für Mathematik und Informatik' },
    { employerName: 'Universität Leipzig', locationStreet: 'Linnéstraße', locationHouseNumber: '5', keyword: 'Fakultät für Physik und Erdsystemwissenschaften' },
    { employerName: 'Universität Leipzig', locationStreet: 'Beethovenstraße', locationHouseNumber: '15', keyword: 'Fakultät für Sozialwissenschaften und Philosophie' },
    { employerName: 'Universität Leipzig', locationStreet: 'Burgstraße', locationHouseNumber: '27', keyword: 'Juristenfakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Burgstraße', locationHouseNumber: '15', keyword: 'Philologische Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Jahnallee', locationHouseNumber: '59', keyword: 'Sportwissenschaftliche Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Beethovenstraße', locationHouseNumber: '25', keyword: 'Theologische Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Universitätsmedizin Leipzig' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Medizinische Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Universitätsklinikum' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'UKL' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Pharmakologie' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Rechtsmedizin' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'medizin' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Carl-Ludwig-Institut' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Hygiene' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Anatomie' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Neuropathologie' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Toxikologie' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Perinatalmedizin' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Rudolf-Schönheimer-Institut' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Medizinische' },
    { employerName: 'Universität Leipzig', locationStreet: 'Liebigstraße', locationHouseNumber: '27', keyword: 'Pharmazie' },
    { employerName: 'Universität Leipzig', locationStreet: 'An den Tierkliniken', locationHouseNumber: '19', keyword: 'Veterinärmedizinische Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Grimmaische Straße', locationHouseNumber: '12', keyword: 'Wirtschaftswissenschaftliche Fakultät' },
    { employerName: 'Universität Leipzig', locationStreet: 'Beethovenstraße', locationHouseNumber: '6', keyword: 'Universitätsbibliothek' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Ferdinand-Rhode-Straße', locationHouseNumber: '16', keyword: 'Beratungsgesellschaft für Beteiligungsverwaltung Leipzig mbH (bbvl)' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Losinskiweg', locationHouseNumber: '18', keyword: 'Wohnstätte Losinskiweg' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Prager Straße', locationHouseNumber: '118-136', keyword: 'Abteilung Stadtgrün' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Friedhofsweg', locationHouseNumber: '3', keyword: 'Abteilung Friedhöfe' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Prager Straße', locationHouseNumber: '118-136', keyword: 'Abteilung Freiraumentwicklung' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Prager Straße', locationHouseNumber: '118-136', keyword: 'Abteilung Gewässerentwicklung' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Teichstraße', locationHouseNumber: '20', keyword: 'Abteilung Stadtforsten' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Burgplatz', locationHouseNumber: '1', keyword: 'Fachbereich Gärten' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Prager Straße', locationHouseNumber: '118-136', keyword: 'Amt für Stadtgrün und Gewässer' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Friedrich-Dittes-Straße', locationHouseNumber: '9', keyword: 'WeltEntdecker' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Am Kirschberg', locationHouseNumber: '41', keyword: 'Am Kirschberg' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Augustusplatz', locationHouseNumber: '12', keyword: 'Oper Leipzig' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Markt', locationHouseNumber: '9', keyword: 'Invest Region Leipzig GmbH' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Dahlienstraße', locationHouseNumber: '30', keyword: 'Wohnheim Dahlienstraße' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Breunsdorffstraße', locationHouseNumber: '1', keyword: 'Wohnstätte Breunsdorffstraße' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Delitzscher Str.', locationHouseNumber: '141', keyword: 'Städtisches Klinikum "St. Georg" Leipzig ' },
    { employerName: 'Stadtverwaltung Leipzig', locationStreet: 'Elsbethstraße', locationHouseNumber: '19', keyword: 'Bürgerservice' }
   ];


export class AddKeyWords1735932896705 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const { employerName, locationStreet, locationHouseNumber, keyword } of keywords) {
            await queryRunner.query(
                `
                INSERT INTO employer_keyword_location (EmployerID, LocationID, Keyword)
                VALUES (
                    (SELECT EmployerID FROM employer WHERE ShortName = ?),
                    (SELECT LocationID FROM location WHERE Street = ? AND HouseNumber = ?),
                    ?
                )
                `,
                [employerName, locationStreet, locationHouseNumber, keyword]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        for (const { employerName, locationStreet, locationHouseNumber, keyword } of keywords) {
            await queryRunner.query(
                `
                DELETE FROM employer_keyword_location
                WHERE Keyword = ?
                AND EmployerID = (SELECT EmployerID FROM employer WHERE ShortName = ?)
                AND LocationID = (SELECT LocationID FROM location WHERE Street = ? AND HouseNumber = ?)
                `,
                [keyword, employerName, locationStreet, locationHouseNumber]
            );
        }
    }

}
