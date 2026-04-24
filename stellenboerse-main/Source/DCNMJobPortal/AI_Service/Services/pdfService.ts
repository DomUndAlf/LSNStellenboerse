import pdf from "pdf-parse";
import axios, { AxiosResponse } from "axios";
import { load } from "cheerio";
import { aiResponse, JobResponse, aiResponseTasks } from "./extractDetails";
import { ExtractionAttributs, parseDate } from "../../Shared/aiHelpers";
import { getCurrentDate } from "../../Shared/dateUtils";
import { IEmployer } from "../../Shared/interfaces";
import { httpStatus } from "../../Shared/httpStatus";

/**
 * Fetches the text content of a PDF file from a given URL.
 *
 * @param pdfLink The URL to the PDF file.
 * @returns A promise that resolves to the extracted text content of the PDF.
 * @throws Will throw an error if the PDF cannot be fetched or parsed.
 */
const DOWNLOAD_SELECTORS: string[] = [
  'a[href*="@@download"]',
  'a[href$=".pdf"]',
  'a[href*=".pdf?"]',
  'a[href$=".doc"]',
  'a[href$=".docx"]',
  'a[href*=".doc?"]',
  'a[href*=".docx?"]',
  'iframe[src*=".pdf"]',
  'embed[src*=".pdf"]',
];

export async function getText(
  pdfLink: string,
  visited: Set<string> = new Set<string>(),
): Promise<string> {
  if (visited.has(pdfLink)) {
    throw new Error(`Circular PDF reference detected for URL: ${pdfLink}`);
  }
  visited.add(pdfLink);

  const RESPONSE: AxiosResponse<ArrayBuffer> = await axios.get(pdfLink, {
    responseType: "arraybuffer",
  });

  const DATA_BUFFER: Buffer = Buffer.from(RESPONSE.data);
  const CONTENT_TYPE: string = (RESPONSE.headers?.["content-type"] ?? "").toLowerCase();
  const LINK_HAS_PDF_HINT: boolean = pdfLink.toLowerCase().includes(".pdf");

  const extractHtmlContext = function () {
    const HTML_STRING: string = DATA_BUFFER.toString("utf-8");
    const $ = load(HTML_STRING);
    const TEXT: string = $("body").text().replace(/\s+/g, " ").trim();

    for (const SELECTOR of DOWNLOAD_SELECTORS) {
      const ELEMENT = $(SELECTOR).first();
      if (!ELEMENT.length) {
        continue;
      }

      const LINK: string | undefined = ELEMENT.attr("href") ?? ELEMENT.attr("src");
      if (!LINK) {
        continue;
      }

      try {
        const RESOLVED_URL: string = new URL(LINK, pdfLink).href;
        if (RESOLVED_URL !== pdfLink) {
          return { text: TEXT, downloadUrl: RESOLVED_URL };
        }
      } catch (error) {
        console.warn(`Failed to resolve potential download link '${LINK}': ${String(error)}`);
      }
    }

    return { text: TEXT, downloadUrl: null };
  };

  const shouldAttemptPdfParse: boolean = CONTENT_TYPE.includes("pdf") || LINK_HAS_PDF_HINT;

  if (shouldAttemptPdfParse || DATA_BUFFER.length > 0) {
    const SUPPRESSED_WARNINGS: RegExp[] = [
      /Ignoring invalid character/i,
      /TT: undefined function/i,
    ];
    const ORIGINAL_WARN: typeof console.warn = console.warn;
    console.warn = function (...args: unknown[]): void {
      const MESSAGE: string = args
        .map(function (arg: unknown): string {
          return String(arg);
        })
        .join(" ");
      if (SUPPRESSED_WARNINGS.some(function (pattern: RegExp): boolean {
        return pattern.test(MESSAGE);
      })) {
        return;
      }
      ORIGINAL_WARN.apply(console, args as []);
    };

    try {
      const PDF_TEXT: string = (await pdf(DATA_BUFFER)).text.trim();
      if (PDF_TEXT.length > 0) {
        return PDF_TEXT;
      }
    } catch (error) {
      const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
      ORIGINAL_WARN(
        `PDF parsing failed for ${pdfLink}: ${ERROR_MESSAGE}. Falling back to HTML parsing.`,
      );
    } finally {
      console.warn = ORIGINAL_WARN;
    }
  }

  const { text: HTML_TEXT, downloadUrl } = extractHtmlContext();

  if (downloadUrl && !visited.has(downloadUrl)) {
    try {
      return await getText(downloadUrl, visited);
    } catch (error) {
      const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
      console.warn(
        `Failed to extract content from nested download ${downloadUrl}: ${ERROR_MESSAGE}. Continuing with HTML fallback.`,
      );
    }
  }

  if (HTML_TEXT.length === 0) {
    throw new Error(`Unable to extract text content from resource: ${pdfLink}`);
  }

  return HTML_TEXT;
}

/**
 * Processes a PDF file to extract job-related information and store it in the database.
 * Additionally, sends a validation email for the job entry after saving.
 *
 * @param pdfLink The URL to the PDF file.
 * @param websiteId The ID of the website associated with the job.
 * @param employerId The ID of the employer associated with the job.
 *
 * @throws Error If the PDF text cannot be extracted, the job cannot be saved/updated,
 *               or the validation email cannot be sent.
 *
 * @returns A promise that resolves when the job is successfully processed and the validation email is sent.
 */
