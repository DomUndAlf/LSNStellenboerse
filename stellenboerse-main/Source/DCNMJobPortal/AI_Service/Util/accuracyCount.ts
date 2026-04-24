import { getAllFiles, loadSavedHTML, loadExpectedResult } from "./fileUtils";
import { IScrapeResult } from "../Services/scraper";
import { extractJobDetails, JobResponse } from "../Services/extractDetails";
import { parseDate, ExpectedResult, ExtractionAttributs } from "../../Shared/aiHelpers";
import { setMockedDate } from "../../Shared/dateUtils";
import path from "path";
import fs from "fs";
import { extractJobFromPdf } from "../Services/pdfService";

const DISABLE_PDF_RESULT: boolean = false;
const DISABLE_HTML_RESULT: boolean = false;
const ATTRIBUTE_ONLY: boolean = false;
const DESCRIPTIONSIMILARITY: boolean = true;
const ONLY_ONE_ORG: boolean = true;

type ExtractionResult = 0 | 1;
interface IExtractionData {
  [iteration: number]: {
    [organisation: string]: {
      [job: string]: {
        [extractedValue: string]: ExtractionResult;
      };
    };
  };
}

/**
 * Calculates the accuracy of job extraction results over a specified number of iterations.
 *
 * This function simulates multiple iterations of job extraction from stored files, evaluates the extracted data against expected results,
 * and calculates the accuracy of various attributes like job title, description, tasks, deadline, and language.
 * It generates a detailed extraction table summarizing the success rates and returns the total extraction accuracy percentage.
 *
 * @param iterations The number of iterations to run the accuracy evaluation process.
 * @return A Promise that resolves to a `number`, representing the total extraction accuracy percentage.
 *
 * The function performs the following steps:
 * 1. Sets a mocked date to ensure test consistency.
 * 2. Initializes a data structure to track success metrics for each iteration, organization, and job.
 * 3. Iterates over all files in a predefined directory (`./savedHTML`) and processes files based on their type (`.html` or `.txt`).
 * 4. Skips processing for disabled result types based on global flags (`DISABLE_PDF_RESULT`, `DISABLE_HTML_RESULT`).
 * 5. Loads the expected result data for each job file and compares it to the extracted result using various evaluation functions.
 * 6. Logs mismatches and errors for debugging and transparency.
 * 7. Prints a detailed extraction summary table and calculates the overall accuracy percentage.
 *
 * @throws An error if there is an issue reading the directory or processing files.
 *
 * Preconditions:
 * - The directory `./savedHTML` must exist and contain the necessary `.html` or `.txt` job files.
 * - Expected results for each job must be available in corresponding `.json` files.
 * - Global flags (`DISABLE_PDF_RESULT`, `DISABLE_HTML_RESULT`, `ATTRIBUTE_ONLY`) control processing behavior.
 *
 * Postconditions:
 * - Logs mismatched attributes for debugging.
 * - Prints a table summarizing extraction accuracy.
 * - Returns the total extraction accuracy as a percentage.
 */

