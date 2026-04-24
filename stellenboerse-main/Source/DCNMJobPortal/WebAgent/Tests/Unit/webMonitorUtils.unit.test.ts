import * as webMonitorUtils from "../../Services/webMonitorUtils";
import { jest, test, expect } from "@jest/globals";
import axios, { AxiosResponse, AxiosError } from "axios";
import { httpStatus } from "../../../Shared/httpStatus";
import { IWebsite, IEmployer } from "../../../Shared/interfaces";
import * as crawler from "../../Services/crawler";

const MOCKED_EMPLOYER_ID: number = 1;

const MOCK_HTML: string = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
    <style>
        body { font-family: Arial, sans-serif; }
    </style>
    <script>
        console.log("This is a script.");
    </script>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a paragraph of text.</p>
    <!-- This is a comment -->
    <noscript>This content is shown when JavaScript is disabled.</noscript>
</body>
</html>`;

const MOCK_HTML_LONG: string = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
    <style>
        body { font-family: Arial, sans-serif; }
    </style>
    <script>
        console.log("This is a script.");
    </script>
</head>
<body>
  <div>Helmholtz-Zentrum für Umweltforschung - UFZ Postdoctoral researcher Policy toolkit development to support landscape feature reintroduction in intensive agricultural lands Die Stelle Das EU-Projekt LAFERIA zielt darauf ab, die Lücken zwischen ökologischem Wissen, den Wahrnehmungen und Bedürfnissen der Landwirt:innen und der europäischen Agrarpolitik zu schließen. Ziel dieser Postdoc-Stelle ist es, politische Optionen und Strategien zu identifizieren und zu analysieren, insbesondere im Hinblick auf die Gemeinsame Agrarpolitik der EU und das EU Nature Restoration Law (NRL). Dies soll nachhaltige Landwirtschaftspraktiken fördern, insbesondere die Wiederherstellung von Landschaftselementen und die Anpflanzung von Bäumen in landwirtschaftlichen Gebieten. Arbeitsort Leipzig, Div Arbeitszeit 100 % (39 h / Woche / week) Der Arbeitsplatz ist für eine Besetzung in Vollzeit oder in Teilzeit geeignet. Befristung befristet/ 01.03.2025 - 31.12.2028 Vergütung nach TVöD bis zur Entgeltgruppe 13 inklusive der Sozialleistungen des öffentlichen Dienstes Kontakt Guy Peer,  guy.peer@idiv.de; +49 341 9733182 Helmholtz-Zentrum für Umweltforschung GmbH - UFZ Permoserstraße 15 04318 Leipzig Ihre Bewerbung Bitte reichen Sie Ihre aussagekräftige Bewerbung über unser Online-Portal</strong>, inklusive Ihres Motivationsschreiben und relevanter Anlagen. Um eine <strong>faire Auswahl zu gewährleisten, reichen Sie bitte Ihren Lebenslauf ohne Foto, Altersangabe oder Familienstands-Informationen ein. Diversität und Inklusion Das UFZ schätzt Vielfalt und setzt sich aktiv für die Chancengleichheit</strong> aller Beschäftigten unabhängig von ihrer Herkunft, Religion, Weltanschauung, Behinderung, des Alters und der sexuellen Identität ein. Wir freuen uns auf Menschen, die diverse Hintergründe, Identitäten und Perspektiven repräsentieren. Daher ermutigen wir insbesondere Menschen, die von struktureller Diskriminierung betroffen sind, sich bei uns zu bewerben. Das UFZ Das Helmholtz-Zentrum für Umweltforschung UFZ hat sich mit seinen 1100 Mitarbeiterinnen undMitarbeitern als internationales Kompetenzzentrum für Umweltwissenschaften einen hervorragendenRuf erworben. Wir sind Teil der größten Wissenschaftsorganisation Deutschlands der Helmholtz-Gemeinschaft. Unsere Mission: Wir forschen für eine Balance zwischen gesellschaftlicher Entwicklungund langfristigem Schutz unserer Lebensgrundlagen – für eine nachhaltige Entwicklung. Die Stelle</h2><p>Das EU-Projekt LAFERIA zielt darauf ab, die Lücken zwischen ökologischem Wissen, den Wahrnehmungen und Bedürfnissen der Landwirt:innen und der europäischen Agrarpolitik zu schließen. Ziel dieser Postdoc-Stelle ist es, politische Optionen und Strategien zu identifizieren und zu analysieren, insbesondere im Hinblick auf die Gemeinsame Agrarpolitik der EU (GAP) und das EU Nature Restoration Law (NRL). Dies soll nachhaltige Landwirtschaftspraktiken fördern, insbesondere die Wiederherstellung von Landschaftselementen und die Anpflanzung von Bäumen in landwirtschaftlichen Gebieten.</p></div><h2>Ihre Aufgaben</h2><p></p><ul><li>Wissenschaftliche Politikanalysen und Evaluierung von Stakeholder-Interaktionen, um die Möglichkeiten und Herausforderungen für die Ausweitung guter landwirtschaftlicher Praktiken und die Wiederherstellung von Landschaftselementen zu bewerten</li><li>Entwicklung einer Prioritätenkarte für Gebiete mit Potenzial zur Wiederherstellung von Landschaftselementen&nbsp;</li><li>Entwicklung von politischen Empfehlungen für die Gemeinsame Agrarpolitik, das Nature Restoration Law (NRL) und andere relevante Instrumente zur Förderung von Landschaftselementen</li><li>Zusammenarbeit mit Stakeholdern aus Wissenschaft, Politik und Praxis an sieben Fallstudienstandorten in Europa für die gemeinsame Entwicklung einer Vision für die Wiederherstellung von Landschaftselementen</li><li>Koordination von Workshops und Stakeholder-Prozessen für die Fallstudie der Stadt Leipzig mit Bezug auf die umliegenden landwirtschaftlichen Flächen</li><li>Wissenschaftliche Journal Publikationen und Beiträge zu Politik- und Praxisberichten </li></ul><p></p><h2>Wir bieten</h2><p></p><ul><li>Die Freiheit, selbst die anspruchsvollsten Herausforderungen zwischen Grundlagenforschung und praktischer Anwendung zu meistern</li><li>Die Chance, in interdisziplinären, internationalen Teams zu arbeiten und von vielfältigen Perspektiven zu profitieren</li><li>Eine erstklassige Einbindung in nationale und internationale Forschungsnetzwerke, um gemeinsam an globalen Herausforderungen zu arbeiten</li><li>Exzellente Forschungsinfrastruktur und Forschungsdatenmanagement, um Ihre Arbeit optimal zu unterstützen</li><li>Flexible Arbeitszeiten und vielfältige Angebote zur Vereinbarkeit von Careaufgaben und Beruf durch unser Familienbüro Kompetente Unterstützung und Beratung für internationale Kolleg*innen zum Ankommen am UFZ durch das International Office Jahressonderzahlung, vermögenswirksame Leistungen sowie bezuschusstes Deutschland-Job-Ticket Einen Arbeitsplatz in einer pulsierenden Region mit hoher Lebensqualität, sozialer und kultureller Vielfalt Ihr Profil Erfolgreich abgeschlossene Promotion in Politikwissenschaften, Landschaftsplanung oder anderen einschlägigen Sozial- und/oder Wirtschaftswissenschaften Forschungserfahrung in nachhaltigen Landmanagement und Landwirtschaft oder verwandten Themen Vertrautheit mit der EU-Politik, insbesondere mit der Gemeinsamen Agrarpolitik Dokumentierte Erfahrung in wissenschaftlichen Publikationen Ausgezeichnete Kommunikationsfähigkeiten in Englisch und Deutsch Erfahrung mit wissenschaftlich-politischen Analysen erwünscht Erfahrung in der Zusammenarbeit mit verschiedenen Stakeholdern, insbesondere Landwirt:innen und Verwaltungsbeamt:innen erwünscht Analytische Fähigkeiten, insbesondere in der Anwendung von R und/oder GIS-Software erwünscht Teamplayer und Bereitschaft zur Kooperation und Mitbetreuung von Studierenden Jetzt bewerben Bewerbungsfrist: 24.11.2024Weitere Karriereinformationen über das UFZ:</span><br>FamilienfreundlichkeitInternational OfficeBarrierefreiheit Diversity, Equity &amp; Inclusion Best Place to Learn - von Azubis geprüft - Top Ausbilder popup Bei Facebook teilen button Bei Facebook teilen twitter Bei Twitter teilen tweet Bei LinkedIn teilen mitteilen Bei XING teilen Bei XING teilen weitere Informationen weitere Informationen Info</div>
</body>
</html>`;

