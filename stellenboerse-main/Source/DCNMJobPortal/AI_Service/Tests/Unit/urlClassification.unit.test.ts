import { describe, test, expect, jest } from "@jest/globals";
import { urlClassifier, UrlClassificationResult } from "../../Services/urlClassification";

jest.mock("../../Services/urlClassification", function () {
  return {
    urlClassifier: jest.fn(),
  };
});

describe("urlClassifier", function () {
  test("should classify URLs without errors", async function () {
    // Arrange
    const EMPLOYER_ID: number = 1;
    const URLS: string[] = ["https://irrelevant.com", "https://job-posting.com"];

    const MOCK_RESULT: UrlClassificationResult = {
      JOB_URLS: ["https://job-posting.com"],
      OTHER_URLS: ["https://irrelevant.com"],
    };

    const MOCKED_URL_CLASSIFIER: jest.MockedFunction<typeof urlClassifier> =
      jest.mocked(urlClassifier);
    MOCKED_URL_CLASSIFIER.mockResolvedValue(MOCK_RESULT);

    // Act
    const RESULT: UrlClassificationResult = await urlClassifier(URLS, EMPLOYER_ID);

    // Assert
    expect(RESULT.JOB_URLS).toContain("https://job-posting.com");
    expect(RESULT.OTHER_URLS).toContain("https://irrelevant.com");
  });

  test("should handle empty URL list", async function () {
    // Arrange
    const EMPLOYER_ID: number = 1;
    const URLS: string[] = [];

    const MOCK_RESULT: UrlClassificationResult = {
      JOB_URLS: [],
      OTHER_URLS: [],
    };

    const MOCKED_URL_CLASSIFIER: jest.MockedFunction<typeof urlClassifier> =
      jest.mocked(urlClassifier);
    MOCKED_URL_CLASSIFIER.mockResolvedValue(MOCK_RESULT);

    // Act
    const RESULT: UrlClassificationResult = await urlClassifier(URLS, EMPLOYER_ID);

    // Assert
    expect(RESULT.JOB_URLS).toEqual([]);
    expect(RESULT.OTHER_URLS).toEqual([]);
  });
});