export async function accuracyCount(iterations: number): Promise<number> {
  // change this date if you add new jobs, to ensure that the tests pass for the application deadline
  setMockedDate(new Date(Date.UTC(2024, 10, 9)));

  let SUCCESS_RESULT: IExtractionData = {};
  for (let i: number = 0; i < iterations; i++) {
    SUCCESS_RESULT[i] = {};
  }

  const DIRECTORY_PATH: string = path.resolve(__dirname, "./savedHTML");

  try {
    const FILES: string[] = getAllFiles(DIRECTORY_PATH);

    for (const FILE_PATH of FILES) {
      if (FILE_PATH.endsWith(".txt") && DISABLE_PDF_RESULT) {
        continue;
      }
      if (FILE_PATH.endsWith(".html") && DISABLE_HTML_RESULT) {
        continue;
      }

      if (!FILE_PATH.includes("Chemnitz") && ONLY_ONE_ORG) {
        continue;
      }

      let splitedPath: string[] = FILE_PATH.split(path.sep);
      let organisation: string = splitedPath[splitedPath.length - 2];
      let job: string = path.parse(splitedPath[splitedPath.length - 1]).name;
      try {
        const EXPECTED_RESULT: ExpectedResult = loadExpectedResult(FILE_PATH);
        if (!EXPECTED_RESULT) {
          console.log(`Erwartete Ergebnisse fehlen für Datei: ${FILE_PATH}`);
          continue;
        }
        for (let i: number = 0; i < iterations; i++) {
          SUCCESS_RESULT[i] = SUCCESS_RESULT[i] || {};
          SUCCESS_RESULT[i][organisation] = SUCCESS_RESULT[i][organisation] || {};
          SUCCESS_RESULT[i][organisation][job] = SUCCESS_RESULT[i][organisation][job] || {};
          try {
            let result: JobResponse;

            if (FILE_PATH.endsWith(".txt")) {
              let pdfFileContent: string = fs.readFileSync(FILE_PATH, "utf-8");
              result = await extractJobFromPdf(pdfFileContent);
            } else {
              const SCRAPE_RESULT: IScrapeResult = await loadSavedHTML(FILE_PATH);

              if (ATTRIBUTE_ONLY) {
                result = await extractJobDetails(SCRAPE_RESULT, 1, ExtractionAttributs.Description);
              } else {
                result = await extractJobDetails(SCRAPE_RESULT, 1);
              }
            }

            evaluateTitle(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
            evaluateDeadline(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
            evaluateDescription(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
            evaluateTask(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
            evaluateDate(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
            evaluateLanguage(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
            evaluateSpecialty(EXPECTED_RESULT, SUCCESS_RESULT, i, organisation, job, result);
          } catch {
            SUCCESS_RESULT[i][organisation][job]["jobTitle"] = 0;
            SUCCESS_RESULT[i][organisation][job]["jobDescription"] = 0;
            SUCCESS_RESULT[i][organisation][job]["Tasks"] = 0;
            SUCCESS_RESULT[i][organisation][job]["applicationDeadline"] = 0;
            SUCCESS_RESULT[i][organisation][job]["language"] = 0;
            SUCCESS_RESULT[i][organisation][job]["specialty"] = 0;
          }
        }
      } catch (error) {
        console.log(`Fehler bei der Verarbeitung von ${FILE_PATH}: ${error.message}`);
      }
    }

    printExtractionTable(SUCCESS_RESULT, [
      "jobTitle",
      "jobDescription",
      "Tasks",
      "applicationDeadline",
      "language",
      "specialty",
    ]);
    return getTotalExtractionPercentage(SUCCESS_RESULT);
  } catch (error) {
    console.error(`Fehler beim Lesen des Verzeichnisses: ${error.message}`);
    throw error;
  }
}

function evaluateDate(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  if (EXPECTED_RESULT.language === result.language) {
    successResult[i][organisation][job]["language"] = 1;
  } else {
    successResult[i][organisation][job]["language"] = 0;
    logMismatch(organisation, job, "language", EXPECTED_RESULT.language, result.language);
  }
}

function evaluateTitle(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  if (EXPECTED_RESULT.jobTitle === result.jobTitle) {
    successResult[i][organisation][job]["jobTitle"] = 1;
  } else {
    successResult[i][organisation][job]["jobTitle"] = 0;
    logMismatch(organisation, job, "jobTitle", EXPECTED_RESULT.jobTitle, result.jobTitle);
  }
}

function evaluateDescription(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  if (
    (EXPECTED_RESULT?.jobDescription === result?.jobDescription && !DESCRIPTIONSIMILARITY) ||
    (DESCRIPTIONSIMILARITY &&
      isSimilar(EXPECTED_RESULT?.jobDescription, result?.jobDescription, 0.7))
  ) {
    successResult[i][organisation][job]["jobDescription"] = 1;
  } else {
    successResult[i][organisation][job]["jobDescription"] = 0;
    logMismatch(
      organisation,
      job,
      "jobDescription",
      EXPECTED_RESULT?.jobDescription,
      result?.jobDescription,
    );
  }
}

function evaluateTask(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  if (
    Array.isArray(EXPECTED_RESULT?.jobTasks) &&
    Array.isArray(result?.tasks) &&
    EXPECTED_RESULT?.jobTasks.length === result?.tasks.length &&
    EXPECTED_RESULT?.jobTasks.every(function (task: string, index: number) {
      return task === result?.tasks[index];
    })
  ) {
    successResult[i][organisation][job]["Tasks"] = 1;
  } else {
    successResult[i][organisation][job]["Tasks"] = 0;
    logMismatch(
      organisation,
      job,
      "Tasks",
      JSON.stringify(EXPECTED_RESULT?.jobTasks),
      JSON.stringify(result?.tasks),
    );
  }
}

function evaluateLanguage(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  if (EXPECTED_RESULT.language === result.language) {
    successResult[i][organisation][job]["language"] = 1;
  } else {
    successResult[i][organisation][job]["language"] = 0;
    logMismatch(organisation, job, "language", EXPECTED_RESULT.language, result.language);
  }
}
function evaluateDeadline(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  const EXPECTED_DATE: Date | null = EXPECTED_RESULT.applicationDeadline
    ? parseDate(EXPECTED_RESULT.applicationDeadline)
    : null;
  const RESULT_DATE: Date | null = result.applicationDeadline ? result.applicationDeadline : null;

  if (!EXPECTED_DATE && !RESULT_DATE) {
    successResult[i][organisation][job]["applicationDeadline"] = 1;
  } else if (EXPECTED_DATE?.getTime() === RESULT_DATE?.getTime()) {
    successResult[i][organisation][job]["applicationDeadline"] = 1;
  } else {
    successResult[i][organisation][job]["applicationDeadline"] = 0;
    logMismatch(
      organisation,
      job,
      "applicationDeadline",
      EXPECTED_DATE?.toISOString().split("T")[0] || "null",
      RESULT_DATE?.toISOString().split("T")[0] || "null",
    );
  }
}

function evaluateSpecialty(
  EXPECTED_RESULT: ExpectedResult,
  successResult: IExtractionData,
  i: number,
  organisation: string,
  job: string,
  result: JobResponse,
) {
  if (
    Array.isArray(EXPECTED_RESULT?.specialty) &&
    Array.isArray(result?.specialty) &&
    arraysHaveSameElements(EXPECTED_RESULT.specialty, result.specialty)
  ) {
    successResult[i][organisation][job]["specialty"] = 1;
  } else {
    successResult[i][organisation][job]["specialty"] = 0;
    logMismatch(
      organisation,
      job,
      "specialty",
      JSON.stringify(EXPECTED_RESULT?.specialty),
      JSON.stringify(result?.specialty),
    );
  }
}

function arraysHaveSameElements(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;

  const SORTEDARRAY1: string[] = [...arr1].sort();
  const SORTEDARRAY2: string[] = [...arr2].sort();

  return SORTEDARRAY1.every(function (value: string, index: number) {
    return value === SORTEDARRAY2[index];
  });
}

function logMismatch(
  organisation: string,
  job: string,
  value: string,
  expected: string,
  actual: string,
) {
  console.log(`\x1b[33mBei Organisation:\x1b[0m ${organisation} \x1b[33mBeim Job:\x1b[0m ${job}`);
  console.log(`\x1b[36mErwarteter    ${value}:\x1b[0m ${expected}`);
  console.log(`\x1b[36mTatsächlicher ${value}:\x1b[0m ${actual}`);

  console.log("\x1b[31m%s\x1b[0m", "===========================");
}

function getJobExtractionPercentage(
  data: IExtractionData,
  iteration: number,
  organisation: string,
  job: string,
): number {
  const JOB_DATA: {
    [extractedValue: string]: ExtractionResult;
  } = data[iteration]?.[organisation]?.[job];
  if (!JOB_DATA) return 0;

  const TOTAL_VALUES: number = Object.keys(JOB_DATA).length;
  const CORRECT_VALUES: number = Object.values(JOB_DATA).filter(function (value: ExtractionResult) {
    return value === 1;
  }).length;

  return TOTAL_VALUES === 0 ? 0 : (CORRECT_VALUES / TOTAL_VALUES) * 100;
}

function getOrganisationExtractionPercentage(data: IExtractionData, organisation: string): number {
  let totalJobs: number = 0;
  let correctJobs: number = 0;

  for (const ITERATION in data) {
    const ORGANISATION_DATA: {
      [job: string]: {
        [extractedValue: string]: ExtractionResult;
      };
    } = data[ITERATION]?.[organisation];
    if (!ORGANISATION_DATA) continue;

    for (const JOB in ORGANISATION_DATA) {
      const JOB_PERCENTAGE: number = getJobExtractionPercentage(
        data,
        parseInt(ITERATION),
        organisation,
        JOB,
      );
      totalJobs++;
      if (JOB_PERCENTAGE === 100) correctJobs++;
    }
  }

  return totalJobs === 0 ? 0 : (correctJobs / totalJobs) * 100;
}

function getTotalExtractionPercentage(data: IExtractionData): number {
  let totalJobs: number = 0;
  let correctJobs: number = 0;

  for (const ITERATION in data) {
    for (const ORGANISATION in data[ITERATION]) {
      for (const JOB in data[ITERATION][ORGANISATION]) {
        const JOB_PERCENTAGE: number = getJobExtractionPercentage(
          data,
          parseInt(ITERATION),
          ORGANISATION,
          JOB,
        );
        totalJobs++;
        if (JOB_PERCENTAGE === 100) correctJobs++;
      }
    }
  }

  return totalJobs === 0 ? 0 : (correctJobs / totalJobs) * 100;
}

function getCorrectExtractedValuesPercentageForOrganisation(
  data: IExtractionData,
  organisation: string,
  extractedValue: string,
): number {
  let totalValues: number = 0;
  let correctValues: number = 0;

  for (const ITERATION in data) {
    const ORGANISATION_DATA: {
      [job: string]: {
        [extractedValue: string]: ExtractionResult;
      };
    } = data[ITERATION]?.[organisation];
    if (!ORGANISATION_DATA) continue;

    for (const JOB in ORGANISATION_DATA) {
      totalValues++;
      correctValues += ORGANISATION_DATA[JOB][extractedValue];
    }
  }

  return totalValues === 0 ? 0 : (correctValues / totalValues) * 100;
}

function getCorrectExtractedValuesPercentageTotal(
  data: IExtractionData,
  extractedValue: string,
): number {
  let totalValues: number = 0;
  let correctValues: number = 0;

  for (const ITERATION in data) {
    for (const ORGANISATION in data[ITERATION]) {
      for (const JOB in data[ITERATION][ORGANISATION]) {
        totalValues++;
        correctValues += data[ITERATION][ORGANISATION][JOB][extractedValue];
      }
    }
  }

  return totalValues === 0 ? 0 : (correctValues / totalValues) * 100;
}

function colorizePercentage(percentage: number, columnWidth: number): string {
  let paddedString: string = (percentage.toFixed(2) + "%").padEnd(columnWidth);
  if (percentage <= 30) {
    return `\x1b[31m${paddedString}\x1b[0m`; // Red
  } else if (percentage <= 90) {
    return `\x1b[33m${paddedString}\x1b[0m`; // Yellow
  } else {
    return `\x1b[32m${paddedString}\x1b[0m`; // Green
  }
}

function printExtractionTable(data: IExtractionData, extractedValues: string[]): void {
  const ORGANISATION_PRECENTAGES: { [organisation: string]: number } = {};

  for (const ORGANISATION in data[0]) {
    ORGANISATION_PRECENTAGES[ORGANISATION] = getOrganisationExtractionPercentage(
      data,
      ORGANISATION,
    );
  }

  const TOTAL_EXTRACTION_PERCENTAGE: number = getTotalExtractionPercentage(data);

  const COLUMN_WIDTH: 25 = 25;

  const HEADER: string[] = ["Organisation", "% Erfolgreich", ...extractedValues];
  console.log(
    HEADER.map(function (col: string) {
      return col.padEnd(COLUMN_WIDTH);
    }).join(""),
  );

  for (const ORGANISATION in ORGANISATION_PRECENTAGES) {
    const ROW: string[] = [
      ORGANISATION.padEnd(COLUMN_WIDTH),
      colorizePercentage(ORGANISATION_PRECENTAGES[ORGANISATION], COLUMN_WIDTH),
    ];

    for (const EXTRACTED_VALUE of extractedValues) {
      const CORRECT_PERCENTAGE: number = getCorrectExtractedValuesPercentageForOrganisation(
        data,
        ORGANISATION,
        EXTRACTED_VALUE,
      );
      ROW.push(colorizePercentage(CORRECT_PERCENTAGE, COLUMN_WIDTH));
    }

    console.log(ROW.join(""));
  }

  const TOTAL_ROW: string[] = [
    "Total".padEnd(COLUMN_WIDTH),
    colorizePercentage(TOTAL_EXTRACTION_PERCENTAGE, COLUMN_WIDTH),
  ];
  for (const EXTRACTED_VALUE of extractedValues) {
    const CORRECT_PERCENTAGE_TOTAL: number = getCorrectExtractedValuesPercentageTotal(
      data,
      EXTRACTED_VALUE,
    );
    TOTAL_ROW.push(colorizePercentage(CORRECT_PERCENTAGE_TOTAL, COLUMN_WIDTH));
  }

  console.log(TOTAL_ROW.join(""));
}

function isSimilar(string1: string, string2: string, amountOfSimilarity: number): boolean {
  let normalizedString1: string = normalizeString(string1);
  let normalizedString2: string = normalizeString(string2);

  let levenshteinDistance: number = getLevenshteinDistance(normalizedString1, normalizedString2);
  let maxLength: number = Math.max(normalizedString1.length, normalizedString2.length);

  if (maxLength === 0) return true;

  let similarity: number = 1 - levenshteinDistance / maxLength;
  return similarity >= amountOfSimilarity;
}

function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

function getLevenshteinDistance(a: string, b: string): number {
  let matrix: number[][] = Array.from({ length: a.length + 1 }, function () {
    return Array(b.length + 1).fill(0);
  });

  for (let i: number = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j: number = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i: number = 1; i <= a.length; i++) {
    for (let j: number = 1; j <= b.length; j++) {
      let cost: number = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}
