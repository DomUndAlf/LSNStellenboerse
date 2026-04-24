import { test, expect, jest, describe } from "@jest/globals";
jest.mock("openai");
import { aiExtractor, isValidJobPosting } from "../../Services/jobExtractor";
import axios, { AxiosResponse, AxiosError } from "axios";
import { httpStatus } from "../../../Shared/httpStatus";
import * as mockModule from "../../Services/extractDetails";

jest.mock("axios");
jest.mock("../../Services/extractDetails");
jest.mock("../../Services/scraper");

const MOCKED_URL: string = "http://mockedSite.com";
const MOCKED_WEBSITEID: number = 1;
const MOCKED_LOCATION_ID: number = 1;

let saveOrUpdateResponse: AxiosResponse = {
  data: 1,
  status: httpStatus.OK,
} as AxiosResponse;

let validationResponse: AxiosResponse = {
  data: {
    message: "mocked Validation Response",
  },
  status: httpStatus.OK,
} as AxiosResponse;

let mockedError: AxiosError = {
  response: {
    headers: {},
    data: "mock",
    statusText: "mockNotFound",
    status: httpStatus.INTERNAL_SERVER_ERROR,
  } as AxiosResponse,
  isAxiosError: true,
  message: "mock",
} as AxiosError;

let mockedJobResponse: { EmployerID: number; LocationID: number } = {
  EmployerID: 123,
  LocationID: 456,
};

let mockedJobDetailsResponse: mockModule.JobResponse = {
  jobTitle: "Software Developer (m/w/d)",
  jobDescription:
    "Wir suchen einen erfahrenen Softwareentwickler für unser Team. Sie werden an spannenden Projekten arbeiten und die Möglichkeit haben, zu wachsen. Das ist eine ausführliche Beschreibung der Stelle.",
  tasks: ["Entwicklung von Web-Applikationen", "Code Review", "Dokumentation"],
  applicationDeadline: new Date(),
  language: "de",
};

let consoleLogSpy: jest.SpiedFunction<typeof console.log> = jest.spyOn(console, "log");
let consoleErrorSpy: jest.SpiedFunction<typeof console.error> = jest.spyOn(console, "error");
let extractJobDetailsSpy: jest.SpiedFunction<typeof mockModule.extractJobDetails> = jest.spyOn(
  mockModule,
  "extractJobDetails",
);

let axiosPostSpy: jest.SpiedFunction<typeof axios.post> = jest.spyOn(axios, "post");
let axiosGetSpy: jest.SpiedFunction<typeof axios.get> = jest.spyOn(axios, "get");
let axiosErrorSpy: jest.SpiedFunction<typeof axios.isAxiosError> = jest.spyOn(
  axios,
  "isAxiosError",
);

test("aiExtractor Test", async function () {
  axiosGetSpy.mockResolvedValueOnce({ data: mockedJobResponse } as AxiosResponse);
  axiosPostSpy.mockResolvedValueOnce(saveOrUpdateResponse);
  axiosPostSpy.mockResolvedValueOnce(validationResponse);
  extractJobDetailsSpy.mockResolvedValue(mockedJobDetailsResponse);

  await aiExtractor(MOCKED_URL, MOCKED_WEBSITEID, MOCKED_LOCATION_ID);

  expect(consoleLogSpy).toHaveBeenCalledWith(
    expect.stringContaining("Job successfully saved"),
    saveOrUpdateResponse.data,
  );
  expect(axiosGetSpy).toHaveBeenCalledWith(
    `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${MOCKED_LOCATION_ID}`,
  );
});

test("aiExtractor, Save or Update Error", async function () {
  axiosGetSpy.mockResolvedValueOnce({ data: mockedJobResponse } as AxiosResponse);
  axiosPostSpy.mockRejectedValue(mockedError);
  axiosErrorSpy.mockReturnValue(true);

  await expect(aiExtractor(MOCKED_URL, MOCKED_WEBSITEID, MOCKED_LOCATION_ID)).rejects.toThrow(
    "Error saving/updating job:",
  );
  expect(consoleErrorSpy).toHaveBeenCalledWith("AI-Extractor Database error!");
});

