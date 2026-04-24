# DCNMJobPortal

## Vorbereitung/Einrichtung des Projekts

Um das Projekt nutzen zu können bzw. debuggen zu können, sind ein paar Schritte notwendig.

Vorbereitung: Entsprechende Befehle die angegeben werden, setzen voraus, das Ihr mit einem Terminal im root Verzeichnis des Node Projektes seid. Sprich unter stellenboerse/Source/DCNMJobPortal/.

1. Es müssen alle Pakete in der package.json lokal installiert wurden sein. Dazu, den Befehl `npm install` ausführen. Dies setzt voraus, das Node installiert ist. Wir verwenden dazu die Version "20.12.12". Diese kann hier heruntergeladen werden https://nodejs.org/en. Um npm ausführen zu können, müsst ihr euch im Ordner Backend befinden.
2. Sind alle Pakete installiert, kann das Projekt gebaut werden. Dazu gibt es ein Skript in der package.json welches per '''npm run build''' ausgeführt werden kann.
3. Jetzt kann der beliebige Browser geöffnet werden und unter localhost:1337 sollte die laufende server.js Datei (HelloWorld) angezeigt werden.

Ts-node kann verwendet werden, um TypeScript-Code direkt in Node.js auszuführen, ohne ihn zuerst zu kompilieren. Dabei wird jedoch kein Typ-Checking deines Codes durchgeführt. Daher empfehlen wir, deinen Code zuerst mit tsc zu überprüfen und ihn dann mit ts-node auszuführen, bevor du ihn bereitstellst.

Die folgenden zwei Abschnitte bieten eine detaillierte übersicht allgemein zum nutzen der IDE mit Typescript/Node.js. Zusätzlich wird hierbei erklärt wie ein Debugger angehängt werden kann zum testen innerhalb der IDE mit z.B. Haltepunkten. Alternativ kann dies auch per Entwicklerkonsole/F12 Menü im Browser geschehen. In den Links wird auch erklärt wie man ein Startskript/debugskript erstellt das bauen und starten im Browser per Knopfdruck ermöglicht.

### VSCode Anleitung

- https://code.visualstudio.com/docs/typescript/typescript-tutorial
- https://code.visualstudio.com/docs/typescript/typescript-debugging

### Visual Studio

- https://learn.microsoft.com/de-de/visualstudio/javascript/tutorial-nodejs-with-react-and-jsx?view=vs-2022

## Environment Variablen

Wir haben eine globale .env.global Datei die für alle einsehbar ist und im Repo landet. Um diese .env.global Datei zu verwenden, soll eine Kopie am gleichen ort erstellt werden. Diese dann in nur .env ohne .global umbenennen. Während in der .env.global öffentliche Varialben mit Wert stehen, gibt es auch Varialben ohne Werte (Passwörter/Keys). Diese werden dann nachträglich in die lokale .env händisch eingepflegt.

## Aufsetzen und Arbeiten mit der DB

1. Die Datenbank wird anfangs lokal bei euch laufen, deswegen müsst ihr zuerst MySQL installieren unter: https://dev.mysql.com/downloads/.
   Dort könnt ihr als Setup Type "Full" auswählen und alles zugehörige installieren. Port bleibt bei 3306, der User bleibt bei root und das Passwort sollte "stellenboerse" sein. In der MySQL Workbench könnt ihr dann ein neues Datenbankschema erstellen mit dem Namen "stellenboerse".

2. Um die Datenbank up-to-date zu halten benutzen wir migrations, um diese nutzen zu können, solltet ihr nochmal "npm install" ausführen, um alle dependencies herunterzuladen. Das könnt ihr in dem Terminal eingeben, wenn ihr euch im Backend-Ordner befindet.

3. Mit dem Befehl "npm run migration:run" holt ihr euch die neuste Version der Datenbank, mit "npm run migration:revert" macht ihr diese rückgängig.
   Um zu überprüfen, ob das funktioniert hat könnt ihr in der Workbench das Schema aktualisiern und die Tabellen job, employer, location und migration sollten dort zu finden sein.

4. Falls Daten der Datenbank verändert werden sollen, gelingt das mit dem Befehl "npx typeorm migration:create .\Config\Migrations\[Name der Migration]", zB: "npx typeorm migration:create .\Config\Migrations\TestMigration", welcher eine neue Datei im Ordner migration anlegt, wo die Änderungen rein geschrieben werden können.

5. Passend zu der Datenbankstruktur sind die Tabellen ebenfalls als entities abgespeichert, welche das Arbeiten mit den Daten erleichtert.

Weitere Infos zu Migrations:
https://typeorm.io
https://www.tutorialspoint.com/typeorm/typeorm_entity.htm

## ESLint und Prettier

1. Ihr müsst zuerst npm install. ggf. npm install --force

2. Öffnet zu allererst den DCNMJOBPORTAL Ordner indem ihr auf Ordner öffnen klickt und DCNMJOBPORTAL ordner auswählt, dann müsst ihr ggf. in den Einstellungen bei VSCode "Defaultformatter" suchen und dann ESLint auswählen.

3. Installiert bei eurer IDE Prettier

4. nach dem speichern der Datei sollte Prettier automatisch formatieren, falls nicht müsst ihr in den Einstellungen eurer IDE nachschlafgen.

5. bevor ihr Committed solltet ihr "npx eslint ." oder in der SRC File "npm run lint" machen.

## Migration erstellen

Mit folgende Code kann man eine Migration-File erstellen:  
`npx typeorm-ts-node-commonjs migration:create <Pfad zu migraiton Ordner>/<beliebige Name>`  
**Achtung**: diese File ist leer, und man muss mit `await queryRunner.query(``)` die SQL-Skript in `async up()`- Teil selbst schreiben. Zusätzlich muss man beim `async down()`- Teil ein SQL-Skript schreiben, die alle Änderungen aus der Teil `async up()` zurücksetzt.  
Ein Beispiel:  
Ich befinde in Ordner `./DCNMJobPortal/DatabaseHandler` und führe  
`npx typeorm-ts-node-commonjs migration:create ./Config/Migrations/beispielMigration`  
Dann wird ein File mit dem Name beispielMigration.ts im Ordner ./Config/Migraitons erzeugt.

## Migration generieren

Mit folgende Code kann man eine Migration-File durch typeorm automatisch erzeugen lassen:  
`npx typeorm-ts-node-commonjs migration:generate <Pfad zu migration Ordner>/<beliebige Name> -d <Pfad zu Datasource>/data-source.ts`  
Ein Beispiel:  
Ich befinde in Ordner `./DCNMJobPortal/DatabaseHandler` und führe  
`npx typeorm-ts-node-commonjs migration:generate ./Config/Migrations/beispielMigration -d ./Config/data-source.ts`  
 Dann wird ein File mit dem Name beispielMigration.ts im Ordner ./Database/migration erzeugt.

## Skript zur Datenbank-Initialisation Stand 08.11.2024
`drop database stellenboerse;`  
`create database stellenboerse;`  

**Danach** im Verzeichnis `./DatabaseHandler` führen Sie: `npm run migration:run`  

**Jetzt in MySQL**  
`use stellenboerse;`  
`INSERT INTO employer (ShortName, Website, Email) VALUES ('UFZ', 'https://www.ufz.de/index.php?de=34276', 'info@ufz.de');`  
`INSERT INTO location (Street, HouseNumber, PostalCode, City, created_at) VALUES ('Science Avenue', 101, '90001', 'Science City', NOW());`
