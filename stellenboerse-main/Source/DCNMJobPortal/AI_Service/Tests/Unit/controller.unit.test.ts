import { test, expect, jest } from "@jest/globals";
import request, { Response } from "supertest";
import express, { Express } from "express";
import { httpStatus } from "../../../Shared/httpStatus";
jest.mock("openai");
jest.mock("../../Services/pdfService");
jest.mock("../../Services/jobExtractor");
import AIROUTER from "../../Routers/aiRouter";
import * as pdfService from "../../Services/pdfService";
import * as service from "../../Services/jobExtractor";

const APP: Express = express();
APP.use(express.json());
APP.use("/webagent", AIROUTER);

test("Controller Test", async function () {
  let response: Response = await request(APP).post("/webagent/extract/").send({
    websiteid: 1,
    url: "mockUrl",
  });

  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Controller Test, Error", async function () {
  jest.spyOn(service, "aiExtractor").mockRejectedValue(new Error());
  let response: Response = await request(APP).post("/webagent/extract").send({
    websiteid: 1,
    url: "mockUrl",
  });

  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});

test("PDF Controller Test", async function () {
  let response: Response = await request(APP).post("/webagent/pdf").send({
    url: "mockUrl",
  });
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("PDF Controller Test, Error", async function () {
  jest.spyOn(pdfService, "handlePdf").mockRejectedValue(new Error());
  let response: Response = await request(APP).post("/webagent/pdf").send({
    url: "mockUrl",
  });
  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});
