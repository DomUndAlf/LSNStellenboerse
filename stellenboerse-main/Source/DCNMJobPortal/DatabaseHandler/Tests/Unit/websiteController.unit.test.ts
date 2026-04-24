import { expect, jest, describe, test } from "@jest/globals";
import request, { Response } from "supertest";
import express, { Express } from "express";
import apiRouter from "../../Routers/apiRouter";
import databaseRouter from "../../Routers/databaseRouter";
import { httpStatus } from "../../../Shared/httpStatus";
import { Website } from "../../Models/Entities/Website";
import * as websiteService from "../../Services/websiteService";

jest.mock("../../Services/websiteService");

const APP: Express = express();
APP.use(express.json());
APP.use("/api", apiRouter);
APP.use("/database", databaseRouter);

const MOCKED_WEBSITE: Website = {
  WebsiteID: 1,
  JobURL: "mockurl.com",
  ETag: "mocktag",
  Hash: "mockhash",
  LastModified: "mock",
  Jobs: [],
};

describe("Website Controllers", function () {
  test("Post Website", async function () {
    jest.spyOn(websiteService, "createWebsite").mockResolvedValueOnce(MOCKED_WEBSITE.WebsiteID);
    let response: Response = await request(APP).post("/database/websites");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Post Website, Fail", async function () {
    jest.spyOn(websiteService, "createWebsite").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).post("/database/websites");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get Website", async function () {
    jest.spyOn(websiteService, "readWebsite").mockResolvedValueOnce(MOCKED_WEBSITE);
    let response: Response = await request(APP).get("/database/websites/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get Website, Not Found", async function () {
    jest.spyOn(websiteService, "readWebsite").mockResolvedValueOnce(null);
    let response: Response = await request(APP).get("/database/websites/1");
    expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
  });

  test("Get Website, Fail", async function () {
    jest.spyOn(websiteService, "readWebsite").mockRejectedValueOnce(new Error());
    let response: Response = await request(APP).get("/database/websites/1");
    expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get All Website", async function () {
    jest.spyOn(websiteService, "readAllWebsite").mockResolvedValue([MOCKED_WEBSITE]);
    let response: Response = await request(APP).get("/database/websites");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get All Website, Fail", async function () {
    jest.spyOn(websiteService, "readAllWebsite").mockRejectedValue(new Error());
    let fail: Response = await request(APP).get("/database/websites");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get Website by JobURL", async function () {
    jest.spyOn(websiteService, "readWebsiteByJobUrl").mockResolvedValue(MOCKED_WEBSITE);
    let response: Response = await request(APP).put("/database/websites/joburl");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get Website by JobURL, Fail", async function () {
    jest.spyOn(websiteService, "readWebsiteByJobUrl").mockRejectedValue(new Error());
    let fail: Response = await request(APP).put("/database/websites/joburl");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get Website by JobURL, Not Found", async function () {
    jest.spyOn(websiteService, "readWebsiteByJobUrl").mockResolvedValue(null);
    let notFound: Response = await request(APP).put("/database/websites/joburl");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Put Website", async function () {
    jest.spyOn(websiteService, "updateWebsite").mockResolvedValue(true);
    let response: Response = await request(APP).put("/database/websites/1");
    expect(response.status).toBe(httpStatus.OK);
  });

  test("Put Website, Fail", async function () {
    jest.spyOn(websiteService, "updateWebsite").mockRejectedValue(new Error());
    let fail: Response = await request(APP).put("/database/websites/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Put Website, Not Found", async function () {
    jest.spyOn(websiteService, "updateWebsite").mockResolvedValue(false);
    let notFound: Response = await request(APP).put("/database/websites/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Upsert Website", async function () {
    jest.spyOn(websiteService, "upsertWebsiteByJobUrl").mockResolvedValue(MOCKED_WEBSITE.WebsiteID);
    let response: Response = await request(APP).post("/database/websites/upsertbyjoburl").send({
      joburl: "mock",
      etag: "mock",
      lastmodified: "mock",
      hash: "mock",
    });
    expect(response.status).toBe(httpStatus.OK);
  });

  test("Upsert Website", async function () {
    jest.spyOn(websiteService, "upsertWebsiteByJobUrl").mockRejectedValue(new Error());
    let response: Response = await request(APP).post("/database/websites/upsertbyjoburl").send({
      joburl: "mock",
      etag: "mock",
      lastmodified: "mock",
      hash: "mock",
    });
    expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });
});
