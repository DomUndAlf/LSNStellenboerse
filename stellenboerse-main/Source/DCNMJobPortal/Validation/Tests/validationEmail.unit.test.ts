import { sendValidationEmail } from "../Services/validationEmail";
import { expect, jest, test } from "@jest/globals";
import { IJob, IWebsite, IEmployer } from "../../Shared/interfaces";
import axios, { AxiosResponse } from "axios";
import { httpStatus } from "../../Shared/httpStatus";
import * as sendEmailService from "../Services/sendEmail";

jest.mock("../Services/sendEmail");
jest.mock("axios");

const MOCKED_EMPLOYER: IEmployer = {
  EmployerID: 1,
  Emails: ["example@gmail.com"],
  sendValidationEmails: true,
} as IEmployer;

const MOCKED_EMPLOYER_ERROR: IEmployer = {
  EmployerID: 2,
  Emails: ["examplegmailcom"],
  sendValidationEmails: true,
} as IEmployer;

const MOCKED_EMPLOYER_WITH_DISABLED_EMAILS: IEmployer = {
  EmployerID: 3,
  Emails: ["example@gmail.com"],
  sendValidationEmails: false,
} as IEmployer;

const MOCKED_WEBSITE: IWebsite = {
  WebsiteID: 1,
  JobURL: "mockUrl",
} as IWebsite;

const MOCKED_JOB: IJob = {
  JobID: 1,
  Title: "mockTitle",
  Description: "mockDescription",
  Website: MOCKED_WEBSITE,
  Employer: MOCKED_EMPLOYER,
} as IJob;

const MOCKED_JOB_ERROR: IJob = {
  JobID: 2,
  Title: "mockTitle",
  Description: "mockDescription",
  Website: MOCKED_WEBSITE,
  Employer: MOCKED_EMPLOYER_ERROR,
} as IJob;

const MOCKED_JOB_WITH_DISABLED_EMAILS: IJob = {
  JobID: 3,
  Title: "mockTitle",
  Description: "mockDescription",
  Website: MOCKED_WEBSITE,
  Employer: MOCKED_EMPLOYER_WITH_DISABLED_EMAILS,
} as IJob;

const MOCKED_RESPONSE: AxiosResponse = {
  status: httpStatus.OK,
  data: MOCKED_JOB,
} as AxiosResponse;

const MOCKED_RESPONSE_FAILED: AxiosResponse = {
  status: httpStatus.BAD_REQUEST,
  data: MOCKED_JOB_ERROR,
} as AxiosResponse;

const MOCKED_RESPONSE_WITH_DISABLED_EMAILS: AxiosResponse = {
  status: httpStatus.OK,
  data: MOCKED_JOB_WITH_DISABLED_EMAILS,
} as AxiosResponse;

beforeEach(function () {
  jest.clearAllMocks();
});

test("Validation Email", async function () {
  process.env.MODE = "production";
  console.log = jest.fn();
  jest.spyOn(axios, "get").mockResolvedValue(MOCKED_RESPONSE);

  // Assume MOCKED_RESPONSE contains valid job data with a valid email address
  await sendValidationEmail(1, "mockkey");

  // Check if the log message contains the expected string
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining("VALIDATION EMAIL FOR JOB"));
});

test("Validation Email failed", async function () {
  process.env.MODE = "production";
  jest.spyOn(axios, "get").mockResolvedValue(MOCKED_RESPONSE_FAILED);

  // Test for failure when invalid email is encountered
  await expect(sendValidationEmail(1, "mockkey")).rejects.toThrow(
    "FAILED TO SEND VALIDATION EMAIL FOR JOB #1",
  );
});

test("Validation Email development mode", async function () {
  process.env.MODE = "development";
  process.env.SEND_ADDRESS = "mahmod.qobty_mahamid@stud.htwk-leipzig.de";
  console.log = jest.fn();
  jest.spyOn(axios, "get").mockResolvedValue(MOCKED_RESPONSE);

  // In development mode, SEND_ADDRESS is used
  await sendValidationEmail(1, "mockkey");

  // Check that the log message contains the expected string
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining("VALIDATION EMAIL FOR JOB"));
});

test("Validation Email skipped when employer disabled notifications", async function () {
  process.env.MODE = "production";
  console.log = jest.fn();
  jest.spyOn(axios, "get").mockResolvedValue(MOCKED_RESPONSE_WITH_DISABLED_EMAILS);
  const SEND_MAIL_SPY = jest.spyOn(sendEmailService, "sendMail").mockResolvedValue();
  SEND_MAIL_SPY.mockClear();

  await sendValidationEmail(3, "mockkey");

  expect(SEND_MAIL_SPY).not.toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith("VALIDATION EMAIL FOR JOB #3 SKIPPED.");
});