jest.mock("axios");
jest.mock("crypto", function () {
  return {
    createHash: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("mockedGeneratedHash"),
    }),
  };
});
jest.mock("../../Services/crawler");

const MOCKED_WEBSITE: IWebsite = {
  WebsiteID: 1,
  JobURL: "mockedUrl",
  ETag: "mockedEtag",
  Hash: "mockedHash",
  LastModified: "mockedLastModified",
  Jobs: [],
};

const MOCK_EMPLOYER: IEmployer = {
  EmployerID: 1,
  ShortName: "mockShorName",
  FullName: "mockFullName",
  Website: "mockWebsite",
  Emails: ["mockEmail"],
  created_at: new Date("2002-12-12"),
  Jobs: [],
  LocationID: 1,
  toValidate: false,
  isEmbedded: false,
  isActive: false,
  ContactPerson: null,
  showContact: false,
  sendValidationEmails: true,
};

let notFoundError: AxiosError = {
  response: {
    status: httpStatus.NOT_FOUND,
  },
  isAxiosError: true,
} as AxiosError;

let mockedResponse: AxiosResponse = {
  status: httpStatus.OK,
  data: MOCKED_WEBSITE,
} as AxiosResponse;

test("Get JobURLs by Employer ID", async function () {
  let getResponse: AxiosResponse = {
    status: httpStatus.OK,
    data: MOCK_EMPLOYER,
  } as AxiosResponse;
  jest.spyOn(axios, "get").mockResolvedValue(getResponse);
  let mockUrls: string[] = ["mockedUrl1", "mockedUrl2"];
  jest.spyOn(crawler, "getJobUrls").mockResolvedValue(mockUrls);
  let result: string[] = await webMonitorUtils.getJobUrlsByEmployerId(MOCK_EMPLOYER.EmployerID);
  expect(result).toBe(mockUrls);
});

