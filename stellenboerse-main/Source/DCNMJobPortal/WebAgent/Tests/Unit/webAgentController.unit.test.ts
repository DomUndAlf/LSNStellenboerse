import { expect, jest, test } from "@jest/globals";
import ROUTER from "../../Routers/webAgentRouter";
import request, { Response } from "supertest";
import express, { Express } from "express";
import { httpStatus } from "../../../Shared/httpStatus";
import * as crawlerManager from "../../Services/crawlerManager";

jest.mock("../../Services/crawlerManager");

const APP: Express = express();
APP.use(express.json());
APP.use("/webagent", ROUTER);

test("Post Serial Start", async function () {
  let response: Response = await request(APP).post("/webagent/serial/1");
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Post Serial Start, Bad Request", async function () {
  let response: Response = await request(APP).post("/webagent/serial/h");
  expect(response.statusCode).toBe(httpStatus.BAD_REQUEST);
});

test("Post Serial Start, Internal Error", async function () {
  jest.spyOn(crawlerManager, "serialStart").mockRejectedValue(new Error());
  let response: Response = await request(APP).post("/webagent/serial/1");
  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});

test("Post Parallel Start", async function () {
  let response: Response = await request(APP).post("/webagent/parallel/1");
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Post Parallel Start, Bad Request", async function () {
  let response: Response = await request(APP).post("/webagent/parallel/h");
  expect(response.statusCode).toBe(httpStatus.BAD_REQUEST);
});

test("Post Parallel Start, Internal Error", async function () {
  jest.spyOn(crawlerManager, "parallelStart").mockRejectedValue(new Error());
  let response: Response = await request(APP).post("/webagent/parallel/1");
  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});

test("Post Scrape All", async function () {
  let response: Response = await request(APP).post("/webagent/scrapeAll");
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Post Scrape All, Internal Error", async function () {
  jest.spyOn(crawlerManager, "scrapeAllEmployers").mockRejectedValue(new Error());
  let response: Response = await request(APP).post("/webagent/scrapeAll");
  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});