export async function handlePdf(pdfLink: string, websiteId: number, employerId: number) {
  let pdfText: string = await getText(pdfLink);
  let jobDetails: JobResponse = await extractJobFromPdf(pdfText);

  let SAVE_UPDATE_RESPONSE: AxiosResponse<number>;
  try {
    const EMPLOYER_RESPONSE: AxiosResponse<IEmployer> = await axios.get(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}`,
    );
    const EMPLOYER: IEmployer = EMPLOYER_RESPONSE.data;

    SAVE_UPDATE_RESPONSE = await axios.post(
      `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/saveorupdate`,
      {
        EMP_ID: EMPLOYER.EmployerID,
        LOCATION_ID: EMPLOYER.LocationID,
        TITLE: jobDetails.jobTitle,
        DESCRIPTION: jobDetails.jobDescription,
        TASKS: jobDetails.tasks,
        APPLICATION_DEADLINE: jobDetails.applicationDeadline,
        WEBSITE_ID: websiteId,
        LANGUAGE: jobDetails.language,
        SPECIALTY: jobDetails.specialty,
      },
    );
    console.log("Job successfully saved", SAVE_UPDATE_RESPONSE.data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response.status == httpStatus.INTERNAL_SERVER_ERROR) {
      console.error("AI-Extractor Database error!");
    }
    throw new Error(`Error saving/updating job: ${err.message}`);
  }

  let jobid: number = SAVE_UPDATE_RESPONSE.data;

  try {
    await axios.post(`http://localhost:${process.env.VALIDATION_PORT}/validation/email/${jobid}`);
  } catch (err) {
    console.error("Error sending validation email:", err.message);
  }
}

/**
 * Extracts job-related information from the text content of a PDF.
 *
 * @param pdfText The text content of the PDF file.
 * @returns A promise that resolves to a `JobResponse` object with extracted job details such as title, application deadline, tasks, and language.
 * @throws Will throw an error if job information cannot be extracted.
 */
export async function extractJobFromPdf(pdfText: string): Promise<JobResponse> {
  let title: string = await aiResponse(pdfText, ExtractionAttributs.Titel);
  let descriptionString: string = removeSections(pdfText);
  let description: string = await aiResponse(
    combineSplitWords(descriptionString),
    ExtractionAttributs.Description,
    true,
  );
  let deadline: string = await aiResponse(pdfText, ExtractionAttributs.ApplicationDeadline);
  let tasks: string[] = await aiResponseTasks(ExtractionAttributs.Tasks, pdfText);
  let deadlineDate: Date | null = null;
  if (deadline) {
    deadlineDate = parseDate(deadline);
  }
  const NOW: Date = getCurrentDate();
  let finalDeadline: Date | null = null;
  if (deadlineDate && deadlineDate > NOW) {
    finalDeadline = deadlineDate;
  }
  let language: string = await aiResponse(title, ExtractionAttributs.Language);

  let specialty: string[] = await aiResponseTasks(ExtractionAttributs.Specialty, pdfText);

  let jobObject: JobResponse = {
    jobTitle: title,
    jobDescription: description,
    tasks: tasks,
    applicationDeadline: finalDeadline,
    language: language,
    specialty: specialty,
  };

  return jobObject;
}

function combineSplitWords(input: string): string {
  let result: string = "";
  let i: number = 0;

  while (i < input.length) {
    let char: string = input[i];

    if (char === "-" && (input[i + 1] === " " || input[i + 1] === "\n")) {
      i += 2;
      while (input[i] === " " || input[i] === "\n") {
        i++;
      }
    } else {
      result += char;
      i++;
    }
  }

  return result;
}

function removeSections(input: string): string {
  let result: string = "";
  let i: number = 0;
  let len: number = input.length;

  while (i < len) {
    // Look for the start of the section: \r\n someword:
    if (input[i] === "\r" && input[i + 1] === "\n") {
      let start: number = i;
      let sectionEnd: number = -1;

      // We need to find where the section ends
      let symbolFound: boolean = false;
      let consecutiveNewlines: number = 0;

      // Skip the \r\n part (start of the section)
      i += 2;

      // Now, capture the someword: (up to 3 words before the colon)
      let words: number = 0;
      let hasColon: boolean = false;

      while (i < len && words < 4) {
        // If we encounter a space or colon, consider the word complete
        if (input[i] === " " || input[i] === ":") {
          if (input[i] === ":") {
            hasColon = true;
            break; // End the word parsing when colon is found
          }
          words++;
        }
        i++;
      }

      // Ensure we found a valid 'someword:'
      if (hasColon) {
        // Skip the colon
        i++;
      } else {
        result += input.substring(start, i);
        continue; // Move to the next character if it's not a valid section start
      }
      let localCounter: number = 0;
      // Now, check for the symbol TEXT \r\n lines
      while (i < len) {
        localCounter++;
        if (!symbolFound && localCounter > 7) {
          break;
        }
        // Check for the symbols (-, , •) with text
        if (input[i] === "\r" && input[i + 1] === "\n") {
          consecutiveNewlines++;

          // If we encounter 3 consecutive \r\n (no symbol), we end the section
          if (consecutiveNewlines === 3) {
            sectionEnd = i; // Skip the \r\n that ends the section
            break;
          }
        } else if (input[i] === "-" || input[i] === "" || input[i] === "•") {
          symbolFound = true;
          consecutiveNewlines = 0; // Reset the newline counter after encountering a symbol
        }

        i++; // Continue iterating
      }

      // Add the part of the string before the section (if the section was removed)
      if (sectionEnd === -1) {
        result += input.substring(start, i);
      }
    } else {
      result += input[i]; // Otherwise, just add the character to the result
      i++;
    }
  }

  return result;
}
