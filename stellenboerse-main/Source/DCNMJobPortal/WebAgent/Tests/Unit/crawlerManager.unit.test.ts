import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";
import * as CRAWLER_MANAGER from "../../Services/crawlerManager";
import * as WEB_MONITOR from "../../Services/webMonitor";
import * as WEB_MONITOR_UTILS from "../../Services/webMonitorUtils";
import * as CRAWLER from "../../Services/crawler";
import axios, { AxiosResponse } from "axios";
import { IEmployer } from "../../../Shared/interfaces";
import { httpStatus } from "../../../Shared/httpStatus";

jest.mock("axios");
jest.mock("../../Services/webMonitor");
jest.mock("../../Services/crawler");

let consoleLogMock: ReturnType<typeof jest.spyOn>;
let consoleErrorMock: ReturnType<typeof jest.spyOn>;

beforeEach(function () {
  consoleLogMock = jest.spyOn(console, "log").mockImplementation(function () {});
  consoleErrorMock = jest.spyOn(console, "error").mockImplementation(function () {});
});

afterEach(function () {
  jest.restoreAllMocks();
});

const MOCK_EMPLOYER: IEmployer = {
  EmployerID: 1,
  ShortName: "TestEmployer",
  FullName: "Test FullName",
  Website: "https://test.com",
  Emails: ["test@example.com"],
  created_at: new Date(),
  Jobs: [],
  LocationID: 1,
  isEmbedded: false,
  toValidate: false,
  isActive: false,
  ContactPerson: null,
  showContact: false,
  sendValidationEmails: true,
};

const MOCKED_RESPONSE: AxiosResponse = {
  status: httpStatus.OK,
  data: [MOCK_EMPLOYER],
} as AxiosResponse;

const MOCKED_URLS: string[] = ["https://example.com/job1", "https://example.com/job2"];

const MOCKED_BLACKLIST_RESPONSE: AxiosResponse = {
  data: [],
  status: 200,
  statusText: "OK",
  headers: {},
  config: {},
} as AxiosResponse;

test("updateEmployerBlacklistWithMainUrls - No employers found", async function () {
  jest.spyOn(axios, "get").mockResolvedValueOnce({ data: [] });
  await CRAWLER_MANAGER.updateEmployerBlacklistWithMainUrls(1);
  expect(consoleLogMock).toHaveBeenCalledWith("No employers found in the database.");
});

test("updateEmployerBlacklistWithMainUrls - employer without website", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: [{ EmployerID: 2, FullName: "NoWebsiteEmp" }] })
    .mockResolvedValueOnce({ data: [] });
  await CRAWLER_MANAGER.updateEmployerBlacklistWithMainUrls(1);
});

test("updateEmployerBlacklistWithMainUrls - blacklist null", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: [{ EmployerID: 2, Website: "https://test.com" }] })
    .mockResolvedValueOnce({ data: null });
  await CRAWLER_MANAGER.updateEmployerBlacklistWithMainUrls(1);
});

test("updateEmployerBlacklistWithMainUrls - No URLs to add", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({
      data: [{ Website: "https://example.com" }, { Website: "https://example.com/" }],
    })
    .mockResolvedValueOnce({ data: ["https://example.com", "https://example.com/"] });
  await CRAWLER_MANAGER.updateEmployerBlacklistWithMainUrls(1);
  expect(consoleLogMock).toHaveBeenCalledWith("Blacklist already up-to-date for employer ID: 1");
});

test("Scrape all employers, no job URLs", async function () {
  jest.spyOn(axios, "get").mockResolvedValueOnce(MOCKED_RESPONSE);
  jest.spyOn(WEB_MONITOR_UTILS, "getJobUrlsByEmployerId").mockResolvedValue([]);
  await CRAWLER_MANAGER.scrapeAllEmployers();
  expect(consoleLogMock).toHaveBeenCalledWith("Crawler Controller has started for all employers!");
});

test("scrapeAllEmployers - parallel mode", async function () {
  jest.spyOn(axios, "get").mockResolvedValueOnce({
    data: [{ EmployerID: 1 }, { EmployerID: 2 }],
  });
  const PARALLEL_MOCK: ReturnType<typeof jest.spyOn> = jest
    .spyOn(CRAWLER_MANAGER, "parallelStart")
    .mockResolvedValue();
  await CRAWLER_MANAGER.scrapeAllEmployers(true);
  expect(PARALLEL_MOCK).toHaveBeenCalledTimes(0);
});

test("Scrape all employers - no employers in DB", async function () {
  jest.spyOn(axios, "get").mockResolvedValueOnce({ data: [] });
  await CRAWLER_MANAGER.scrapeAllEmployers();
  expect(consoleLogMock).toHaveBeenCalledWith("No employers found in the database.");
});

