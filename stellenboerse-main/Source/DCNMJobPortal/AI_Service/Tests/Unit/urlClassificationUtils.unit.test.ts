import { test, expect, jest, describe } from "@jest/globals";
import axios, { AxiosInstance } from "axios";
import {
  addToBlacklist,
  addToWhitelist,
  isRelevantUrl,
  isPotentialJobUrl,
  calculateContentScore,
  isKnownGeneralUrl,
  isPdfLikeUrl,
  isOverviewPage,
} from "../../Services/urlClassificationUtils";

jest.mock("axios");
const MOCKED_AXIOS: jest.Mocked<AxiosInstance> = jest.mocked(axios);

test("addToBlacklist - Successful addition", async function () {
  // Arrange
  const EMPLOYER_ID: number = 1;
  const URL: string = "https://example.com/blacklist";
  MOCKED_AXIOS.put.mockResolvedValueOnce({ status: 200 });

  // Act
  await addToBlacklist(EMPLOYER_ID, URL);

  // Assert
  expect(MOCKED_AXIOS.put).toHaveBeenCalledWith(
    `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/blacklist`,
    { urls: [URL] },
  );
});

test("addToBlacklist - Axios error", async function () {
  // Arrange
  const EMPLOYER_ID: number = 1;
  const URL: string = "https://example.com/blacklist";
  MOCKED_AXIOS.put.mockRejectedValueOnce(new Error("Network Error"));

  // Act
  await addToBlacklist(EMPLOYER_ID, URL);

  // Assert
  expect(MOCKED_AXIOS.put).toHaveBeenCalledTimes(2);
});

