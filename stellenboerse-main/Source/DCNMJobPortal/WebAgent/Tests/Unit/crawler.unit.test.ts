import axios, { AxiosResponse } from "axios";
import { getJobUrls } from "../../Services/crawler";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.mock("axios");
const MOCKED_AXIOS: jest.Mocked<typeof axios> = axios as jest.Mocked<typeof axios>;

describe("getJobUrls", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("should extract job URLs from the career page", async function () {
    // Arrange
    const ORG_URL: string = "https://example.com/careers";
    const HTML_CONTENT: string = `
      <html>
      <body>
        <a href="https://example.com/job1">Job 1</a>
        <a href="https://example.com/job2">Job 2</a>
        <a href="https://example.com/document.pdf">Document</a>
        <article class="job-release" onclick="window.open('https://example.com/job3')"></article>
      </body>
      </html>
    `;

    MOCKED_AXIOS.get.mockResolvedValueOnce({ data: HTML_CONTENT } as AxiosResponse);

    // Act
    const JOB_URLS: string[] = await getJobUrls(ORG_URL);

    // Assert
    expect(JOB_URLS).toEqual([
      "https://example.com/job1",
      "https://example.com/job2",
      "https://example.com/document.pdf",
      "https://example.com/job3",
    ]);
  });

  it("should return an empty array if the request fails", async function () {
    // Arrange
    const ORG_URL: string = "https://example.com/careers";

    MOCKED_AXIOS.get.mockRejectedValueOnce(new Error("Network Error"));

    // Act
    const JOB_URLS: string[] = await getJobUrls(ORG_URL);

    // Assert
    expect(JOB_URLS).toEqual([]);
  });

  it("should handle invalid onclick attributes gracefully", async function () {
    // Arrange
    const ORG_URL: string = "https://example.com/careers";

    const HTML_CONTENT: string = `
      <html>
      <body>
        <article class="job-release" onclic="window.open('https://example.com/job1')"></article>
      </body>
      </html>
    `;
    MOCKED_AXIOS.get.mockResolvedValueOnce({ data: HTML_CONTENT } as AxiosResponse);

    // Act
    const JOB_URLS: string[] = await getJobUrls(ORG_URL);

    // Assert
    expect(JOB_URLS).toStrictEqual([]);
  });

  it("should handle onclick attributes without matching patterns", async function () {
    // Arrange
    const ORG_URL: string = "https://example.com/careers";
    const HTML_CONTENT: string = `
      <html>
      <body>
        <article onclick="console.log('No URL here')"></article>
        <article onclick="alert('Not a job URL')"></article>
        <article onclick=""></article>
      </body>
      </html>
    `;

    MOCKED_AXIOS.get.mockResolvedValueOnce({ data: HTML_CONTENT } as AxiosResponse);

    // Act
    const JOB_URLS: string[] = await getJobUrls(ORG_URL);

    // Assert
    expect(JOB_URLS).toEqual([]);
  });
});