test("fetchUrlsFromWhitelist - RESPONSE.data null", async function () {
  jest.spyOn(axios, "get").mockResolvedValueOnce({ data: null });
  const RESULT: string[] = await CRAWLER_MANAGER.fetchUrlsFromWhitelist(1);
  expect(RESULT).toEqual([]);
});

test("Serial start - path with existing URLs", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: [MOCK_EMPLOYER] })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: MOCK_EMPLOYER })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: MOCKED_URLS });
  jest
    .spyOn(CRAWLER, "getJobUrls")
    .mockResolvedValue(["https://example.com/job1", "https://example.com/job2"]);
  jest.spyOn(axios, "post").mockResolvedValueOnce({ data: { jobUrls: MOCKED_URLS } });
  const CHECK_SEQ_MOCK: ReturnType<typeof jest.spyOn> = jest
    .spyOn(WEB_MONITOR, "checkResourceSequential")
    .mockImplementation(async function () {});
  await CRAWLER_MANAGER.serialStart(1);
  expect(CHECK_SEQ_MOCK).toHaveBeenCalledWith(MOCKED_URLS, MOCK_EMPLOYER.EmployerID);
});

test("Serial start - no URLs", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: [MOCK_EMPLOYER] })
    .mockResolvedValueOnce(MOCKED_BLACKLIST_RESPONSE)
    .mockResolvedValueOnce({ data: [] });
  const CHECK_SEQ_MOCK: ReturnType<typeof jest.spyOn> = jest
    .spyOn(WEB_MONITOR, "checkResourceSequential")
    .mockResolvedValue();
  await CRAWLER_MANAGER.serialStart(1);
  expect(consoleLogMock).toHaveBeenCalledWith(
    `No job URLs found in whitelist for employer ID: ${1}`,
  );
  expect(CHECK_SEQ_MOCK).toHaveBeenCalled();
});

test("Parallel start - path with existing URLs", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: [MOCK_EMPLOYER] })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: MOCK_EMPLOYER })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: MOCKED_URLS });
  jest.spyOn(CRAWLER, "getJobUrls").mockResolvedValue(MOCKED_URLS);
  jest.spyOn(axios, "post").mockResolvedValueOnce({ data: { jobUrls: MOCKED_URLS } });
  const CHECK_PAR_MOCK: ReturnType<typeof jest.spyOn> = jest
    .spyOn(WEB_MONITOR, "checkResourceParallel")
    .mockImplementation(function () {});
  await CRAWLER_MANAGER.parallelStart(1);
  expect(CHECK_PAR_MOCK).toHaveBeenCalledWith(MOCKED_URLS, MOCK_EMPLOYER.EmployerID);
});

test("Parallel start - no URLs", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: [MOCK_EMPLOYER] })
    .mockResolvedValueOnce(MOCKED_BLACKLIST_RESPONSE)
    .mockResolvedValueOnce({ data: [] });
  const CHECK_PAR_MOCK: ReturnType<typeof jest.spyOn> = jest
    .spyOn(WEB_MONITOR, "checkResourceParallel")
    .mockImplementation(function () {});
  await CRAWLER_MANAGER.parallelStart(1);
  expect(consoleLogMock).toHaveBeenCalledWith(
    `No job URLs found in whitelist for employer ID: ${1}`,
  );
  expect(CHECK_PAR_MOCK).toHaveBeenCalled();
});

test("filterUrlsAgainstBlacklistAndWhitelist - error while fetching blacklist/whitelist", async function () {
  jest.spyOn(axios, "get").mockRejectedValueOnce(new Error("Network issue"));
  await expect(
    CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      ["https://example.com/job1"],
      "https://example.com",
    ),
  ).rejects.toThrow("Network issue");
  expect(consoleErrorMock).toHaveBeenCalledWith(
    "Error fetching blacklist and whitelist for employer 1:",
    "Network issue",
  );
});

test("filterUrlsAgainstBlacklistAndWhitelist - filters invalid URLs", async function () {
  const URLS: string[] = [
    "https://example.com/job1",
    "mailto:someone@example.com",
    "javascript:void(0);",
    "https://example.com/file.xml",
    "https://example.com/#anchor",
  ];
  jest.spyOn(axios, "get").mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] });
  const RESULT: string[] = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
    1,
    URLS,
    "https://example.com",
  );
  expect(RESULT).toEqual(["https://example.com/job1"]);
});

test("filterUrlsAgainstBlacklistAndWhitelist - BLACKLIST_RESPONSE.data null and WHITELIST_RESPONSE.data null", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({ data: null })
    .mockResolvedValueOnce({ data: null });
  const RESULT: string[] = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
    1,
    ["https://example.com/job1"],
    "https://example.com",
  );
  expect(RESULT).toEqual(["https://example.com/job1"]);
});

