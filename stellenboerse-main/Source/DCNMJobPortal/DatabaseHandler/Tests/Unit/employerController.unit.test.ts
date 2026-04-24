import { expect, jest, describe, test } from "@jest/globals";
import request, { Response } from "supertest";
import express, { Express } from "express";
import apiRouter from "../../Routers/apiRouter";
import databaseRouter from "../../Routers/databaseRouter";
import { httpStatus } from "../../../Shared/httpStatus";
import { Employer } from "../../Models/Entities/Employer";
import * as employerService from "../../Services/employerService";

jest.mock("../../Services/employerService");

const APP: Express = express();
APP.use(express.json());
APP.use("/api", apiRouter);
APP.use("/database", databaseRouter);

const MOCKED_EMP: Employer = {
  EmployerID: 1,
  LocationID: 1,
  Emails: ["mock@yahoo.com"],
  ShortName: "mockShortName",
  FullName: "mockFullName",
  Website: "https://mocksite.com",
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
  sendValidationEmails: true,
};

describe("Employer Controllers", function () {
  test("Post Employer", async function () {
    jest.spyOn(employerService, "createEmployer").mockResolvedValueOnce(MOCKED_EMP.EmployerID);
    let response: Response = await request(APP)
      .post("/database/employers")
      .send({
        shortname: "mock",
        website: "mock",
        emails: ["mock"],
      });
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Post Employer, Fail", async function () {
    jest.spyOn(employerService, "createEmployer").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP)
      .post("/database/employers")
      .send({
        name: "mock",
        website: "mock",
        emails: ["mock"],
      });
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get All Employer", async function () {
    jest.spyOn(employerService, "readAllEmployer").mockResolvedValueOnce([MOCKED_EMP]);
    let response: Response = await request(APP).get("/database/employers");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get All Employer, Fail", async function () {
    jest.spyOn(employerService, "readAllEmployer").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).get("/database/employers");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get One Employer", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValueOnce(MOCKED_EMP);
    let response: Response = await request(APP).get("/database/employers/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get One Employer, Fail", async function () {
    jest.spyOn(employerService, "readEmployer").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).get("/database/employers/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get One Employer, Not Found", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValue(null);
    let notFound: Response = await request(APP).get("/database/employers/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Get Blacklist", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValueOnce(MOCKED_EMP);
    let response: Response = await request(APP).get("/database/employers/1/blacklist");
    expect(response.statusCode).toBe(httpStatus.OK);
    expect(response.body).toEqual(MOCKED_EMP.Blacklist);
  });

  test("Get Blacklist, Fail", async function () {
    jest.spyOn(employerService, "readEmployer").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).get("/database/employers/1/blacklist");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get Blacklist, Employer Not Found", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValueOnce(null);
    let notFound: Response = await request(APP).get("/database/employers/1/blacklist");
    expect(notFound.status).toBe(httpStatus.OK);
    expect(notFound.body).toEqual([]);
  });

  test("Get Whitelist", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValueOnce(MOCKED_EMP);
    let response: Response = await request(APP).get("/database/employers/1/whitelist");
    expect(response.statusCode).toBe(httpStatus.OK);
    expect(response.body).toEqual(MOCKED_EMP.Whitelist);
  });

  test("Get Whitelist, Fail", async function () {
    jest.spyOn(employerService, "readEmployer").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP).get("/database/employers/1/whitelist");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get Whitelist, Employer Not Found", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValueOnce(null);
    let notFound: Response = await request(APP).get("/database/employers/1/whitelist");
    expect(notFound.status).toBe(httpStatus.OK);
    expect(notFound.body).toEqual([]);
  });

  test("Put Employer", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValue(MOCKED_EMP);
    jest.spyOn(employerService, "updateEmployer").mockResolvedValue(true);
    let response: Response = await request(APP).put("/database/employers/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Put Employer, Fail", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValue(MOCKED_EMP);
    jest.spyOn(employerService, "updateEmployer").mockRejectedValue(new Error());
    let fail: Response = await request(APP).put("/database/employers/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Put Employer, Not Found", async function () {
    jest.spyOn(employerService, "readEmployer").mockResolvedValueOnce(null);
    let notFound: Response = await request(APP).put("/database/employers/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Put Blacklist", async function () {
    jest.spyOn(employerService, "updateBlacklist").mockResolvedValueOnce();
    let response: Response = await request(APP)
      .put("/database/employers/1/blacklist")
      .send({ urls: ["http://example.com"] });
    expect(response.statusCode).toBe(httpStatus.OK);
    expect(response.body).toEqual({ message: "Blacklist updated successfully" });
  });

  test("Put Blacklist, Fail", async function () {
    jest.spyOn(employerService, "updateBlacklist").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP)
      .put("/database/employers/1/blacklist")
      .send({ urls: ["http://example.com"] });
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Put Blacklist, Invalid Input", async function () {
    let badRequest: Response = await request(APP)
      .put("/database/employers/1/blacklist")
      .send({ urls: "not-an-array" });
    expect(badRequest.status).toBe(httpStatus.BAD_REQUEST);
    expect(badRequest.body).toEqual({ error: "Invalid input data" });
  });

  test("Put Whitelist", async function () {
    jest.spyOn(employerService, "updateWhitelist").mockResolvedValueOnce();
    let response: Response = await request(APP)
      .put("/database/employers/1/whitelist")
      .send({ urls: ["http://example.com"] });
    expect(response.statusCode).toBe(httpStatus.OK);
    expect(response.body).toEqual({ message: "Whitelist updated successfully" });
  });

  test("Put Whitelist, Fail", async function () {
    jest.spyOn(employerService, "updateWhitelist").mockRejectedValueOnce(new Error());
    let fail: Response = await request(APP)
      .put("/database/employers/1/whitelist")
      .send({ urls: ["http://example.com"] });
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Put Whitelist, Invalid Input", async function () {
    let badRequest: Response = await request(APP)
      .put("/database/employers/1/whitelist")
      .send({ urls: "not-an-array" });
    expect(badRequest.status).toBe(httpStatus.BAD_REQUEST);
    expect(badRequest.body).toEqual({ error: "Invalid input data" });
  });

  test("Delete Employer", async function () {
    jest.spyOn(employerService, "deleteEmployer").mockResolvedValue(true);
    let response: Response = await request(APP).delete("/database/employers/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Delete Employer, Fail", async function () {
    jest.spyOn(employerService, "deleteEmployer").mockRejectedValue(new Error());
    let fail: Response = await request(APP).delete("/database/employers/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Delete Employer, Not Found", async function () {
    jest.spyOn(employerService, "deleteEmployer").mockResolvedValue(false);
    let notFound: Response = await request(APP).delete("/database/employers/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });
});
