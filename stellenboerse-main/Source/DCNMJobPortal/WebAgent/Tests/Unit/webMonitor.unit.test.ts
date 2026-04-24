import * as webMonitorModule from "../../Services/webMonitor";
import { jest, test, expect } from "@jest/globals";
import { AxiosError, AxiosResponse } from "axios";
import * as webMonitorUtils from "../../Services/webMonitorUtils";
import { httpStatus } from "../../../Shared/httpStatus";
import { IWebsite } from "../../../Shared/interfaces";

jest.mock("axios");
jest.mock("../../Services/webMonitorUtils");

const MOCKED_EMPLOYER_ID: number = 1;

const MOCKED_WEBSITE: IWebsite = {
  WebsiteID: 1,
  JobURL: "mockedUrl",
  ETag: "mockedEtag",
  Hash: "mockedHash",
  LastModified: "mockedLastModified",
  Jobs: [],
};

let mockedResponse: AxiosResponse = {
  status: httpStatus.OK,
  data: [MOCKED_WEBSITE, MOCKED_WEBSITE],
} as AxiosResponse;

let mockedResponseFORBB: AxiosResponse = {
  status: httpStatus.FORBIDDEN,
  data: [MOCKED_WEBSITE, MOCKED_WEBSITE],
} as AxiosResponse;

let mockedResponseNOTF: AxiosResponse = {
  status: httpStatus.NOT_FOUND,
  data: [MOCKED_WEBSITE, MOCKED_WEBSITE],
} as AxiosResponse;

test("Check Resource Sequential", async function () {
  process.env.AI_COUNT_LIMIT = "1";
  jest.spyOn(webMonitorUtils, "makeRequest").mockResolvedValue(mockedResponse);
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(true);
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "createWebsite").mockResolvedValue(123);
  jest.spyOn(webMonitorUtils, "compareAndUpdateWebsite").mockResolvedValue(true);

  let extractionSpy: jest.SpiedFunction<typeof webMonitorUtils.sendToExtraction> = jest.spyOn(
    webMonitorUtils,
    "sendToExtraction",
  );
  let extractionPDFSpy: jest.SpiedFunction<typeof webMonitorUtils.sendToExtractionPDF> = jest.spyOn(
    webMonitorUtils,
    "sendToExtractionPDF",
  );

  await webMonitorModule.processResourceCheck("mockurl", MOCKED_EMPLOYER_ID);

  expect(extractionSpy).toHaveBeenCalledTimes(1);
  expect(extractionPDFSpy).not.toHaveBeenCalled();
});

test("Check Resource Sequential - Forbidden and Not Found Handling", async function () {
  jest.spyOn(webMonitorUtils, "makeRequest").mockImplementation(function (url: string) {
    if (url === "mock-forbidden") {
      const ERROR: Partial<AxiosError> = {
        status: httpStatus.FORBIDDEN,
        message: "Forbidden",
      };
      return Promise.reject(ERROR);
    }

    if (url === "mock-notfound") {
      const ERROR: Partial<AxiosError> = {
        status: httpStatus.NOT_FOUND,
        message: "Not Found",
      };
      return Promise.reject(ERROR);
    }

    return Promise.resolve(mockedResponse);
  });

  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(true);
  let deletejobspy: jest.SpiedFunction<typeof webMonitorUtils.deleteJobByUrl> = jest
    .spyOn(webMonitorUtils, "deleteJobByUrl")
    .mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "sendToExtraction").mockResolvedValue();
  await webMonitorModule.checkResourceSequential(
    ["mockurl", "mock-forbidden", "mock-notfound"],
    MOCKED_EMPLOYER_ID,
  );
  expect(deletejobspy).toHaveBeenCalledWith("mock-forbidden", MOCKED_EMPLOYER_ID);
  expect(deletejobspy).toHaveBeenCalledWith("mock-notfound", MOCKED_EMPLOYER_ID);
  expect(deletejobspy).toHaveBeenCalledTimes(2);
});

test("Check Resource Sequential - Create Website", async function () {
  jest.spyOn(webMonitorUtils, "makeRequest").mockResolvedValue(mockedResponse);
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(null);
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(true);
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockResolvedValue(false);

  let createWebsiteSpy: jest.SpiedFunction<typeof webMonitorUtils.createWebsite> = jest
    .spyOn(webMonitorUtils, "createWebsite")
    .mockResolvedValue(123);
  jest.spyOn(webMonitorUtils, "sendToExtraction").mockResolvedValue();
  await webMonitorModule.checkResourceSequential(["mockurl"], MOCKED_EMPLOYER_ID);
  expect(createWebsiteSpy).toHaveBeenCalled();
});

