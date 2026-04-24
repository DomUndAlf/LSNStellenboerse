import { scrape, IScrapeResult } from "../../Services/scraper";
import { jest, describe, test, expect } from "@jest/globals";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

jest.mock("axios");
const MOCKED_AXIOS: jest.Mocked<typeof axios> = axios as jest.Mocked<typeof axios>;

describe("testing the scraper.ts functions", function () {
  const HTML: string = "https://www.webscraper.io/test-sites";
  const FILEPATH: string = path.join(__dirname, "scraperHTML.txt");
  const HTMLCONTENT: string = fs.readFileSync(FILEPATH, "utf8");
  const SCRAPE_EXAMPLE: IScrapeResult = {
    HTML: HTMLCONTENT,
    $: cheerio.load(HTMLCONTENT),
    ETAG: "no E-Tag",
  };

  test("scrape function should return expected result", async function () {
    //Arrange
    MOCKED_AXIOS.get
      .mockResolvedValueOnce({
        data: "User-agent: *\nDisallow:",
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      })
      .mockResolvedValueOnce({
        data: HTMLCONTENT,
        status: 200,
        statusText: "OK",
        headers: { etag: "no E-Tag" },
        config: {},
      });

    // Act
    const RESULT: IScrapeResult = await scrape(HTML);

    // Assert
    expect(RESULT).toBeDefined();
    expect(RESULT.HTML).toBe(SCRAPE_EXAMPLE.HTML);
    expect(RESULT.ETAG).toBe(SCRAPE_EXAMPLE.ETAG);
    expect(RESULT.$.html()).toBe(SCRAPE_EXAMPLE.$.html());
  });

  test("robots.txt does not allow access", async function () {
    //Arrange
    const HTML: string = "https://www.bild.de/";

    //Act
    async function scrapeAction() {
      await scrape(HTML);
    }

    //Assert
    await expect(scrapeAction).rejects.toThrow();
  });

  test("error trying to read robots.txt", async function () {
    // Arrange
    const CONSOLE_ERRORMESSAGE: string = "Error trying to read robots.txt";
    const NETWORK_ERROR: Error & { request?: object } = new Error("Network Error");

    NETWORK_ERROR.request = {};
    MOCKED_AXIOS.get.mockRejectedValueOnce(NETWORK_ERROR);
    console.error = jest.fn();

    // Act
    await expect(scrape("https://example.com")).rejects.toThrow(
      "Robots.txt does not allow the access for https://example.com.",
    );

    // Assert
    expect(console.error).toHaveBeenCalledWith(CONSOLE_ERRORMESSAGE, "Network Error");
  });

  test("error trying to read URL", async function () {
    //Arrange
    const URL: string = "http://example.com";
    const ERROR_MESSAGE: string = "Request failed with status code 404";
    MOCKED_AXIOS.get.mockResolvedValueOnce({
      data: "User-agent: *\nDisallow:",
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    MOCKED_AXIOS.get.mockRejectedValueOnce(new Error(ERROR_MESSAGE));
    console.error = jest.fn();

    //Act
    async function scraping() {
      await scrape(URL);
    }

    //Assert
    await expect(scraping).rejects.toThrow(`Failed to fetch the URL: ${URL}`);
    expect(console.error).toHaveBeenCalledWith(
      `Error trying to reach the website: ${URL}.`,
      ERROR_MESSAGE,
    );
  });
});
