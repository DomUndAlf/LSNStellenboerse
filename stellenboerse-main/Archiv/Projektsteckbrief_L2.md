# Projektsteckbrief

## Motivation: Warum?

### Warum wurde das Projekt gestartet?
Das Projekt wurde ins Leben gerufen, um die Vernetzung von Arbeitssuchenden im mitteldeutschen Raum zu fördern. Es zielt darauf ab, eine zentralisierte Übersicht über Stellenangebote zu bieten und somit auch die Reichweite dieser zu erhöhen. Ein weiterer Grund war die Vereinfachung der Arbeit des DCNM bei der Koordinierung von Stellenangeboten.

### Welche Ziele wurden sich gesetzt?
Die Ziele waren das Erschaffen einer einheitlichen Stellenbörse und die Steigerung der Attraktivität des mitteldeutschen Raums als Wissenschaftsstandort. Zudem soll die Extraktion von Stellenangeboten automatisiert ablaufen und keine Zusatzarbeit für die einzelnen Institutionen geschaffen werden.

### Was sind die Anforderungen?
Die Anforderungen umfassen einen einheitlichen Überblick, die leichte Erweiterbarkeit um weitere Institutionen, eine große Bandbreite an Filtermöglichkeiten, minimalen Aufwand und die Unterstützung von Deutsch und Englisch als Sprache. Zudem ist eine Zeitberechnung des Arbeitswegs von großer Bedeutung.

### Wer profitiert davon? Und wie?
Mitglieder des LSN profitieren durch mehr Reichweite, Arbeitssuchende durch einen gesammelten Überblick über Stellenangebote, und das DCNM durch Arbeitserleichterung. Das LSN selbst gewinnt an Attraktivität und ermöglicht als Projektsponsor den gesamten Prozess. Akademikerpaare können in die Region Mitteldeutschland kommen und gemeinsam Stellen in der Wissenschaft finden.

## Umsetzung: Wie?

### Was ist unser allgemeiner Lösungsansatz?
Unser Lösungsansatz umfasst die Entwicklung einer Webseite zur Anzeige der Stellenangebote. Die Stellenangebote werden von den Webseiten der Organisationen extrahiert und gespeichert. Die Extrahierten Daten werden danach an die Organisationen versendet zur Validierung, ob diese korekt sind. Nach der Bestätigung werden sie in der Stellenbörse angezeigt.
### Was ist unser Lösungsansatz auf technischer Ebene?
Wir verwenden eine OpenAI API zur Extraktion der Job-Informationen. Ein Agent extrahiert automatisch die Daten und speichert die Details in einer Datenbank. Per E-Mail wird der Link und Schlüssel zu der Validierungswebseite an die Organisationen versendet. 

### Welche Technologien wurden für die Lösung verwendet?
  - **Frontend:** React, Tailwind
  - **Backend:** Node.js, express.js, Nodemon
  - **Datenbank:** MySQL
  - **CI/CD:** Gitlab
  - **Testing:** Jest
  - **Linting:** ESLint, Prettier
  - **Programmiersprache:** Typescript

### Wie waren wir organisatorisch aufgebaut?
Wir arbeiten mit Scrum in 2-Wochen-Sprints. Die Organisation erfolgt über Tools wie Mural, Retro, Discord, Gitlab Issuesboard und das hier auffindbare Wiki. Unser Team arbeitet als Cross-Functional Team und jeder aus dem Team kann daher jede Aufgabe übernehmen.

### Welche Architektur haben wir?
Wir haben uns für eine Service-Oriented-Architektur entschieden, damit die Anwendung gut wartbar und erweiterbar ist. Unsere Services sind: 


### Welche Komponenten wurden implementiert?
 - **Scheduler:** Dieser startet den Extraktionsprozess in regelmäßigen Abständen
 - **WebAgent:** Dieser extrahiert alle URLs die zu Jobs gehören und überprüft ob an den Seiten Änderungen vorhanden sind
 - **AiAgent:** Dieser erhält die URLs und extrahiert die Daten aus den Stellenangeboten.
 - **Validation:** Dieser Service erstellt einen Schlüssel für den Job und versendet diesen per Mail an die Organisationen.
 - **ValidationWebsite:** Dieser stellt die extrahierten Daten zur Validierung dar
 - **DatabaseHandler:** Dieser übernimmt die Kommunikation zur Datenbank
 - **Frontend:** Dieser Service stellt die Stellenbörse für den Nutzer dar

## Ziele: Was?
### Erfüllte User Storys
- **Als Arbeitssuchender** möchte ich einen gesammelten Überblick über lokale wissenschaftliche Stellenausschreibungen erhalten, um mich in einer unbekannten Region besser orientieren zu können.
- **Als Organisation** möchte ich meine offenen Stellen an einer zentralen Sammelstelle anzeigen lassen, um möglichst viele Kandidaten zu erreichen.
- **Als Organisation** möchte ich meine Stellenangebote nicht doppelt eingeben müssen, um den Aufwand bei der Veröffentlichung von Stellenanzeigen zu minimieren.
- **Als Organisation** möchte ich, dass die Plattform in der Lage ist, Stellenanzeigen aus unterschiedlichen Datenformaten und ohne einheitlichen Standard zu extrahieren, damit ich meine Daten mit möglichst wenig Aufwand bereitstellen kann.
- **Als Verwalter der Software von LSN** möchte ich neue Institutionen einfach hinzufügen können, um die Plattform flexibel und erweiterbar zu gestalten.
- **Als LSN-Geschäftsführer** möchte ich die Diversität der Stellenangebote darstellen, um Mitteldeutschland als attraktive Region für Arbeitsuchende und mehr Suchende anzulocken.

### Zukünftige Nutzung
Die Stellenbörse wird auf den Seiten von LSN und DCNM eingebunden und geht nach dem Projektende Live. Das bedeutet, dass regelmäßig Stellen extrahiert und von den Organisationen validiert werden.

## Projektsponsor und Team
- Leipzig Science Network: Pascal Schaefer
- L2: Vladislav Antonov - Max Mager - Batbuyan Buyandelger - Duc Lâm Nguyen - Marie Schwabe - Mahmod Qobty - Dominique Fischer - Louis Westerheide - Robert Hobelsberger - Artem Zakharevych - Ilyass Essar Rhini - Junyu Guo - Thorben Stehling