test("Get Website by JobURL", async function () {
  jest.spyOn(axios, "put").mockResolvedValue(mockedResponse);
  let result: IWebsite | null = await webMonitorUtils.getWebsiteByJobUrl("mockurl");
  expect(result).toBe(MOCKED_WEBSITE);
});

test("Get Website by JobURL, Not Found", async function () {
  jest.spyOn(axios, "put").mockRejectedValue(notFoundError);
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  let result: IWebsite | null = await webMonitorUtils.getWebsiteByJobUrl("mockurl");
  expect(result).toBe(null);
});

test("Get Website by JobURL, Internal Error", async function () {
  jest.spyOn(axios, "put").mockRejectedValue(new Error());
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  await expect(webMonitorUtils.getWebsiteByJobUrl("mockurl")).rejects.toThrow();
});

test("Send to Extraction", async function () {
  jest.spyOn(axios, "post").mockResolvedValue(mockedResponse);
  await expect(
    webMonitorUtils.sendToExtraction("mockurl", 1, MOCKED_EMPLOYER_ID),
  ).resolves.toBeUndefined();
});

test("Create Website", async function () {
  let mockedResult: AxiosResponse = {
    status: httpStatus.OK,
    data: 1,
  } as AxiosResponse;
  mockedResponse.data = MOCK_HTML;
  mockedResponse.headers = { "last-modified": "mockedLastmodified" };
  jest.spyOn(axios, "post").mockResolvedValue(mockedResult);
  expect(await webMonitorUtils.createWebsite("mock", mockedResponse)).toBe(mockedResult.data);
});