test("fetchEmployerAndClassifyJobs - all URLs already classified", async function () {
  jest
    .spyOn(axios, "get")
    .mockResolvedValueOnce({
      data: {
        EmployerID: 1,
        ShortName: "Emp",
        Website: "http://example.com",
        Emails: [],
        created_at: new Date(),
        Jobs: [],
      },
    })
    .mockResolvedValueOnce({ data: ["http://example.com/job1"] })
    .mockResolvedValueOnce({ data: ["http://example.com/job2"] });
  jest
    .spyOn(CRAWLER, "getJobUrls")
    .mockResolvedValue(["http://example.com/job1", "http://example.com/job2"]);
  const RESULT: string[] = await CRAWLER_MANAGER.fetchEmployerAndClassifyJobs(1);
  expect(consoleLogMock).toHaveBeenCalledWith(
    "All URLs are already classified in blacklist or whitelist. Skipping classification.",
  );
  expect(RESULT).toEqual([]);
});

test("updateBlacklist - error updating", async function () {
  jest.spyOn(axios, "put").mockRejectedValueOnce(new Error("PUT Error"));
  await CRAWLER_MANAGER.updateBlacklist(1, ["https://fail.com"]);
  expect(consoleErrorMock).toHaveBeenCalledWith(
    "Error updating blacklist for employer 1:",
    "PUT Error",
  );
});

test("Convert to absolute URL - invalid URL + IPB Halle handling", function () {
  const INVALID_URL: string = "http:////";
  const BASE_URL: string = "http://example.com";
  const RESULT_INVALID: string = CRAWLER_MANAGER.toAbsoluteUrl(INVALID_URL, BASE_URL);
  expect(consoleErrorMock).toHaveBeenCalledWith(
    `Could not convert to absolute URL: ${INVALID_URL}`,
    expect.any(String),
  );
  expect(RESULT_INVALID).toEqual(INVALID_URL);
  consoleErrorMock.mockClear();
  const HALLE_BASE_URL: string = "https://www.ipb-halle.de/karriere/stellenangebote/";
  const RELATIVE_HALLE_URL: string = "karriere/stellenangebote/test-stelle";
  const RESULT_HALLE: string = CRAWLER_MANAGER.toAbsoluteUrl(RELATIVE_HALLE_URL, HALLE_BASE_URL);
  expect(consoleErrorMock).not.toHaveBeenCalled();
  expect(RESULT_HALLE).toBe("https://www.ipb-halle.de/karriere/stellenangebote/test-stelle");
});

// Tests for pagination URL filtering
describe("filterUrlsAgainstBlacklistAndWhitelist - pagination filtering", () => {
  beforeEach(() => {
    jest.spyOn(axios, "get")
      .mockResolvedValueOnce({ data: [] }) // blacklist
      .mockResolvedValueOnce({ data: [] }); // whitelist
  });

  test("should filter out URLs with ?start= parameter", async () => {
    const urls = [
      "https://karriere.leipzig.de/stellenangebote/?start=0",
      "https://karriere.leipzig.de/stellenangebote/?start=20",
      "https://karriere.leipzig.de/stellenangebote/job-123.html",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://karriere.leipzig.de/stellenangebote/"
    );
    expect(result).toEqual(["https://karriere.leipzig.de/stellenangebote/job-123.html"]);
    expect(consoleLogMock).toHaveBeenCalledWith(
      "Excluded pagination URL: https://karriere.leipzig.de/stellenangebote/?start=0"
    );
  });

  test("should filter out URLs with ?page= parameter", async () => {
    const urls = [
      "https://example.com/jobs?page=1",
      "https://example.com/jobs?page=2",
      "https://example.com/jobs/software-developer",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/jobs"
    );
    expect(result).toEqual(["https://example.com/jobs/software-developer"]);
  });

  test("should filter out URLs with ?offset= parameter", async () => {
    const urls = [
      "https://example.com/careers?offset=0",
      "https://example.com/careers?offset=10",
      "https://example.com/careers/developer-position",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/careers"
    );
    expect(result).toEqual(["https://example.com/careers/developer-position"]);
  });

  test("should filter out URLs with /page/N/ path pattern", async () => {
    const urls = [
      "https://example.com/jobs/page/1/",
      "https://example.com/jobs/page/2/",
      "https://example.com/jobs/frontend-developer",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/jobs"
    );
    expect(result).toEqual(["https://example.com/jobs/frontend-developer"]);
  });

  test("should filter out URLs with /seite/N/ path pattern (German)", async () => {
    const urls = [
      "https://example.de/stellen/seite/1/",
      "https://example.de/stellen/seite/2/",
      "https://example.de/stellen/backend-entwickler",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.de/stellen"
    );
    expect(result).toEqual(["https://example.de/stellen/backend-entwickler"]);
  });

  test("should filter out URLs with ?limit= parameter", async () => {
    const urls = [
      "https://example.com/api/jobs?limit=10",
      "https://example.com/api/jobs?limit=50",
      "https://example.com/jobs/data-analyst",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/jobs"
    );
    expect(result).toEqual(["https://example.com/jobs/data-analyst"]);
  });

  test("should filter out URLs with ?per_page= parameter", async () => {
    const urls = [
      "https://example.com/vacancies?per_page=20",
      "https://example.com/vacancies/project-manager",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/vacancies"
    );
    expect(result).toEqual(["https://example.com/vacancies/project-manager"]);
  });

  test("should keep valid job URLs without pagination parameters", async () => {
    const urls = [
      "https://example.com/jobs/software-engineer-12345",
      "https://example.com/jobs/data-scientist-67890",
      "https://example.com/careers/product-manager.html",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/jobs"
    );
    expect(result).toHaveLength(3);
    expect(result).toContain("https://example.com/jobs/software-engineer-12345");
    expect(result).toContain("https://example.com/jobs/data-scientist-67890");
    expect(result).toContain("https://example.com/careers/product-manager.html");
  });

  test("should filter multiple pagination patterns in one URL set", async () => {
    const urls = [
      "https://example.com/jobs?start=0",
      "https://example.com/jobs?page=1",
      "https://example.com/jobs/page/2/",
      "https://example.com/jobs?offset=10",
      "https://example.com/jobs/valid-position",
    ];
    const result = await CRAWLER_MANAGER.filterUrlsAgainstBlacklistAndWhitelist(
      1,
      urls,
      "https://example.com/jobs"
    );
    expect(result).toEqual(["https://example.com/jobs/valid-position"]);
  });
});

