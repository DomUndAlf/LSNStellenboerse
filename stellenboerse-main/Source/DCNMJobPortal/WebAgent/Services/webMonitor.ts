import * as webMonitorUtils from "./webMonitorUtils";
import { IWebsite } from "../../Shared/interfaces";
import axios, { AxiosError, AxiosResponse } from "axios";
import { httpStatus } from "../../Shared/httpStatus";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let aiCount: number = 0;

/**
 * Executes Process Resource Check on each url sequentially
 * @param JOB_URLS - Array of job URLs to check.
 */
export function checkResourceParallel(JOB_URLS: string[], EMPLOYER_ID: number): void {
  const INITIAL_CHECKS: Promise<void>[] = JOB_URLS.map(async function (url: string): Promise<void> {
    await processResourceCheck(url, EMPLOYER_ID);
  });

  Promise.all(INITIAL_CHECKS)
    .then(function (): void {
      console.log("Initial check of all resources completed.");
    })
    .catch(function (error: Error): void {
      console.error("An error occurred during the initial resource checks:", error);
    });
}

/**
 * Executes Process Resource Check on each url sequentially
 * @param JOB_URLS - Array of job URLs to check.
 */
export async function checkResourceSequential(
  JOB_URLS: string[],
  employerId: number,
): Promise<void> {
  for (const URL of JOB_URLS) {
    try {
      await processResourceCheck(URL, employerId);
    } catch (err) {
      console.error(err);
    }
  }
}

/**
 * Initializes the checking of a single resource.
 * Retrieves first the website with given url.
 * If website exists in database, then compares it with the current url and updates it.
 * If not, then creates a new website
 * @param url
 */
export async function processResourceCheck(URL: string, EMPLOYER_ID: number): Promise<void> {
  try {
    const SAVED_WEBSITE: IWebsite | null = await webMonitorUtils.getWebsiteByJobUrl(URL);
    
    // Fetch HTML content via HTTP request
    // Note: Berufungsportal URLs are handled specially in verifyHtml and aiExtractor
    const RESPONSE: AxiosResponse = await webMonitorUtils.makeRequest(URL);
    const htmlContent: string = RESPONSE.data;

    // Skip HTML verification for PDF URLs - they don't contain HTML
    const contentType: string = (RESPONSE.headers?.["content-type"] ?? "").toLowerCase();
    const isPdf: boolean = isPdfUrl(URL) || contentType.includes("pdf");
    
    if (!isPdf && !(await webMonitorUtils.verifyHtml(htmlContent, URL))) {
      await webMonitorUtils.deleteJobByUrl(URL, EMPLOYER_ID);
      return;
    }

    const {
      websiteID: WEBSITE_ID,
      hasChanged: HAS_CHANGED,
    }: { websiteID: number; hasChanged: boolean } = SAVED_WEBSITE
      ? await updateWebsite(SAVED_WEBSITE, RESPONSE)
      : await createNewWebsite(URL, RESPONSE);

    if (
      HAS_CHANGED &&
      (process.env.MODE === "production" || aiCount < parseInt(process.env.AI_COUNT_LIMIT || "0"))
    ) {
      sendToExtraction(URL, WEBSITE_ID, EMPLOYER_ID);
    }
  } catch (ERR) {
    await handleRequestError(ERR, URL, EMPLOYER_ID);
  }
}

async function handleRequestError(
  ERR: unknown,
  URL: string,
  EMPLOYER_ID: number,
): Promise<void> {
  const STATUS: number | undefined = extractStatus(ERR);

  if (STATUS === httpStatus.FORBIDDEN || STATUS === httpStatus.NOT_FOUND || STATUS === httpStatus.GONE) {
    try {
      if (await webMonitorUtils.deleteJobByUrl(URL, EMPLOYER_ID)) {
        console.log(`Job deleted (HTTP ${STATUS}, Url: ${URL})`);
      }
    } catch (DELETE_ERR) {
      console.error(`Error deleting job for ${URL}:`, DELETE_ERR);
    }
  } else {
    const MESSAGE: string = buildRequestErrorMessage(URL, ERR);
    console.error(MESSAGE);
  }
}

async function createNewWebsite(
  URL: string,
  RESPONSE: AxiosResponse,
): Promise<{ websiteID: number; hasChanged: boolean }> {
  const WEBSITE_ID: number = await webMonitorUtils.createWebsite(URL, RESPONSE);
  return { websiteID: WEBSITE_ID, hasChanged: true };
}

async function updateWebsite(
  SAVED_WEBSITE: IWebsite,
  RESPONSE: AxiosResponse,
): Promise<{ websiteID: number; hasChanged: boolean }> {
  const HAS_CHANGED: boolean = await webMonitorUtils.compareAndUpdateWebsite(
    SAVED_WEBSITE,
    RESPONSE,
  );
  return { websiteID: SAVED_WEBSITE.WebsiteID, hasChanged: HAS_CHANGED };
}

/**
 * Checks if a URL likely points to a PDF file.
 * Handles both direct .pdf URLs and dynamic download URLs that serve PDFs.
 */
function isPdfUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  // Direct PDF links
  if (lowerUrl.endsWith(".pdf")) {
    return true;
  }
  // Dynamic download URLs that typically serve PDFs (e.g., wcms.itz.uni-halle.de/download.php)
  if (lowerUrl.includes("download.php") || lowerUrl.includes("/download?")) {
    return true;
  }
  return false;
}

function sendToExtraction(URL: string, WEBSITE_ID: number, EMPLOYER_ID: number): void {
  aiCount++;
  if (isPdfUrl(URL)) {
    webMonitorUtils
      .sendToExtractionPDF(URL, WEBSITE_ID, EMPLOYER_ID)
      .catch((err) => console.error(`PDF Extraction failed for ${URL}: ${err.message || err}`));
  } else {
    webMonitorUtils
      .sendToExtraction(URL, WEBSITE_ID, EMPLOYER_ID)
      .catch((err) => console.error(`Extraction failed for ${URL}: ${err.message || err}`));
  }
}

function extractStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return error.response.status;
    }
    if (typeof (error as AxiosError & { status?: number }).status === "number") {
      return (error as AxiosError & { status?: number }).status;
    }
  }

  if (typeof error === "object" && error !== null && "status" in error) {
    const STATUS_VALUE: unknown = (error as { status?: unknown }).status;
    if (typeof STATUS_VALUE === "number") {
      return STATUS_VALUE;
    }
  }

  return undefined;
}

function buildRequestErrorMessage(URL: string, error: unknown): string {
  if (axios.isAxiosError(error)) {
    const AXIOS_ERROR: AxiosError = error;

    if (AXIOS_ERROR.code === "ERR_FR_TOO_MANY_REDIRECTS") {
      return `Request failed for ${URL}: Too many redirects encountered.`;
    }

    // Prioritize HTTP status code over axios error code for better diagnostics
    if (AXIOS_ERROR.response) {
      const status = AXIOS_ERROR.response.status;
      if (status === 410) {
        return `Request failed for ${URL}: HTTP 410 Gone (job posting removed)`;
      }
      return `Request failed for ${URL}: HTTP ${status}`;
    }

    if (AXIOS_ERROR.code) {
      return `Request failed for ${URL}: ${AXIOS_ERROR.code}`;
    }

    if (AXIOS_ERROR.message) {
      return `Request failed for ${URL}: ${AXIOS_ERROR.message}`;
    }
  }

  if (error instanceof Error) {
    return `Request failed for ${URL}: ${error.message}`;
  }

  return `Request failed for ${URL}: Unknown error`;
}