test("addToWhitelist - Successful addition", async function () {
  // Arrange
  const EMPLOYER_ID: number = 2;
  const URL: string = "https://example.com/whitelist";
  MOCKED_AXIOS.put.mockResolvedValueOnce({ status: 200 });

  // Act
  await addToWhitelist(EMPLOYER_ID, URL);

  // Assert
  expect(MOCKED_AXIOS.put).toHaveBeenCalledWith(
    `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
    { urls: [URL] },
  );
});

test("isRelevantUrl - Valid and invalid URLs", function () {
  // Arrange
  const VALID_URL: string = "https://example.com";
  const EMAIL_URL: string = "mailto:info@example.com";
  const JAVASCRIPT_URL: string = "javascript:void(0)";

  // Act & Assert
  expect(isRelevantUrl(VALID_URL)).toBe(true);
  expect(isRelevantUrl(EMAIL_URL)).toBe(false);
  expect(isRelevantUrl(JAVASCRIPT_URL)).toBe(false);
});

test("isPotentialJobUrl - Job-related and non-job-related URLs", function () {
  // Arrange
  const JOB_URL: string = "https://example.com/job";
  const GENERAL_URL: string = "https://example.com/about";

  // Act & Assert
  expect(isPotentialJobUrl(JOB_URL)).toBe(true);
  expect(isPotentialJobUrl(GENERAL_URL)).toBe(false);
});

test("calculateContentScore - High and low content scores", function () {
  // Arrange
  const JOB_CONTENT: string = "Wir bieten Ihnen eine Position als Software Engineer.";
  const GENERAL_CONTENT: string = "Diese Seite enthält Forschungsinformationen.";

  // Act
  const HIGH_SCORE: number = calculateContentScore(JOB_CONTENT);
  const LOW_SCORE: number = calculateContentScore(GENERAL_CONTENT);

  // Assert
  expect(HIGH_SCORE).toBeGreaterThan(0);
  expect(LOW_SCORE).toBeLessThan(0);
});

test("isKnownGeneralUrl - Known and unknown general URLs", function () {
  // Arrange
  const EXACT_URL: string = "https://www.jobs-studentenwerke.de/";
  const PARTIAL_URL: string = "https://example.com/impressum";
  const JOB_URL: string = "https://example.com/job";

  // Act & Assert
  expect(isKnownGeneralUrl(EXACT_URL)).toBe(true);
  expect(isKnownGeneralUrl(PARTIAL_URL)).toBe(true);
  expect(isKnownGeneralUrl(JOB_URL)).toBe(false);
});

test("isPdfLikeUrl - Recognizes PDF viewer patterns", function () {
  const DIRECT_PDF: string = "https://example.com/job.pdf";
  const VIEWER_PDF: string = "https://example.com/job.pdf/view";
  const QUERY_PDF: string = "https://example.com/job.pdf?download=1";
  const NON_PDF: string = "https://example.com/profile";

  expect(isPdfLikeUrl(DIRECT_PDF)).toBe(true);
  expect(isPdfLikeUrl(VIEWER_PDF)).toBe(true);
  expect(isPdfLikeUrl(QUERY_PDF)).toBe(true);
  expect(isPdfLikeUrl(NON_PDF)).toBe(false);
});

describe("isOverviewPage", function () {
  test("returns false for page with single job indicators", function () {
    // A real job posting with typical sections
    const JOB_CONTENT: string = `
      Wissenschaftlicher Mitarbeiter (m/w/d)
      Ihre Aufgaben:
      - Entwicklung von Software
      - Forschungsarbeit
      Ihr Profil:
      - Abgeschlossenes Studium
      Wir bieten:
      - Flexible Arbeitszeiten
      Bewerbungsfrist: 31.12.2025
    `;
    expect(isOverviewPage(JOB_CONTENT)).toBe(false);
  });

  test("returns true for empty job listing page", function () {
    const OVERVIEW_CONTENT: string =
      "Karriere bei uns. Derzeit gibt es keine offenen Stellen. Bitte schauen Sie später wieder vorbei.";
    expect(isOverviewPage(OVERVIEW_CONTENT)).toBe(true);
  });

  test("returns true for overview page with 'folgende ausschreibungen'", function () {
    const OVERVIEW_CONTENT: string =
      "Professuren. Derzeit gibt es an unserer Universität folgende Ausschreibungen für Professorenstellen.";
    expect(isOverviewPage(OVERVIEW_CONTENT)).toBe(true);
  });

  test("returns true for page with listing header but no job content", function () {
    const LISTING_CONTENT: string = `
      Aktuelle Stellenangebote
      - Professur für Informatik
      - Professur für Mathematik
      - Wissenschaftlicher Mitarbeiter
    `;
    expect(isOverviewPage(LISTING_CONTENT)).toBe(true);
  });

  test("returns false for page with listing header AND job content", function () {
    // This could be a single job on a main page
    const SINGLE_JOB_MAIN_PAGE: string = `
      Aktuelle Stellenangebote
      Software Developer (m/w/d)
      Ihre Aufgaben:
      - Entwicklung von Web-Applikationen
      Ihr Profil:
      - Studium der Informatik
      Wir bieten:
      - Moderne Arbeitsumgebung
    `;
    expect(isOverviewPage(SINGLE_JOB_MAIN_PAGE)).toBe(false);
  });

  test("returns false for short but valid job posting", function () {
    // Even short content should be recognized as job if it has the right indicators
    const SHORT_JOB: string =
      "Wissenschaftlicher Mitarbeiter. Ihre Aufgaben umfassen Forschung. Ihr Profil: Promotion.";
    expect(isOverviewPage(SHORT_JOB)).toBe(false);
  });

  test("returns true for 'keine nachrichten verfügbar' page", function () {
    const NO_NEWS: string = "Keine Nachrichten verfügbar. Bitte schauen Sie später wieder vorbei.";
    expect(isOverviewPage(NO_NEWS)).toBe(true);
  });

  test("returns true for English empty positions page", function () {
    const ENGLISH_EMPTY: string =
      "Career at our company. Currently no open positions available.";
    expect(isOverviewPage(ENGLISH_EMPTY)).toBe(true);
  });

  test("returns false for English job posting", function () {
    const ENGLISH_JOB: string = `
      Software Engineer
      Your responsibilities:
      - Develop web applications
      Your profile:
      - Computer Science degree
      We offer:
      - Competitive salary
    `;
    expect(isOverviewPage(ENGLISH_JOB)).toBe(false);
  });

  test("returns false for job with Kennziffer (reference number)", function () {
    const JOB_WITH_REF: string = `
      Wissenschaftlicher Mitarbeiter
      Kennziffer: 2024-WM-001
      Beschreibung der Stelle...
    `;
    expect(isOverviewPage(JOB_WITH_REF)).toBe(false);
  });
});