test("aiExtractor, Validation Error", async function () {
  axiosGetSpy.mockResolvedValueOnce({ data: mockedJobResponse } as AxiosResponse);
  axiosPostSpy.mockResolvedValueOnce(saveOrUpdateResponse);
  axiosPostSpy.mockRejectedValueOnce(mockedError);
  axiosErrorSpy.mockReturnValue(true);
  await aiExtractor(MOCKED_URL, MOCKED_WEBSITEID, MOCKED_LOCATION_ID);
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining("Error sending validation email:"),
    mockedError.message,
  );
});

describe("isValidJobPosting", function () {
  test("returns true for job with description and tasks", function () {
    const validJob: mockModule.JobResponse = {
      jobTitle: "Software Developer",
      jobDescription:
        "We are looking for an experienced software developer to join our team. You will work on exciting projects and have the opportunity to grow.",
      tasks: ["Develop web applications", "Code review", "Documentation"],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(validJob)).toBe(true);
  });

  test("returns true for job with only description (no tasks)", function () {
    const jobWithDescription: mockModule.JobResponse = {
      jobTitle: "Research Assistant",
      jobDescription:
        "We are looking for a research assistant to support our team in conducting experiments and analyzing data. The position offers flexible working hours.",
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(jobWithDescription)).toBe(true);
  });

  test("returns true for job with only tasks (minimal description)", function () {
    const jobWithTasks: mockModule.JobResponse = {
      jobTitle: "Developer Position",
      jobDescription: "Short description.",
      tasks: [
        "Entwicklung von Software-Lösungen",
        "Zusammenarbeit im Team",
        "Dokumentation der Entwicklung",
      ],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(jobWithTasks)).toBe(true);
  });

  test("returns false for job with no description and no tasks", function () {
    const emptyJob: mockModule.JobResponse = {
      jobTitle: "Empty Position",
      jobDescription: "",
      tasks: [],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(emptyJob)).toBe(false);
  });

  test("returns false for job with generic title 'Professuren'", function () {
    const overviewPage: mockModule.JobResponse = {
      jobTitle: "Professuren",
      jobDescription:
        "This is a listing page with multiple professor positions at our university.",
      tasks: [],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(overviewPage)).toBe(false);
  });

  test("returns false for job with generic title 'Stellenangebote'", function () {
    const listingPage: mockModule.JobResponse = {
      jobTitle: "Stellenangebote",
      jobDescription: "Here are our current job offers.",
      tasks: [],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(listingPage)).toBe(false);
  });

  test("returns false for job with generic title 'Jobs'", function () {
    const jobsPage: mockModule.JobResponse = {
      jobTitle: "Jobs",
      jobDescription: "Browse our available positions.",
      tasks: [],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(jobsPage)).toBe(false);
  });

  test("returns true for specific professor position", function () {
    // "Professur für Informatik" should NOT be treated as a generic title
    const specificProfessor: mockModule.JobResponse = {
      jobTitle: "Professur für Informatik",
      jobDescription:
        "Die Fakultät für Informatik sucht eine Professorin oder einen Professor für das Fachgebiet Softwareentwicklung.",
      tasks: ["Lehre im Bereich Informatik", "Forschung", "Betreuung von Studierenden"],
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(specificProfessor)).toBe(true);
  });

  test("returns false for undefined description and tasks", function () {
    const undefinedJob: mockModule.JobResponse = {
      jobTitle: "Some Position",
      jobDescription: undefined,
      tasks: undefined,
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(undefinedJob)).toBe(false);
  });

  test("returns false for job with only very short tasks", function () {
    const shortTasksJob: mockModule.JobResponse = {
      jobTitle: "Position",
      jobDescription: "Short.",
      tasks: ["a", "b", "c"], // Tasks too short (< 10 chars)
      applicationDeadline: new Date("2025-12-31"),
      language: "de",
    };
    expect(isValidJobPosting(shortTasksJob)).toBe(false);
  });
});
