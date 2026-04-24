import { test, expect, jest, beforeEach } from "@jest/globals";
jest.mock("pdf-parse", function () {
  return jest.fn();
});
jest.mock("../../Services/extractDetails");
jest.mock("openai");
jest.mock("axios");
import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as pdfService from "../../Services/pdfService";
import * as aiService from "../../Services/extractDetails";
import pdf, { Result } from "pdf-parse";
import { httpStatus } from "../../../Shared/httpStatus";
import { setMockedDate } from "../../../Shared/dateUtils";
import { ExtractionAttributs } from "../../../Shared/aiHelpers";

const MOCKED_AXIOS: jest.Mocked<AxiosInstance> = jest.mocked(axios);
const MOCKED_PDF_PARSE: jest.MockedFunction<typeof pdf> = pdf as jest.Mock<typeof pdf>;

const createAxiosResponse = function <T>(
  data: T,
  headers: Record<string, string>,
): AxiosResponse<T> {
  return {
    data,
    status: httpStatus.OK,
    statusText: "OK",
    headers,
    config: {} as any,
    request: undefined,
  } as AxiosResponse<T>;
};

let mockedResponse: AxiosResponse = createAxiosResponse("mockedPdfData", {
  "content-type": "application/pdf",
});

let pdfParseResult: Result = {
  text: "mockedPdfText",
} as Result;

beforeEach(function () {
  jest.clearAllMocks();
  mockedResponse = createAxiosResponse("mockedPdfData", {
    "content-type": "application/pdf",
  });
  pdfParseResult = {
    text: "mockedPdfText",
  } as Result;
  MOCKED_PDF_PARSE.mockResolvedValue(pdfParseResult);
});

test("Extract Job from PDF", async function () {
  MOCKED_AXIOS.get.mockResolvedValueOnce(mockedResponse);
  let aiSpy: jest.SpiedFunction<typeof aiService.aiResponse> = jest.spyOn(aiService, "aiResponse");

  aiSpy.mockResolvedValue("aiResponseTitle");

  await expect(pdfService.handlePdf("mockLink", 1, 1)).rejects.toThrow(
    "Error saving/updating job: Cannot read properties of undefined (reading 'data')",
  );
});

test("should set finalDeadline to deadlineDate if it is in the future", async function () {
  setMockedDate(new Date("2024-01-01"));
  jest.spyOn(aiService, "aiResponse").mockImplementation(function (
    _text: string,
    attribute: ExtractionAttributs,
  ) {
    if (attribute === ExtractionAttributs.Titel) {
      return Promise.resolve("Test Job Title");
    } else if (attribute === ExtractionAttributs.ApplicationDeadline) {
      return Promise.resolve("2024-12-31");
    }
    return Promise.resolve("");
  });

  const JOB_RESPONSE: aiService.JobResponse = await pdfService.extractJobFromPdf("dummy pdf text");
  expect(JOB_RESPONSE.applicationDeadline).toEqual(new Date("2024-12-31"));
  setMockedDate(null);
});

test("getText returns parsed PDF text when response is a PDF", async function () {
  MOCKED_AXIOS.get.mockResolvedValueOnce(mockedResponse);

  const RESULT: string = await pdfService.getText("https://example.com/job.pdf");

  expect(MOCKED_AXIOS.get).toHaveBeenCalledWith("https://example.com/job.pdf", {
    responseType: "arraybuffer",
  });
  expect(MOCKED_PDF_PARSE).toHaveBeenCalled();
  expect(RESULT).toBe("mockedPdfText");
});

test("getText falls back to HTML when PDF parsing fails", async function () {
  const HTML_RESPONSE: AxiosResponse = createAxiosResponse(
    Buffer.from("<html><body><h1>Stellenausschreibung</h1></body></html>", "utf-8"),
    { "content-type": "text/html" },
  );

  MOCKED_AXIOS.get.mockResolvedValueOnce(HTML_RESPONSE);
  MOCKED_PDF_PARSE.mockRejectedValueOnce(new Error("Invalid PDF"));

  const RESULT: string = await pdfService.getText(
    "https://www.example.org/stellenangebot.pdf/view",
  );

  expect(MOCKED_PDF_PARSE).toHaveBeenCalled();
  expect(RESULT).toBe("Stellenausschreibung");
});

test("getText follows download link inside viewer HTML", async function () {
  const HTML_WITH_DOWNLOAD: AxiosResponse = createAxiosResponse(
    Buffer.from(
      '<html><body><a href="/de/ausschreibungen/stellenausschreibungen/reinigungskraft_2025-docx.pdf/@@download/file/Reinigungskraft_2025.docx.pdf">Download</a></body></html>',
      "utf-8",
    ),
    { "content-type": "text/html" },
  );

  const PDF_DOWNLOAD_RESPONSE: AxiosResponse = createAxiosResponse(Buffer.from("%PDF-1.4"), {
    "content-type": "application/pdf",
  });

  MOCKED_AXIOS.get.mockResolvedValueOnce(HTML_WITH_DOWNLOAD);
  MOCKED_PDF_PARSE.mockRejectedValueOnce(new Error("Invalid PDF"));
  MOCKED_AXIOS.get.mockResolvedValueOnce(PDF_DOWNLOAD_RESPONSE);
  MOCKED_PDF_PARSE.mockResolvedValueOnce({ text: "Nested PDF content" } as Result);

  const RESULT: string = await pdfService.getText(
    "https://www.saw-leipzig.de/de/ausschreibungen/stellenausschreibungen/reinigungskraft_2025-docx.pdf/view",
  );

  expect(MOCKED_AXIOS.get).toHaveBeenNthCalledWith(
    1,
    "https://www.saw-leipzig.de/de/ausschreibungen/stellenausschreibungen/reinigungskraft_2025-docx.pdf/view",
    { responseType: "arraybuffer" },
  );
  expect(MOCKED_AXIOS.get).toHaveBeenNthCalledWith(
    2,
    "https://www.saw-leipzig.de/de/ausschreibungen/stellenausschreibungen/reinigungskraft_2025-docx.pdf/@@download/file/Reinigungskraft_2025.docx.pdf",
    { responseType: "arraybuffer" },
  );
  expect(RESULT).toBe("Nested PDF content");
});

test("getText suppresses known pdf parser warnings", async function () {
  const WARN_RESPONSE: AxiosResponse = createAxiosResponse(Buffer.from("%PDF-1.4"), {
    "content-type": "application/pdf",
  });

  MOCKED_AXIOS.get.mockResolvedValueOnce(WARN_RESPONSE);

  const WARN_SPY = jest.spyOn(console, "warn");
  WARN_SPY.mockImplementation(function () {
    return undefined;
  });

  MOCKED_PDF_PARSE.mockImplementationOnce(async function () {
    console.warn('Ignoring invalid character "33" in hex string');
    console.warn("TT: undefined function: 32");
    return { text: "Suppressed content" } as Result;
  });

  const RESULT: string = await pdfService.getText("https://example.com/warn.pdf");

  expect(RESULT).toBe("Suppressed content");
  expect(WARN_SPY).not.toHaveBeenCalled();

  WARN_SPY.mockRestore();
});
