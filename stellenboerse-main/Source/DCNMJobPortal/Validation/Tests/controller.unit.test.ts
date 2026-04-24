import { expect, jest, test } from "@jest/globals";
import validationRouter from "../Routers/validationRouter";
import request, { Response } from "supertest";
import express, { Express } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import * as validaitonModule from "../Services/validationEmail";
import validator from "validator";
import axios, { AxiosError, AxiosResponse } from "axios";

jest.mock("validator");
jest.mock("axios");
jest.mock("../Services/validationEmail");

let notFoundError: AxiosError = {
  response: {
    headers: {},
    data: "mock",
    statusText: "mockNotFound",
    status: httpStatus.NOT_FOUND,
  } as AxiosResponse,
  isAxiosError: true,
  message: "mock",
} as AxiosError;

const APP: Express = express();
APP.use(express.json());
APP.use("/validation", validationRouter);

test("Post Email Controller", async function () {
  jest.spyOn(validator, "isEmail").mockReturnValue(true);
  let response: Response = await request(APP).post("/validation/email/1").send({
    email: "mock@yahoo.com",
  });
  expect(response.statusCode).toBe(httpStatus.OK);
});

test("Post Email Controller, axios Error", async function () {
  jest.spyOn(validator, "isEmail").mockReturnValue(true);
  jest.spyOn(axios, "put").mockRejectedValue(notFoundError);
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  let response: Response = await request(APP).post("/validation/email/1").send({
    email: "mock@yahoo.com",
  });
  expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
});

test("Post Email Controller, Invalid JobID", async function () {
  let badRequest: Response = await request(APP).post("/validation/email/mockjobid").send({
    email: "mock@yahoo.com",
  });
  expect(badRequest.statusCode).toBe(httpStatus.BAD_REQUEST);
});

/**test("Post Email Controller, Invalid Email", async function () {
  jest.spyOn(axios, "put").mockResolvedValue(undefined);
  jest.spyOn(validator, "isEmail").mockReturnValue(false);
  let badRequest: Response = await request(APP).post("/validation/email/1").send({
    email: "mock@invalidemail.",
  });
  expect(badRequest.statusCode).toBe(httpStatus.BAD_REQUEST);
});**/

test("Post Email Controller, sendValidateEmail Fail", async function () {
  jest.spyOn(axios, "put").mockResolvedValue(undefined);
  jest.spyOn(validator, "isEmail").mockReturnValue(true);
  jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
  jest.spyOn(validaitonModule, "sendValidationEmail").mockRejectedValue(new Error());
  let fail: Response = await request(APP).post("/validation/email/1").send({
    email: "mock@yahoo.com",
  });
  expect(fail.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
});
