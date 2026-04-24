import { expect, jest, describe, test } from "@jest/globals";
import request, { Response, Request } from "supertest";
import express, { Express, NextFunction } from "express";
import apiRouter from "../../Routers/apiRouter";
import databaseRouter from "../../Routers/databaseRouter";
import { httpStatus } from "../../../Shared/httpStatus";
import { Job } from "../../Models/Entities/Job";
import { Employer } from "../../Models/Entities/Employer";
import { Location } from "../../Models/Entities/Location";
import { Website } from "../../Models/Entities/Website";
import * as jobService from "../../Services/jobService";

jest.mock("../../Services/jobService");

jest.mock("express-rate-limit", function () {
  return {
    rateLimit: jest.fn(function () {
      return function (_req: Request, _res: Response, next: NextFunction) {
        next();
      };
    }),
  };
});

const APP: Express = express();
APP.use(express.json());
APP.use("/api", apiRouter);
APP.use("/database", databaseRouter);

function normalizeJobDates(job: Job): Job {
  return JSON.parse(
    JSON.stringify(job, function (_: string, value: Date | string) {
      return value instanceof Date ? value.toISOString() : value;
    }),
  );
}

const MOCKED_LOCATION: Location = {
  LocationID: 1,
  Street: "mock street",
  HouseNumber: "1",
  PostalCode: "00001",
  City: "mocked city",
  created_at: new Date("2024-01-01"),
  Jobs: [],
  EmployerKeywordLocations: [],
};

const MOCKED_EMP: Employer = {
  EmployerID: 1,
  LocationID: 1,
  Emails: ["mock@yahoo.com"],
  ShortName: "mockShortName",
  FullName: "mockFullName",
  Website: "mockWebsite",
  created_at: new Date("2024-01-01"),
  Jobs: [],
  Blacklist: [],
  Whitelist: [],
  toValidate: false,
  EmployerKeywordLocations: [],
  isEmbedded: false,
  isActive: false,
  ContactPerson: null,
  showContact: false,
};

const MOCKED_WEBSITE: Website = {
  WebsiteID: 1,
  JobURL: "mockurl.com",
  ETag: "mocktag",
  Hash: "mockhash",
  LastModified: "mock",
  Jobs: [],
};

const MOCKED_JOB: Job = {
  Title: "Mock Title",
  Description: "Mock Description",
  Tasks: [],
  JobID: 1,
  EmployerID: 1,
  LocationID: 1,
  WebsiteID: 1,
  ValidationKey: "mockedKey",
  ApplicationDeadline: new Date("2024-01-01"),
  Language: "mockLanguage",
  Specialty: ["mockSpecialty"],
  created_at: new Date("2024-01-01"),
  Employer: MOCKED_EMP,
  Location: MOCKED_LOCATION,
  Website: MOCKED_WEBSITE,
  isValid: false,
};