test("Compare and Update Website, no Etag", async function () {
  mockedResponse.data = MOCK_HTML;
  mockedResponse.headers = { "last-modified": "mockedLastmodified" };
  let axiosSpy: jest.SpiedFunction<typeof axios.put> = jest.spyOn(axios, "put");
  axiosSpy.mockResolvedValue(null);
  await webMonitorUtils.compareAndUpdateWebsite(MOCKED_WEBSITE, mockedResponse);
  expect(axiosSpy).toHaveBeenCalled();
});

test("Compare and Update Website, no LastModified", async function () {
  mockedResponse.data = "";
  mockedResponse.headers = { etag: MOCKED_WEBSITE.ETag };
  let axiosSpy: jest.SpiedFunction<typeof axios.put> = jest.spyOn(axios, "put");
  await webMonitorUtils.compareAndUpdateWebsite(MOCKED_WEBSITE, mockedResponse);
  expect(axiosSpy).toHaveBeenCalled();
});

test("Hash is Different, False", async function () {
  expect(webMonitorUtils.hashIsDifferent("different", "true")).toBe(true);
});

test("Hash is Different, True", async function () {
  expect(webMonitorUtils.hashIsDifferent("same", "same")).toBe(false);
});

test("Make Request", async function () {
  jest.spyOn(axios, "get").mockResolvedValue(mockedResponse);
  expect(await webMonitorUtils.makeRequest("mockedUrl")).toBe(mockedResponse);
});

test("Extract Body Content", async function () {
  let result: string = webMonitorUtils.extractBodyContent(MOCK_HTML);
  const EXPECTED: string = `<h1>Hello, World!</h1><p>This is a paragraph of text.</p>`;
  expect(result).toBe(EXPECTED);
});

test("Is Valid Url (html > MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_FRAUNH), Fraunhofer OK", async function () {
  let result: boolean = await webMonitorUtils.verifyHtml(
    MOCK_HTML_LONG,
    "https://jobs.fraunhofer.de/mock",
  );
  jest.spyOn(axios, "get").mockResolvedValue({ status: httpStatus.OK });
  expect(result).toBe(true);
});

test("Is Valid Url (html < MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_FRAUNH), Fraunhofer Error", async function () {
  let result: boolean = await webMonitorUtils.verifyHtml(
    MOCK_HTML,
    "https://jobs.fraunhofer.de/mock",
  );
  jest.spyOn(axios, "get").mockResolvedValue({ status: httpStatus.OK });
  expect(result).toBe(false);
});

test("Is Valid Url (html > MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_OTHER)", async function () {
  let result: boolean = await webMonitorUtils.verifyHtml(MOCK_HTML_LONG, "https://mockUrl");
  jest.spyOn(axios, "get").mockResolvedValue({ status: httpStatus.OK });
  expect(result).toBe(true);
});

test("Is Valid Url (html < MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_OTHER)", async function () {
  let result: boolean = await webMonitorUtils.verifyHtml(MOCK_HTML, "https://mockUrl");
  jest.spyOn(axios, "get").mockResolvedValue({ status: httpStatus.OK });
  expect(result).toBe(false);
});

test("Delete Job by Url", async function () {
  jest.spyOn(axios, "post").mockResolvedValue(mockedResponse);
  let result: boolean = await webMonitorUtils.deleteJobByUrl("mockurl.com", 1);
  expect(result).toBe(true);
});

test("should return false when an AxiosError occurs", async function () {
  jest.spyOn(axios, "post").mockRejectedValue(notFoundError);
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  let result: boolean = await webMonitorUtils.deleteJobByUrl("mockurl.com", 1);
  expect(result).toBe(false);
});

test("Delete job by Url, Internal Error", async function () {
  jest.spyOn(axios, "post").mockRejectedValue(new Error("Unexpected Error"));
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  await expect(webMonitorUtils.deleteJobByUrl("mockurl.com", 1)).rejects.toThrow(
    "Internal Server Error",
  );
});