describe("normalizeBIteUrl", function () {
  test("should remove trailing 0 from uni-leipzig.b-ite.careers URLs", function () {
    const input = "https://uni-leipzig.b-ite.careers/jobposting/1386e308e7d9fd11ab37c383a1bf7aa39a3676810";
    const expected = "https://uni-leipzig.b-ite.careers/jobposting/1386e308e7d9fd11ab37c383a1bf7aa39a367681";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(expected);
  });

  test("should remove trailing 0 from jobs.tu-chemnitz.de URLs", function () {
    const input = "https://jobs.tu-chemnitz.de/jobposting/d3abc1175b0ca86e369fb6f57749a774856c475a0";
    const expected = "https://jobs.tu-chemnitz.de/jobposting/d3abc1175b0ca86e369fb6f57749a774856c475a";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(expected);
  });

  test("should remove trailing 0 from jobs.iwh-halle.de URLs", function () {
    const input = "https://jobs.iwh-halle.de/jobposting/ee923220eaa43f04f6a26fa6333d496eea49529f0";
    const expected = "https://jobs.iwh-halle.de/jobposting/ee923220eaa43f04f6a26fa6333d496eea49529f";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(expected);
  });

  test("should remove trailing 0 from jobs.htwk-leipzig.de URLs", function () {
    const input = "https://jobs.htwk-leipzig.de/jobposting/abc123def456789012345678901234567890abcd0";
    const expected = "https://jobs.htwk-leipzig.de/jobposting/abc123def456789012345678901234567890abcd";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(expected);
  });

  test("should preserve query parameters when normalizing", function () {
    const input = "https://uni-leipzig.b-ite.careers/jobposting/1386e308e7d9fd11ab37c383a1bf7aa39a3676810?ref=homepage";
    const expected = "https://uni-leipzig.b-ite.careers/jobposting/1386e308e7d9fd11ab37c383a1bf7aa39a367681?ref=homepage";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(expected);
  });

  test("should not modify URLs that already have 40-char hash", function () {
    const input = "https://uni-leipzig.b-ite.careers/jobposting/1386e308e7d9fd11ab37c383a1bf7aa39a367681";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(input);
  });

  test("should not modify non-b-ite URLs", function () {
    const input = "https://example.com/jobposting/1386e308e7d9fd11ab37c383a1bf7aa39a3676810";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(input);
  });

  test("should not modify URLs without /jobposting/ path", function () {
    const input = "https://uni-leipzig.b-ite.careers/other/1386e308e7d9fd11ab37c383a1bf7aa39a3676810";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(input);
  });

  test("should handle invalid URLs gracefully", function () {
    const input = "not-a-valid-url";
    expect(CRAWLER_MANAGER.normalizeBIteUrl(input)).toBe(input);
  });
});

