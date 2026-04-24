import { jest, test, expect } from "@jest/globals";
import { httpStatus } from "../../Shared/httpStatus";
import express, { Express } from "express";
import request, { Response } from "supertest";
import ROUTER from "../Routers/schedulerRouter";
import * as schedulerModule from "../Services/scraperScheduler";

const APP: Express = express();
APP.use(express.json());
APP.use("/scraper", ROUTER);

jest.mock("../Services/scraperScheduler");

test("Start Scraper Schedule", async function () {
  let result: Response = await request(APP).post("/scraper/start");
  expect(result.statusCode).toBe(httpStatus.OK);
});

test("Start Scraper Schedule, Internal Error", async function () {
  jest.spyOn(schedulerModule, "scheduleScraper").mockImplementation(function () {
    throw new Error("mock Error");
  });
  let result: Response = await request(APP).post("/scraper/start");
  expect(result.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});