test("Check Resource Sequential", async function () {
  jest.spyOn(webMonitorUtils, "makeRequest").mockResolvedValue(mockedResponseFORBB);
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockResolvedValue(true);
  let extractionSpy: jest.SpiedFunction<typeof webMonitorUtils.sendToExtraction> = jest.spyOn(
    webMonitorUtils,
    "sendToExtraction",
  );
  await webMonitorModule.checkResourceSequential(["mockurl"], MOCKED_EMPLOYER_ID);
  expect(extractionSpy).toHaveBeenCalled();
});

test("Check Resource Sequential", async function () {
  jest.spyOn(webMonitorUtils, "makeRequest").mockResolvedValue(mockedResponseNOTF);
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockResolvedValue(true);
  let extractionSpy: jest.SpiedFunction<typeof webMonitorUtils.sendToExtraction> = jest.spyOn(
    webMonitorUtils,
    "sendToExtraction",
  );
  await webMonitorModule.checkResourceSequential(["mockurl"], MOCKED_EMPLOYER_ID);
  expect(extractionSpy).toHaveBeenCalled();
});

test("Check Resource Sequential, no Website in Database", async function () {
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(null);
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "createWebsite").mockResolvedValue(MOCKED_WEBSITE.WebsiteID);
  let extractionSpy: jest.SpiedFunction<typeof webMonitorUtils.sendToExtraction> = jest.spyOn(
    webMonitorUtils,
    "sendToExtraction",
  );
  await webMonitorModule.checkResourceSequential(["mockurl"], MOCKED_EMPLOYER_ID);
  expect(extractionSpy).toHaveBeenCalled();
});

test("Check Resource Sequential, Error", async function () {
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockRejectedValue(new Error());
  console.error = jest.fn();

  await webMonitorModule.checkResourceSequential(["mockurl"], MOCKED_EMPLOYER_ID);

  expect(console.error).toHaveBeenCalledWith(`Request failed for mockurl:`, expect.any(Error));
});

test("Check Resource Parallel", async function () {
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(null);
  jest.spyOn(webMonitorUtils, "createWebsite").mockResolvedValue(MOCKED_WEBSITE.WebsiteID);
  let extractionSpy: jest.SpiedFunction<typeof webMonitorUtils.sendToExtraction> = jest.spyOn(
    webMonitorUtils,
    "sendToExtraction",
  );
  webMonitorModule.checkResourceParallel(["mockurl"], MOCKED_EMPLOYER_ID);
  await new Promise(setImmediate);
  expect(extractionSpy).toHaveBeenCalled();
});

test("Check Resource Parallel, Error", async function () {
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockRejectedValue(new Error());
  console.error = jest.fn();
  webMonitorModule.checkResourceParallel(["mockurl"], MOCKED_EMPLOYER_ID);
  await new Promise(setImmediate);
  expect(console.error).toHaveBeenCalled();
});

test("processResourceCheck - deleteJobByUrl returns true", async function () {
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(null);
  jest.spyOn(webMonitorUtils, "makeRequest").mockRejectedValue({ status: httpStatus.FORBIDDEN });
  jest.spyOn(webMonitorUtils, "verifyHtml").mockResolvedValue(false);
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockResolvedValue(true);
  console.log = jest.fn();

  await webMonitorModule.processResourceCheck("mock-forbidden", MOCKED_EMPLOYER_ID);

  expect(console.log).toHaveBeenCalledWith("Job deleted (Url: mock-forbidden)");
});

test("processResourceCheck - deleteJobByUrl throws error", async function () {
  jest.spyOn(webMonitorUtils, "getWebsiteByJobUrl").mockResolvedValue(null);
  jest.spyOn(webMonitorUtils, "makeRequest").mockRejectedValue({ status: httpStatus.FORBIDDEN });
  jest.spyOn(webMonitorUtils, "deleteJobByUrl").mockRejectedValue(new Error("Delete job failed"));
  console.error = jest.fn();

  await webMonitorModule.processResourceCheck("mock-forbidden", MOCKED_EMPLOYER_ID);

  expect(console.error).toHaveBeenCalledWith(
    `Error deleting job for mock-forbidden:`,
    expect.objectContaining({
      message: "Delete job failed",
    }),
  );
});
