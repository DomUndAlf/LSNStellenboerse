import axios from "axios";
import { scheduleScraper } from "../Services/scraperScheduler";
import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

jest.mock("axios");
const MOCKED_AXIOS: jest.Mocked<typeof axios> = axios as jest.Mocked<typeof axios>;

jest.useFakeTimers({ legacyFakeTimers: true });

describe("scheduleScraper", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  afterEach(function () {
    jest.useRealTimers();
  });

  it("should successfully start the scraper and break the loop", async function () {
    // Arrange
    process.env.WEBAGENT_PORT = "4030";
    MOCKED_AXIOS.post.mockResolvedValueOnce({});

    // Act
    await scheduleScraper(3);

    // Assert
    expect(MOCKED_AXIOS.post).toHaveBeenCalledWith(
      `http://localhost:${process.env.WEBAGENT_PORT}/webagent/scrapeAllActive`,
    );
    expect(MOCKED_AXIOS.post).toHaveBeenCalledTimes(1);
  });

  it("should retry the specified number of times if the scraper fails", async function () {
    // Arrange
    process.env.WEBAGENT_PORT = "4030";
    MOCKED_AXIOS.post.mockRejectedValueOnce(new Error("Network Error"));
    MOCKED_AXIOS.post.mockRejectedValueOnce(new Error("Network Error"));
    MOCKED_AXIOS.post.mockResolvedValueOnce({});

    // Act
    await scheduleScraper(3);

    // Assert
    expect(MOCKED_AXIOS.post).toHaveBeenCalledTimes(3);
  });

  it("should log an error if all retries fail", async function () {
    // Arrange
    process.env.WEBAGENT_PORT = "4030";
    const CONSOLE_ERROR_SPY: jest.SpiedFunction<typeof console.error> = jest
      .spyOn(console, "error")
      .mockImplementation(function () {});
    MOCKED_AXIOS.post.mockRejectedValue(new Error("Network Error"));

    // Act
    await scheduleScraper(3);

    // Assert
    expect(CONSOLE_ERROR_SPY).toHaveBeenCalledWith("Error starting the scraper:", "Network Error");
    expect(CONSOLE_ERROR_SPY).toHaveBeenCalledTimes(3);
    CONSOLE_ERROR_SPY.mockRestore();
  });

  it("should schedule the next scraper run after 24 hours", async function () {
    // Arrange
    process.env.WEBAGENT_PORT = "4030";
    MOCKED_AXIOS.post.mockResolvedValueOnce({});
    const SET_TIMEOUT_SPY: jest.SpiedFunction<typeof global.setTimeout> = jest.spyOn(
      global,
      "setTimeout",
    );

    // Act
    await scheduleScraper(3);

    // Assert
    expect(SET_TIMEOUT_SPY).toHaveBeenCalledWith(expect.any(Function), 24 * 60 * 60 * 1000);
    SET_TIMEOUT_SPY.mockRestore();
  });

  it("should call scheduleScraper again after the timeout", async function () {
    // Arrange
    process.env.WEBAGENT_PORT = "4030";
    MOCKED_AXIOS.post.mockResolvedValueOnce({});

    // Act
    await scheduleScraper(3);
    jest.runOnlyPendingTimers();

    // Assert
    expect(MOCKED_AXIOS.post).toHaveBeenCalledTimes(2);
  });

  it("should break the loop if scraper succeeds before max retries", async function () {
    // Arrange
    process.env.WEBAGENT_PORT = "4030";
    MOCKED_AXIOS.post.mockRejectedValueOnce(new Error("Network Error"));
    MOCKED_AXIOS.post.mockResolvedValueOnce({});

    // Act
    await scheduleScraper(3);

    // Assert
    expect(MOCKED_AXIOS.post).toHaveBeenCalledTimes(2);
  });
});
