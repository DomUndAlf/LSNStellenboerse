import { expect, jest, describe, test } from "@jest/globals";
import request, { Response } from "supertest";
import express, { Express } from "express";
import apiRouter from "../../Routers/apiRouter";
import databaseRouter from "../../Routers/databaseRouter";
import { httpStatus } from "../../../Shared/httpStatus";
import { Location } from "../../Models/Entities/Location";
import * as locationService from "../../Services/locationService";

jest.mock("../../Services/locationService");

const APP: Express = express();
APP.use(express.json());
APP.use("/api", apiRouter);
APP.use("/database", databaseRouter);

const MOCKED_LOCATION: Location = {
  LocationID: 1,
  Street: "mock street",
  HouseNumber: "1",
  PostalCode: "00001",
  created_at: new Date("2024-01-01"),
  Jobs: [],
  City: "mocked city",
  EmployerKeywordLocations: [],
};

describe("Location Controllers", function () {
  test("Post Location", async function () {
    jest.spyOn(locationService, "createLocation").mockResolvedValue(MOCKED_LOCATION.LocationID);
    let response: Response = await request(APP).post("/database/locations");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Post Location, Fail", async function () {
    jest.spyOn(locationService, "createLocation").mockRejectedValue(new Error());
    let fail: Response = await request(APP).post("/database/locations");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get All Location", async function () {
    jest.spyOn(locationService, "readAllLocation").mockResolvedValue([MOCKED_LOCATION]);
    let response: Response = await request(APP).get("/database/locations");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get All Location, Fail", async function () {
    jest.spyOn(locationService, "readAllLocation").mockRejectedValue(new Error());
    let fail: Response = await request(APP).get("/database/locations");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get One Location", async function () {
    jest.spyOn(locationService, "readLocation").mockResolvedValue(MOCKED_LOCATION);
    let response: Response = await request(APP).get("/database/locations/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Get One Location, Fail", async function () {
    jest.spyOn(locationService, "readLocation").mockRejectedValue(new Error());
    let fail: Response = await request(APP).get("/database/locations/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Get One Location, Not Found", async function () {
    jest.spyOn(locationService, "readLocation").mockResolvedValue(null);
    let notFound: Response = await request(APP).get("/database/locations/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Put Location", async function () {
    jest.spyOn(locationService, "updateLocation").mockResolvedValue(true);
    let response: Response = await request(APP).put("/database/locations/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Put Location, Not Found", async function () {
    jest.spyOn(locationService, "updateLocation").mockResolvedValue(false);
    let notFound: Response = await request(APP).put("/database/locations/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Put Location, Fail", async function () {
    jest.spyOn(locationService, "updateLocation").mockRejectedValue(new Error());
    let fail: Response = await request(APP).put("/database/locations/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });

  test("Delete Location", async function () {
    jest.spyOn(locationService, "deleteLocation").mockResolvedValue(true);
    let response: Response = await request(APP).delete("/database/locations/1");
    expect(response.statusCode).toBe(httpStatus.OK);
  });

  test("Delete Location, Not Found", async function () {
    jest.spyOn(locationService, "deleteLocation").mockResolvedValue(false);
    let notFound: Response = await request(APP).delete("/database/locations/1");
    expect(notFound.status).toBe(httpStatus.NOT_FOUND);
  });

  test("Delete Location, Fail", async function () {
    jest.spyOn(locationService, "deleteLocation").mockRejectedValue(new Error());
    let fail: Response = await request(APP).delete("/database/locations/1");
    expect(fail.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
  });
});