describe("Job Controllers", function () {
  test("Post Save or Update Job", async function () {
    jest.spyOn(jobService, "saveOrUpdateJob").mockResolvedValueOnce(1);
    let response: Response = await request(APP).post("/database/jobs/saveorupdate").send({
      empid: 1,
      locationid: 1,
      title: "mock",
      description: "mock",
      tasks: [],
      websiteid: 1,
      language: "de",
    });
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Post Save or Update, Error", async function () {
    jest.spyOn(jobService, "saveOrUpdateJob").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).post("/database/jobs/saveorupdate").send({
      empid: 1,
      locationid: 1,
      title: "mock",
      description: "mock",
      tasks: [],
      websiteid: 1,
      language: "de",
    });
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Post, getJobIDByUrl", async function () {
    jest.spyOn(jobService, "getJobIDByUrl").mockResolvedValueOnce(1);
    let response: Response = await request(APP).post("/database/jobs/url").send({
      empid: 1,
      locationid: 1,
      title: "mock",
      description: "mock",
      tasks: [],
      websiteid: 1,
      language: "de",
    });
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Post, getJobIDByUrl, Error", async function () {
    jest.spyOn(jobService, "getJobIDByUrl").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).post("/database/jobs/url").send({
      empid: 1,
      locationid: 1,
      title: "mock",
      description: "mock",
      tasks: [],
      websiteid: 1,
      language: "de",
    });
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get All Job", async function () {
    jest.spyOn(jobService, "readAllJob").mockResolvedValueOnce([MOCKED_JOB]);
    let response: Response = await request(APP).get("/database/jobs");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get All Job, Error", async function () {
    jest.spyOn(jobService, "readAllJob").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).get("/database/jobs");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get one Job", async function () {
    jest.spyOn(jobService, "readJob").mockResolvedValueOnce(MOCKED_JOB);
    let response: Response = await request(APP).get("/database/jobs/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get one Job, Fail", async function () {
    jest.spyOn(jobService, "readJob").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).get("/database/jobs/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get one Job, Not Found", async function () {
    jest.spyOn(jobService, "readJob").mockResolvedValueOnce(null);
    let notFound: Response = await request(APP).get("/database/jobs/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Delete Job", async function () {
    jest.spyOn(jobService, "deleteJob").mockResolvedValueOnce(true);
    let response: Response = await request(APP).delete("/database/jobs/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Delete Job, Not Found", async function () {
    jest.spyOn(jobService, "deleteJob").mockResolvedValueOnce(false);
    let response: Response = await request(APP).delete("/database/jobs/1");
    expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
  });

  test("Delete Job, Fail", async function () {
    jest.spyOn(jobService, "deleteJob").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).delete("/database/jobs/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Set Validation Key", async function () {
    jest.spyOn(jobService, "setValidationKey").mockResolvedValueOnce(true);
    let response: Response = await request(APP).put("/database/jobs/validation/1").send({
      validationkey: "mockedKey",
    });
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Set Validation Key, Not Found", async function () {
    jest.spyOn(jobService, "setValidationKey").mockResolvedValueOnce(false);
    let response: Response = await request(APP).put("/database/jobs/validation/1").send({
      validationkey: "mockedKey",
    });
    expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
  });

  test("Set Validation Key, Fail", async function () {
    jest.spyOn(jobService, "setValidationKey").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).put("/database/jobs/validation/1").send({
      validationkey: "mockedKey",
    });
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });
  test("Validate Job", async function () {
    jest.spyOn(jobService, "validateJob").mockResolvedValueOnce(true);
    let response: Response = await request(APP).put("/api/jobs/validation/mockKey");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Delete Validation Key, Not Found", async function () {
    jest.spyOn(jobService, "validateJob").mockResolvedValueOnce(false);
    let response: Response = await request(APP).put("/api/jobs/validation/mockKey");
    expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
  });

  test("Delete Validation Key, Internal Error", async function () {
    jest.spyOn(jobService, "validateJob").mockRejectedValueOnce(new Error());
    let response: Response = await request(APP).put("/api/jobs/validation/mockKey");
    expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get Job by Validation Key", async function () {
    const MOCKED_JOB_WITH_URL: Job & { JobURL: string | null } = {
      ...MOCKED_JOB,
      JobURL: "https://example.com/job",
    };
    jest.spyOn(jobService, "readJobByValidationKey").mockResolvedValueOnce(MOCKED_JOB_WITH_URL);
    let response: Response = await request(APP).get("/api/jobs/validation/mockKey");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get Job by Validation Key, NotFound", async function () {
    jest.spyOn(jobService, "readJobByValidationKey").mockResolvedValueOnce(null);
    let response: Response = await request(APP).get("/api/jobs/validation/mockKey");
    expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
  });

  test("Get Job by Validation Key, Internal Error", async function () {
    jest.spyOn(jobService, "readJobByValidationKey").mockRejectedValueOnce(new Error());
    let response: Response = await request(APP).get("/api/jobs/validation/mockKey");
    expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });
});

test("Delete Job by Url", async function () {
  jest.spyOn(jobService, "deleteJobByUrl").mockResolvedValueOnce(true);
  let response: Response = await request(APP).post("/database/jobs/urldelete");
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Delete Job by Url, NotFound", async function () {
  jest.spyOn(jobService, "deleteJobByUrl").mockResolvedValueOnce(false);
  let response: Response = await request(APP).post("/database/jobs/urldelete");
  expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
});

test("Delete Job by Url, Internal Error", async function () {
  jest.spyOn(jobService, "deleteJobByUrl").mockRejectedValueOnce(new Error());
  let response: Response = await request(APP).post("/database/jobs/urldelete");
  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});

describe("Job Controller", function () {
  describe("getJobByWebsiteId", function () {
    test("should return job details for a valid website ID", async function () {
      const NORMALIZED_JOB: Job = normalizeJobDates(MOCKED_JOB);
      (
        jobService.getJobByWebsiteId as jest.MockedFunction<typeof jobService.getJobByWebsiteId>
      ).mockResolvedValue(MOCKED_JOB);

      const RESPONSE: Response = await request(APP).get("/database/jobs/website/1");

      expect(RESPONSE.status).toBe(httpStatus.OK);
      expect(RESPONSE.body).toEqual(NORMALIZED_JOB);
    });

    test("should return 404 if job not found", async function () {
      (
        jobService.getJobByWebsiteId as jest.MockedFunction<typeof jobService.getJobByWebsiteId>
      ).mockResolvedValue(null);

      const RESPONSE: Response = await request(APP).get("/database/jobs/website/1");

      expect(RESPONSE.status).toBe(httpStatus.NOT_FOUND);
    });

    test("should return 500 if there is an internal server error", async function () {
      (
        jobService.getJobByWebsiteId as jest.MockedFunction<typeof jobService.getJobByWebsiteId>
      ).mockRejectedValue(new Error("Internal Server Error"));

      const RESPONSE: Response = await request(APP).get("/database/jobs/website/1");

      expect(RESPONSE.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(RESPONSE.body).toEqual({ error: "Internal Server Error!" });
    });
  });
});