test("normalizeHtml removes dynamic acymailing suffixes", function () {
  const DYNAMIC_HTML: string = `<!DOCTYPE html><html><body><div class="acymailing_module" id="acymailing_module_formAcymailing12345"><form id="formAcymailing12345" onsubmit="return submitacymailingform('optin','formAcymailing12345')"><input id="user_name_formAcymailing12345"></form></div></body></html>`;
  const NORMALIZED: string = webMonitorUtils.normalizeHtml(DYNAMIC_HTML);
  expect(NORMALIZED).toContain("formAcymailing");
  expect(NORMALIZED).not.toMatch(/formAcymailing\d+/);
});

// Tests for error phrase detection in verifyHtml
describe("verifyHtml error phrase detection", () => {
  const createHtmlWithText = (text: string): string => `<!DOCTYPE html>
<html><head><title>Test</title></head>
<body>
<div>${text}</div>
<p>Additional content to ensure minimum length is met. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</body></html>`;

  test("should detect 'Die gesuchte Stellenausschreibung konnte nicht gefunden werden'", async () => {
    const html = createHtmlWithText("Die gesuchte Stellenausschreibung konnte nicht gefunden werden. In 10 Sekunden werden Sie weitergeleitet.");
    const result = await webMonitorUtils.verifyHtml(html, "https://karriere.leipzig.de/test");
    expect(result).toBe(false);
  });

  test("should detect 'Stellenausschreibung konnte nicht gefunden werden'", async () => {
    const html = createHtmlWithText("Leider: Stellenausschreibung konnte nicht gefunden werden.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/jobs/123");
    expect(result).toBe(false);
  });

  test("should detect 'Diese Stellenanzeige ist nicht mehr aktiv'", async () => {
    const html = createHtmlWithText("Diese Stellenanzeige ist nicht mehr aktiv. Bitte schauen Sie sich andere Stellen an.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/jobs/456");
    expect(result).toBe(false);
  });

  test("should detect 'Stelle wurde bereits besetzt'", async () => {
    const html = createHtmlWithText("Vielen Dank für Ihr Interesse. Die Stelle wurde bereits besetzt.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/jobs/789");
    expect(result).toBe(false);
  });

  test("should detect 'This position has been filled'", async () => {
    const html = createHtmlWithText("Thank you for your interest. This position has been filled.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/careers/123");
    expect(result).toBe(false);
  });

  test("should detect 'Job listing not found'", async () => {
    const html = createHtmlWithText("Sorry, Job listing not found. Please try another search.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/jobs/abc");
    expect(result).toBe(false);
  });

  test("should detect 'The requested job could not be found'", async () => {
    const html = createHtmlWithText("The requested job could not be found in our system.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/position/xyz");
    expect(result).toBe(false);
  });

  test("should detect 'Page not found' (German: Seite nicht gefunden)", async () => {
    const html = createHtmlWithText("Seite nicht gefunden. Bitte überprüfen Sie die URL.");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/stelle/404");
    expect(result).toBe(false);
  });

  test("should return true for valid job posting page", async () => {
    const html = createHtmlWithText(`
      <h1>Software Developer (m/w/d)</h1>
      <h2>Ihre Aufgaben</h2>
      <ul><li>Entwicklung von Web-Anwendungen</li><li>Code Reviews</li></ul>
      <h2>Ihr Profil</h2>
      <ul><li>3+ Jahre Erfahrung</li><li>JavaScript/TypeScript Kenntnisse</li></ul>
    `);
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/jobs/valid");
    expect(result).toBe(true);
  });

  test("should be case-insensitive when detecting error phrases", async () => {
    const html = createHtmlWithText("DIE GESUCHTE STELLENAUSSCHREIBUNG KONNTE NICHT GEFUNDEN WERDEN");
    const result = await webMonitorUtils.verifyHtml(html, "https://example.com/job/test");
    expect(result).toBe(false);
  });
});

