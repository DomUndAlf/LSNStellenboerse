import { Request, Response } from "express";
import * as service from "../Services/jobExtractor";
import * as pdfService from "../Services/pdfService";
import { httpStatus } from "../../Shared/httpStatus";
import { urlClassifier } from "../Services/urlClassification";
import { scrapeEmbeddedJobUrls } from "../Services/embeddedScraper";

/**
 * Controller to handle AI-based website extraction.
 *
 * This function extracts information from a website using the AI extractor service.
 * It expects a URL and a website ID in the request body. On success, it responds
 * with a success message and the URL. On failure, it returns an internal server error.
 *
 * @param req The HTTP request object, containing `URL` (string) and `websiteId` (number) in the body.
 * @param res The HTTP response object used to send the response.
 * @return A Promise that resolves to either a success response with a message and URL
 *         or an error response with details about the failure.
 */
export async function aiController(req: Request, res: Response): Promise<void | Response> {
  try {
    const URL: string = String(req.body.URL);
    const WEBSITE_ID: number = Number(req.body.websiteId);
    const EMPLOYER_ID: number = Number(req.body.employerId);
    await service.aiExtractor(URL, WEBSITE_ID, EMPLOYER_ID);

    return res.status(httpStatus.OK).json({
      message: "Website extracted successfully",
      URL: URL,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
      details: error.message || "An unknown error occurred",
    });
  }
}

/**
 * Controller to classify a list of URLs into job-related and other URLs.
 *
 * This function takes an array of URLs and an employer ID from the request body.
 * It uses the URL classifier service to categorize the URLs into `JOB_URLS` and `OTHER_URLS`.
 * The employer ID is mandatory for the classification to proceed. If it is missing,
 * the function responds with a bad request error. In case of success, it responds
 * with the categorized URLs. On failure, it returns an internal server error.
 *
 * @param req The HTTP request object, containing `urls` (array of strings) and `employerId` (number) in the body.
 * @param res The HTTP response object used to send the response.
 * @return A Promise that resolves to either a success response with categorized URLs
 *         or an error response with details about the failure.
 */
export async function classifyUrls(req: Request, res: Response): Promise<void | Response> {
  try {
    const URLS: string[] = req.body.urls as string[];
    const EMPLOYER_ID: number = req.body.employerId as number;
    const SKIP_EMBEDDED_SCRAPE: boolean = Boolean(req.body.skipEmbeddedScrape);

    if (!EMPLOYER_ID) {
      console.error("Employer ID is missing in the request.");
      return res.status(httpStatus.BAD_REQUEST).json({ error: "Employer ID is required" });
    }

    const { JOB_URLS, OTHER_URLS } = await urlClassifier(URLS, EMPLOYER_ID, {
      skipEmbeddedScrape: SKIP_EMBEDDED_SCRAPE,
    });

    return res.status(httpStatus.OK).json({ JOB_URLS, OTHER_URLS });
  } catch (error) {
    console.error("Error in classifyUrls:", error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
      details: error.message || "An unknown error occurred",
    });
  }
}

/**
 * Controller to process PDF-related requests.
 *
 * This function handles a PDF operation using the provided URL in the request body.
 * It invokes the PDF service to process the specified URL. On success, it sends an
 * HTTP 200 OK status. If an error occurs, it responds with an HTTP 500 Internal Server Error.
 *
 * @param req The HTTP request object, containing `url` (string) in the body.
 * @param res The HTTP response object used to send the response.
 * @return A Promise that resolves to an HTTP status code, indicating success or failure.
 */
export async function pdfController(req: Request, res: Response) {
  try {
    const URL: string = String(req.body.url);
    const WEBSITE_ID: number = Number(req.body.websiteId);
    const EMPLOYER_ID: number = Number(req.body.employerId);
    await pdfService.handlePdf(URL, WEBSITE_ID, EMPLOYER_ID);

    res.sendStatus(httpStatus.OK);
  } catch (error) {
    console.error(error);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Controller to scrape embedded job URLs.
 *
 * This function processes a request to scrape job URLs from an embedded job board.
 * It expects a `website` field in the request body. If the `website` field is missing,
 * it responds with a 400 Bad Request error. On success, it returns the extracted job URLs.
 * On failure, it responds with a 500 Internal Server Error.
 *
 * @param req The HTTP request object, containing `website` (string) in the body.
 * @param res The HTTP response object used to send the response.
 * @return A Promise that resolves to either a success response with extracted job URLs
 *         or an error response with details about the failure.
 */
export async function scrapeEmbedded(req: Request, res: Response) {
  try {
    const { website: WEBSITE } = req.body;

    if (!WEBSITE) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: "Website URL is required",
      });
    }

    console.log(`Scraping embedded job URLs for website: ${WEBSITE}`);

    const JOB_URLS: string[] = await scrapeEmbeddedJobUrls(WEBSITE);

    return res.status(httpStatus.OK).json({
      message: "Scraped embedded job URLs successfully",
      data: JOB_URLS,
    });
  } catch (error) {
    console.error("Error scraping embedded job URLs:", error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Failed to scrape embedded job URLs",
      details: error.message,
    });
  }
}
