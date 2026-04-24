import { expect, jest, test } from "@jest/globals";
import request, { Response } from "supertest";
import express, { Express } from "express";
import databaseRouter from "../../Routers/databaseRouter";
import { httpStatus } from "../../../Shared/httpStatus";
import * as keywordService from "../../Services/keywordService";
import { EmployerKeywordLocation } from "../../Models/Entities/EmployerKeywordLocation";

jest.mock("../../Services/keywordService");

const APP: Express = express();
APP.use(express.json());
APP.use("/database", databaseRouter);

let mockedKeyword: EmployerKeywordLocation = {
  ID: 1,
  Keyword: "mockedKeyword",
} as EmployerKeywordLocation;

test("Get Keywords", async function () {
  jest.spyOn(keywordService, "readKeyWordsForEmployer").mockResolvedValueOnce([mockedKeyword]);
  let response: Response = await request(APP).get("/database/keyword/1");
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Get Keywords no Result", async function () {
  jest.spyOn(keywordService, "readKeyWordsForEmployer").mockResolvedValueOnce([]);
  let response: Response = await request(APP).get("/database/keyword/1");
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Get Keywords Internal Error", async function () {
  jest.spyOn(keywordService, "readKeyWordsForEmployer").mockRejectedValue(new Error());
  let response: Response = await request(APP).get("/database/keyword/1");
  expect(response.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});
