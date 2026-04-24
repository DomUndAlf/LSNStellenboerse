import { scrape, IScrapeResult } from "./scraper";
import { extractJobDetails, JobResponse } from "./extractDetails";
import axios, { AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { httpStatus } from "../../Shared/httpStatus";
import { IEmployer } from "../../Shared/interfaces";
import { extractBerufungsportalPdfUrl } from "./embeddedScraper";
import { extractJobFromPdf } from "./pdfService";
import * as cheerio from "cheerio";

/**
 * Minimum character length for a job description to be considered valid.
 */
const MIN_DESCRIPTION_LENGTH: number = 100;

/**
 * Generic/invalid job titles that indicate an overview page rather than a specific job posting.
 */
const INVALID_JOB_TITLES: string[] = [
  "professuren",
  "stellenangebote",
  "stellenausschreibungen",
  "karriere",
  "jobs",
  "offene stellen",
  "vakanzen",
  "job offers",
  "career",
  "vacancies",
  "open positions",
];

/**
 * Validates if the extracted job details represent a valid, complete job posting.
 * A valid job must have either a meaningful description or tasks, and must not have a generic title.
 * 
 * @param jobDetails - The extracted job details to validate
 * @returns true if the job is valid, false otherwise
 */
export function isValidJobPosting(jobDetails: JobResponse): boolean {
  // Check for generic/invalid titles that indicate an overview page
  const titleLower: string = (jobDetails.jobTitle || "").toLowerCase().trim();
  
  if (INVALID_JOB_TITLES.some(function (invalidTitle: string): boolean {
    return titleLower === invalidTitle || titleLower.startsWith(invalidTitle + " ");
  })) {
    console.warn(`Invalid job title detected (overview page): "${jobDetails.jobTitle}"`);
    return false;
  }

  // Check if job has meaningful content (description OR tasks)
  const hasDescription: boolean = 
    jobDetails.jobDescription !== undefined && 
    jobDetails.jobDescription !== null && 
    jobDetails.jobDescription.trim().length >= MIN_DESCRIPTION_LENGTH;
  
  const hasTasks: boolean = 
    jobDetails.tasks !== undefined && 
    jobDetails.tasks !== null && 
    Array.isArray(jobDetails.tasks) && 
    jobDetails.tasks.length > 0 &&
    jobDetails.tasks.some(function (task: string): boolean {
      return task.trim().length > 10;
    });

  if (!hasDescription && !hasTasks) {
    console.warn(`Job has no meaningful content - Description length: ${jobDetails.jobDescription?.length || 0}, Tasks: ${jobDetails.tasks?.length || 0}`);
    return false;
  }

  return true;
}

/**
 * Extracts job details from a website and saves or updates them in a database.
 *
 * This function takes a URL and a website ID, performs web scraping on the page, extracts job details
 * (job title, job description, tasks, application deadline, and language), retrieves the employer ID
 * and location ID associated with the website ID, and saves or updates the job details in the database.
 *
 * If the job is successfully saved or updated, a success message is logged to the console.
 * Additionally, a validation email is sent to the specified address.
 *
 * @param URL The URL of the webpage from which the job listing should be extracted.
 * @param websiteId The ID of the website where the job listing was published.
 * @returns Does not return a value. Logs errors to the console if any issues occur.
 */

export async function aiExtractor(URL: string, websiteId: number, employerId: number) {
  let employer: IEmployer;
  try {
    const EMPLOYER_RESPONSE: AxiosResponse<IEmployer> = await axios.get(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}`,
    );
    employer = EMPLOYER_RESPONSE.data;
  } catch (err) {
    throw new Error(`Error getting Employer ID: ${err.message}`);
  }

  // For Berufungsportal URLs, extract the embedded PDF and process it
  // The PDF URL is embedded in the raw HTML (Vaadin UIDL JSON), no Selenium needed
  // IMPORTANT: The PDF URL is dynamically generated and requires session cookies to download
  if (URL.includes("berufungsportal.uni-jena.de")) {
    console.log(`[Berufungsportal] Fetching page to extract PDF URL: ${URL}`);
    
    // Create a session with cookie jar to maintain session across requests
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    
    // Fetch the raw HTML
    let rawHtml: string;
    try {
      const response = await client.get(URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      rawHtml = response.data;
    } catch (err) {
      throw new Error(`Could not fetch Berufungsportal page: ${err.message}`);
    }
    
    // Extract PDF URL from the raw HTML (no JavaScript rendering needed)
    const pdfUrl = extractBerufungsportalPdfUrl(rawHtml, URL);
    
    if (!pdfUrl) {
      throw new Error(`Could not extract PDF URL from Berufungsportal page: ${URL}`);
    }
    
    // Download PDF using the same session (cookies required for dynamic PDF URL)
    console.log(`[Berufungsportal] Downloading PDF: ${pdfUrl}`);
    let pdfBuffer: Buffer;
    try {
      const pdfResponse = await client.get(pdfUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      pdfBuffer = Buffer.from(pdfResponse.data);
      console.log(`[Berufungsportal] PDF downloaded: ${pdfBuffer.length} bytes`);
    } catch (err) {
      throw new Error(`Could not download PDF from ${pdfUrl}: ${err.message}`);
    }
    
    // Extract text from PDF buffer
    const pdf = require("pdf-parse");
    let pdfText: string;
    try {
      const pdfData = await pdf(pdfBuffer);
      pdfText = pdfData.text.trim();
      console.log(`[Berufungsportal] Extracted ${pdfText.length} characters from PDF`);
    } catch (err) {
      throw new Error(`Could not parse PDF: ${err.message}`);
    }
    
    // Extract job details from PDF text
    const JOB_DETAILS: JobResponse = await extractJobFromPdf(pdfText);
    
    // Validate job before saving
    if (!isValidJobPosting(JOB_DETAILS)) {
      console.warn(`Skipping invalid job posting from PDF: ${pdfUrl}`);
      throw new Error(`Invalid job posting: Job has no meaningful content or has a generic title`);
    }
    
    // Save the job with the original berufungsportal URL (not the PDF URL)
    // Use employer's LocationID since extractJobFromPdf doesn't provide one
    let SAVE_UPDATE_RESPONSE: AxiosResponse<number>;
    try {
      SAVE_UPDATE_RESPONSE = await axios.post(
        `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/saveorupdate`,
        {
          EMP_ID: employer.EmployerID,
          LOCATION_ID: employer.LocationID,
          TITLE: JOB_DETAILS.jobTitle,
          DESCRIPTION: JOB_DETAILS.jobDescription,
          TASKS: JOB_DETAILS.tasks,
          APPLICATION_DEADLINE: JOB_DETAILS.applicationDeadline,
          WEBSITE_ID: websiteId,
          LANGUAGE: JOB_DETAILS.language,
          SPECIALTY: JOB_DETAILS.specialty,
        },
      );
      console.log("Job successfully saved from Berufungsportal PDF", SAVE_UPDATE_RESPONSE.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status == httpStatus.INTERNAL_SERVER_ERROR) {
        console.error("AI-Extractor Database error!");
      }
      throw new Error(`Error saving/updating job: ${err.message}`);
    }

    const jobid: number = SAVE_UPDATE_RESPONSE.data;
    try {
      await axios.post(`http://localhost:${process.env.VALIDATION_PORT}/validation/email/${jobid}`);
    } catch (err) {
      console.error("Error sending validation email:", err.message);
    }
    
    return;
  }

  // For HZDR Angebote page - multiple jobs on a single page separated by h2 elements
  // This page lists all job offers on one page, each job starts with an h2 heading
  // Only process the main page (pNid=3234), skip print pages (pNid=print) as they're single job views
  if (URL.includes("ContMan.Angebote.Liste") && URL.includes("pNid=3234")) {
    console.log(`[HZDR-Angebote] Multi-job page detected: ${URL}`);
    await extractMultiJobPage(URL, websiteId, employer);
    return;
  }
  
  // Skip HZDR Angebote print pages - these are single-job views that would duplicate the multi-job extraction
  if (URL.includes("ContMan.Angebote.Liste") && URL.includes("pNid=print")) {
    console.log(`[HZDR-Angebote] Skipping print page (already extracted from main page): ${URL}`);
    return;
  }

  // Standard extraction for non-SPA sites
  const WEBSITECONTENT: IScrapeResult = await scrape(URL);

  const JOB_DETAILS: JobResponse = await extractJobDetails(WEBSITECONTENT, employer.EmployerID);

  // Validate job before saving - skip if it's not a valid job posting
  if (!isValidJobPosting(JOB_DETAILS)) {
    console.warn(`Skipping invalid job posting from URL: ${URL}`);
    throw new Error(`Invalid job posting: Job has no meaningful content or has a generic title`);
  }

  let SAVE_UPDATE_RESPONSE: AxiosResponse<number>;
  try {
    SAVE_UPDATE_RESPONSE = await axios.post(
      `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/saveorupdate`,
      {
        EMP_ID: employer.EmployerID,
        LOCATION_ID: JOB_DETAILS.LocationID,
        TITLE: JOB_DETAILS.jobTitle,
        DESCRIPTION: JOB_DETAILS.jobDescription,
        TASKS: JOB_DETAILS.tasks,
        APPLICATION_DEADLINE: JOB_DETAILS.applicationDeadline,
        WEBSITE_ID: websiteId,
        LANGUAGE: JOB_DETAILS.language,
        SPECIALTY: JOB_DETAILS.specialty,
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
 * Extracts multiple jobs from a single page where jobs are separated by h2 elements.
 * Used for pages like HZDR Angebote that list all offers on one page.
 * 
 * @param url - The URL of the multi-job page
 * @param websiteId - The website ID for saving jobs
 * @param employer - The employer object
 */
async function extractMultiJobPage(url: string, websiteId: number, employer: IEmployer): Promise<void> {
  // Fetch the page
  let html: string;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    html = response.data;
  } catch (err) {
    throw new Error(`Could not fetch multi-job page: ${err.message}`);
  }

  const $ = cheerio.load(html);
  
  // Find all h2 elements that start job sections (they have id="BId{number}")
  const jobSections: { title: string; content: string; id: string }[] = [];
  
  $("h2[id^='BId']").each(function (this: any) {
    const h2 = $(this);
    const title = h2.text().trim();
    const id = h2.attr("id") || "";
    
    // Get all content until the next h2
    let content = "";
    let current = h2.next();
    
    while (current.length && !current.is("h2")) {
      content += current.text() + "\n";
      current = current.next();
    }
    
    jobSections.push({ title, content: content.trim(), id });
  });

  console.log(`[HZDR-Angebote] Found ${jobSections.length} job sections on page`);

  // Process each job section
  let savedCount = 0;
  for (const section of jobSections) {
    try {
      // Create HTML for this job section
      const jobHtml = `<!DOCTYPE html><html><body><h2>${section.title}</h2><div>${section.content}</div></body></html>`;
      
      // Create a proper IScrapeResult with Cheerio instance
      const jobCheerio = cheerio.load(jobHtml);
      const scrapeResult: IScrapeResult = {
        HTML: jobHtml,
        $: jobCheerio,
        ETAG: "",
      };
      
      // Extract job details using AI
      const jobDetails: JobResponse = await extractJobDetails(
        scrapeResult,
        employer.EmployerID
      );

      // Use the h2 title as the job title (more reliable)
      // Remove the ID suffix like "(Id 477)"
      const cleanTitle = section.title.replace(/\s*\(Id\s*\d+\)\s*$/, "").trim();
      if (cleanTitle) {
        jobDetails.jobTitle = cleanTitle;
      }

      // Skip if no meaningful content
      if (!jobDetails.jobDescription || jobDetails.jobDescription.length < 50) {
        console.warn(`[HZDR-Angebote] Skipping job with insufficient content: ${section.title}`);
        continue;
      }

      // Save the job
      const saveResponse = await axios.post(
        `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/saveorupdate`,
        {
          EMP_ID: employer.EmployerID,
          LOCATION_ID: employer.LocationID,
          TITLE: jobDetails.jobTitle,
          DESCRIPTION: jobDetails.jobDescription,
          TASKS: jobDetails.tasks || [],
          APPLICATION_DEADLINE: jobDetails.applicationDeadline,
          WEBSITE_ID: websiteId,
          LANGUAGE: jobDetails.language || "en",
          SPECIALTY: jobDetails.specialty || [],
        },
      );

      const jobId = saveResponse.data;
      console.log(`[HZDR-Angebote] Job saved: ${jobDetails.jobTitle} (ID: ${jobId})`);
      savedCount++;

      // Send validation email
      try {
        await axios.post(`http://localhost:${process.env.VALIDATION_PORT}/validation/email/${jobId}`);
      } catch (emailErr) {
        console.error(`Error sending validation email for job ${jobId}:`, emailErr.message);
      }
    } catch (err) {
      console.error(`[HZDR-Angebote] Error processing job section "${section.title}":`, err.message);
    }
  }

  console.log(`[HZDR-Angebote] Successfully saved ${savedCount} of ${jobSections.length} jobs`);
}
