import axios, { AxiosResponse } from "axios";
import { checkResourceParallel, checkResourceSequential } from "./webMonitor";
import { getJobUrls } from "./crawler";
import { IEmployer } from "../../Shared/interfaces";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const TRACKING_QUERY_PARAMETERS: string[] = ["sid"];

/**
 * b-ite career portal domains that use the /jobposting/{hash} format.
 * These URLs are extracted with a 41-char hash but the API expects 40 chars.
 */
const B_ITE_PORTAL_PATTERNS: string[] = [
  "b-ite.careers",
  "jobs.tu-chemnitz.de",
  "jobs.iwh-halle.de",
  "jobs.htwk-leipzig.de",
  "stellen.hgb-leipzig.de",
  "stelle.pro",
  "jobs.uni-jena.de",
  "karriere.h2.de",
  "jobs.mpikg.mpg.de",
];

/**
 * Normalizes a URL by parsing and re-serializing it.
 * This ensures consistent formatting (e.g., "domain?query" becomes "domain/?query").
 * Also removes duplicate slashes in the path (e.g., "/de//job" becomes "/de/job").
 * @param url - The URL to normalize.
 * @returns The normalized URL.
 */
export function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Remove duplicate slashes from path (e.g., /de//job -> /de/job)
    // This handles websites that accidentally generate URLs with double slashes
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/\/+/g, "/");
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

/**
 * Normalizes b-ite.careers job URLs by removing the trailing "0" from the hash.
 * These URLs are extracted with a 41-char hash but the API expects 40 chars.
 * Example: /jobposting/abc123...0 -> /jobposting/abc123...
 * Also applies standard URL normalization.
 * @param url - The URL to normalize.
 * @returns The normalized URL.
 */
export function normalizeBIteUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Remove duplicate slashes from path (e.g., /de//job -> /de/job)
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/\/+/g, "/");
    
    // Check if this is a b-ite portal jobposting URL
    const isBItePortal = B_ITE_PORTAL_PATTERNS.some(pattern => hostname.includes(pattern));
    
    if (isBItePortal && parsedUrl.pathname.includes("/jobposting/")) {
      // Match the hash part: /jobposting/{41-char-hex-ending-with-0}
      const HASH_PATTERN = /\/jobposting\/([a-f0-9]{40})0(\/?)$/i;
      const match = parsedUrl.pathname.match(HASH_PATTERN);
      
      if (match) {
        // Remove the trailing 0 from the hash
        parsedUrl.pathname = parsedUrl.pathname.replace(HASH_PATTERN, `/jobposting/${match[1]}${match[2]}`);
        return parsedUrl.toString();
      }
    }
    
    // Always return the parsed URL to ensure consistent formatting
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

/**
 * Deletes jobs from database that exist for the employer but are no longer in the current whitelist.
 * This removes "stale" jobs that are no longer advertised on the employer's website.
 * Also removes duplicate jobs (e.g., b-ite URLs with/without trailing 0).
 * @param EMPLOYER_ID - The ID of the employer
 * @param CURRENT_WHITELIST_URLS - Array of URLs currently in the whitelist
 */
async function cleanupStaleJobs(EMPLOYER_ID: number, CURRENT_WHITELIST_URLS: string[]): Promise<void> {
  try {
    console.log(`Starting stale job cleanup for employer ID: ${EMPLOYER_ID}`);
    
    // Fetch all jobs for this employer from the database
    const RESPONSE: AxiosResponse<Array<{ JobURL: string }>> = await axios.get(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/jobs/urls`
    );
    
    const DB_JOB_URLS: string[] = RESPONSE.data.map((job: { JobURL: string }) => job.JobURL);
    
    // Normalize whitelist URLs for comparison
    const NORMALIZED_WHITELIST: Set<string> = new Set(
      CURRENT_WHITELIST_URLS.map((url) => normalizeBIteUrl(url))
    );
    
    // Check if whitelist contains HZDR Angebote multi-job page
    const HAS_HZDR_ANGEBOTE_MULTIPAGE: boolean = CURRENT_WHITELIST_URLS.some(
      (url) => url.includes("ContMan.Angebote.Liste") && url.includes("pNid=3234")
    );
    
    // Group DB URLs by their normalized version to detect duplicates
    const NORMALIZED_TO_ORIGINALS: Map<string, string[]> = new Map();
    
    for (const URL of DB_JOB_URLS) {
      const NORMALIZED = normalizeBIteUrl(URL);
      if (!NORMALIZED_TO_ORIGINALS.has(NORMALIZED)) {
        NORMALIZED_TO_ORIGINALS.set(NORMALIZED, []);
      }
      NORMALIZED_TO_ORIGINALS.get(NORMALIZED)!.push(URL);
    }
    
    const URLS_TO_DELETE: string[] = [];
    
    for (const [NORMALIZED, ORIGINALS] of NORMALIZED_TO_ORIGINALS) {
      // Check if this is a stale job (not in whitelist)
      if (!NORMALIZED_WHITELIST.has(NORMALIZED)) {
        // Special case: HZDR Angebote multi-job page - jobs extracted from this page 
        // may have different URLs (print pages, old format) but should not be deleted
        // if the multi-job page is in the whitelist
        if (HAS_HZDR_ANGEBOTE_MULTIPAGE && ORIGINALS.some(url => url.includes("ContMan.Angebote.Liste"))) {
          console.log(`Keeping HZDR Angebote job (multi-job page in whitelist): ${NORMALIZED}`);
          continue;
        }
        
        // Delete all versions of this URL
        URLS_TO_DELETE.push(...ORIGINALS);
        continue;
      }
      
      // If there are duplicates, keep only the normalized version
      if (ORIGINALS.length > 1) {
        console.log(`Found ${ORIGINALS.length} duplicate job URLs for normalized: ${NORMALIZED}`);
        for (const ORIGINAL of ORIGINALS) {
          // Keep the normalized version, delete the non-normalized ones
          if (ORIGINAL !== NORMALIZED) {
            console.log(`  Will delete non-normalized version: ${ORIGINAL}`);
            URLS_TO_DELETE.push(ORIGINAL);
          }
        }
      }
    }
    
    if (URLS_TO_DELETE.length === 0) {
      console.log(`No stale or duplicate jobs found for employer ID: ${EMPLOYER_ID}`);
      return;
    }
    
    console.log(`Found ${URLS_TO_DELETE.length} stale/duplicate job(s) for employer ID: ${EMPLOYER_ID}`);
    
    // Delete each stale/duplicate job
    for (const URL of URLS_TO_DELETE) {
      try {
        await axios.post(
          `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/urldelete`,
          { url: URL, employerId: EMPLOYER_ID }
        );
        console.log(`Deleted stale/duplicate job: ${URL}`);
      } catch (err) {
        console.error(`Failed to delete stale job ${URL}:`, err instanceof Error ? err.message : String(err));
      }
    }
    
    console.log(`Stale job cleanup completed for employer ID: ${EMPLOYER_ID}`);
  } catch (err) {
    console.error(`Error during stale job cleanup for employer ID ${EMPLOYER_ID}:`, err instanceof Error ? err.message : String(err));
  }
}

/**
 * Synchronizes the whitelist for embedded employers with the current embedded URLs.
 * - Adds new URLs found by the embedded scraper to the whitelist
 * - Removes URLs from the whitelist that are no longer found by the embedded scraper
 * - Removes embedded URLs from the blacklist if they were incorrectly classified before
 * @param EMPLOYER_ID - The ID of the employer.
 * @param CURRENT_EMBEDDED_URLS - Array of URLs currently found by the embedded scraper.
 */
async function syncEmbeddedWhitelist(EMPLOYER_ID: number, CURRENT_EMBEDDED_URLS: string[]): Promise<void> {
  try {
    console.log(`Syncing embedded whitelist for employer ID: ${EMPLOYER_ID}`);
    
    // If the embedded scraper found no URLs, do NOT clear the whitelist
    // This prevents data loss when the scraper fails to find the job container
    if (CURRENT_EMBEDDED_URLS.length === 0) {
      console.log(`Embedded scraper found no URLs for employer ID: ${EMPLOYER_ID}. Preserving existing whitelist.`);
      return;
    }
    
    // Fetch current whitelist and blacklist
    const [WHITELIST_RESPONSE, BLACKLIST_RESPONSE] = await Promise.all([
      axios.get<string[]>(`http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`),
      axios.get<string[]>(`http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/blacklist`)
    ]);
    
    const CURRENT_WHITELIST: string[] = WHITELIST_RESPONSE.data || [];
    const CURRENT_BLACKLIST: string[] = BLACKLIST_RESPONSE.data || [];
    
    // Normalize URLs for comparison
    const NORMALIZED_WHITELIST: Set<string> = new Set(
      CURRENT_WHITELIST.map((url) => normalizeBIteUrl(url))
    );
    const NORMALIZED_BLACKLIST: Set<string> = new Set(
      CURRENT_BLACKLIST.map((url) => normalizeBIteUrl(url))
    );
    const NORMALIZED_EMBEDDED: Set<string> = new Set(
      CURRENT_EMBEDDED_URLS.map((url) => normalizeBIteUrl(url))
    );
    
    // Find URLs that need to be added to the whitelist
    const NEW_WHITELIST_URLS: string[] = CURRENT_EMBEDDED_URLS.filter((embeddedUrl) => {
      const NORMALIZED = normalizeBIteUrl(embeddedUrl);
      return !NORMALIZED_WHITELIST.has(NORMALIZED);
    });
    
    // Find URLs that are in the blacklist but should be in the whitelist
    // These need to be removed from blacklist first
    const BLACKLIST_TO_REMOVE: string[] = CURRENT_BLACKLIST.filter((blacklistUrl) => {
      const NORMALIZED = normalizeBIteUrl(blacklistUrl);
      return NORMALIZED_EMBEDDED.has(NORMALIZED);
    });
    
    // Remove URLs from blacklist that were found by embedded scraper
    if (BLACKLIST_TO_REMOVE.length > 0) {
      console.log(`Removing ${BLACKLIST_TO_REMOVE.length} embedded URL(s) from blacklist for employer ID: ${EMPLOYER_ID}`);
      for (const URL of BLACKLIST_TO_REMOVE) {
        try {
          await axios.delete(
            `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/blacklist`,
            { data: { url: URL } }
          );
        } catch (err) {
          console.error(`Failed to remove URL from blacklist:`, err instanceof Error ? err.message : String(err));
        }
      }
    }
    
    // Add new URLs to whitelist
    if (NEW_WHITELIST_URLS.length > 0) {
      console.log(`Adding ${NEW_WHITELIST_URLS.length} new embedded URL(s) to whitelist for employer ID: ${EMPLOYER_ID}`);
      for (const URL of NEW_WHITELIST_URLS) {
        try {
          await axios.put(
            `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
            { urls: [...CURRENT_WHITELIST, URL] }
          );
          // Update current whitelist for subsequent iterations
          CURRENT_WHITELIST.push(URL);
        } catch (err) {
          console.error(`Failed to add URL to whitelist:`, err instanceof Error ? err.message : String(err));
        }
      }
    }
    
    // Find whitelist URLs that are no longer in the embedded scrape results
    const STALE_WHITELIST_URLS: string[] = CURRENT_WHITELIST.filter((whitelistUrl) => {
      const NORMALIZED = normalizeBIteUrl(whitelistUrl);
      return !NORMALIZED_EMBEDDED.has(NORMALIZED);
    });
    
    if (STALE_WHITELIST_URLS.length > 0) {
      console.log(`Removing ${STALE_WHITELIST_URLS.length} stale URL(s) from whitelist for employer ID: ${EMPLOYER_ID}`);
      
      // Remove each stale URL from whitelist
      for (const URL of STALE_WHITELIST_URLS) {
        try {
          await axios.delete(
            `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
            { data: { url: URL } }
          );
        } catch (err) {
          console.error(`Failed to remove stale URL from whitelist:`, err instanceof Error ? err.message : String(err));
        }
      }
    }
    
    console.log(`Embedded whitelist sync completed for employer ID: ${EMPLOYER_ID}`);
  } catch (err) {
    console.error(`Error syncing embedded whitelist for employer ID ${EMPLOYER_ID}:`, err instanceof Error ? err.message : String(err));
  }
}

/**
 * Synchronizes the whitelist with URLs currently found on the employer's website.
 * Removes URLs from the whitelist that are no longer present on the website.
 * This ensures stale job postings are properly detected and cleaned up.
 * @param EMPLOYER_ID - The ID of the employer.
 * @param FOUND_URLS - Array of URLs currently found on the employer's website.
 */
async function syncWhitelistWithFoundUrls(EMPLOYER_ID: number, FOUND_URLS: string[]): Promise<void> {
  try {
    // Fetch current whitelist
    const RESPONSE: AxiosResponse<string[]> = await axios.get(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`
    );
    
    const CURRENT_WHITELIST: string[] = RESPONSE.data || [];
    
    if (CURRENT_WHITELIST.length === 0) {
      return;
    }
    
    // Normalize URLs for comparison
    const NORMALIZED_FOUND: Set<string> = new Set(
      FOUND_URLS.map((url) => normalizeBIteUrl(url.toLowerCase()))
    );
    
    // Find whitelist URLs that are no longer found on the website
    const STALE_WHITELIST_URLS: string[] = CURRENT_WHITELIST.filter((whitelistUrl) => {
      const NORMALIZED = normalizeBIteUrl(whitelistUrl.toLowerCase());
      
      // NEVER remove multi-job page URLs (HZDR ContMan.Angebote.Liste) - these contain multiple jobs on one page
      if (whitelistUrl.includes("ContMan.Angebote.Liste") && whitelistUrl.includes("pNid=3234")) {
        console.log(`Preserving multi-job page URL: ${whitelistUrl}`);
        return false;
      }
      
      return !NORMALIZED_FOUND.has(NORMALIZED);
    });
    
    if (STALE_WHITELIST_URLS.length === 0) {
      return;
    }
    
    console.log(`Found ${STALE_WHITELIST_URLS.length} stale URL(s) in whitelist for employer ID: ${EMPLOYER_ID}`);
    
    // Remove each stale URL from whitelist
    for (const URL of STALE_WHITELIST_URLS) {
      try {
        await axios.delete(
          `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
          { data: { url: URL } }
        );
        console.log(`Removed stale URL from whitelist: ${URL}`);
      } catch (err) {
        console.error(`Failed to remove stale URL ${URL} from whitelist:`, err instanceof Error ? err.message : String(err));
      }
    }
  } catch (err) {
    console.error(`Error syncing whitelist for employer ID ${EMPLOYER_ID}:`, err instanceof Error ? err.message : String(err));
  }
}

/**
 * Updates the blacklist of the currently scraped employer with all main URLs from other employers.
 * @param EMPLOYER_ID - The ID of the employer to update the blacklist for.
 */
export async function updateEmployerBlacklistWithMainUrls(EMPLOYER_ID: number): Promise<void> {
  try {
    console.log(`Fetching all employers to update blacklist for employer ID: ${EMPLOYER_ID}`);
    const RESPONSE: AxiosResponse<IEmployer[]> = await axios.get<IEmployer[]>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers`,
    );

    const EMPLOYERS: IEmployer[] = RESPONSE.data;

    if (EMPLOYERS.length === 0) {
      console.log("No employers found in the database.");
      return;
    }

    const MAIN_URLS: string[] = EMPLOYERS.flatMap(function (emp: IEmployer): string[] {
      if (!emp.Website) return [];
      const NORMALIZED_URL: string = emp.Website.endsWith("/")
        ? emp.Website.slice(0, -1)
        : emp.Website;
      return [NORMALIZED_URL, `${NORMALIZED_URL}/`];
    });

    console.log(`Collected ${MAIN_URLS.length} URLs (with and without trailing slash).`);

    const BLACKLIST_RESPONSE: AxiosResponse<string[]> = await axios.get<string[]>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/blacklist`,
    );

    const CURRENT_BLACKLIST: Set<string> = new Set(BLACKLIST_RESPONSE.data || []);

    const URLS_TO_ADD: string[] = MAIN_URLS.filter(function (url: string): boolean {
      return !CURRENT_BLACKLIST.has(url);
    });

    if (URLS_TO_ADD.length > 0) {
      console.log(
        `Adding ${URLS_TO_ADD.length} new URLs to blacklist for employer ID: ${EMPLOYER_ID}`,
      );
      await updateBlacklist(EMPLOYER_ID, URLS_TO_ADD);
    } else {
      console.log(`Blacklist already up-to-date for employer ID: ${EMPLOYER_ID}`);
    }
  } catch (error) {
    console.error(`Error while updating blacklist for employer ID ${EMPLOYER_ID}:`, error.message);
  }
}

/**
 * Scrapes all employers, with an option to process job URLs sequentially or in parallel.
 * @param isParallel - Set to true to process job URLs in parallel.
 * @param isActive - only scrapes active employers
 */
export async function scrapeAllEmployers(
  isParallel: boolean = false,
  isActive: boolean = false,
): Promise<void> {
  let APIPath: string = "employers";
  if (isActive) {
    APIPath = "employers/active";
  }
  console.log("Crawler Controller has started for all employers!");

  try {
    console.log(`Attempting to fetch employers from DB on port ${process.env.DBSERVER_PORT}`);
    const RESPONSE: AxiosResponse<IEmployer[]> = await axios.get<IEmployer[]>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/${APIPath}`,
    );
    const EMPLOYERS: IEmployer[] = RESPONSE.data;
    console.log(`Employers fetched successfully. Total employers: ${EMPLOYERS.length}`);

    if (EMPLOYERS.length === 0) {
      console.log("No employers found in the database.");
      return;
    }

    for (let i: number = 0; i < EMPLOYERS.length; i++) {
      const EMPLOYER: IEmployer = EMPLOYERS[i];
      console.log(
        `Starting ${isParallel ? "parallel" : "serial"} scraping for employer: ${EMPLOYER.ShortName}`,
      );

      if (isParallel) {
        await parallelStart(EMPLOYER.EmployerID);
      } else {
        await serialStart(EMPLOYER.EmployerID);
      }
    }
  } catch (error) {
    console.error("An error occurred while scraping all employers:", error.message);
  }
}

/**
 * Fetches job URLs from the whitelist for a specific employer.
 * Normalizes all b-ite URLs to remove trailing '0' from hashes.
 * Updates the whitelist in the database if any URLs were normalized.
 * @param EMPLOYER_ID - The ID of the employer.
 * @returns A promise that resolves to an array of normalized job URLs.
 */
export async function fetchUrlsFromWhitelist(EMPLOYER_ID: number): Promise<string[]> {
  try {
    console.log(`Fetching URLs from whitelist for employer ID ${EMPLOYER_ID}`);
    const RESPONSE: AxiosResponse<string[]> = await axios.get<string[]>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
    );
    const RAW_URLS = RESPONSE.data || [];
    
    // Normalize all b-ite URLs to fix the trailing '0' issue
    const NORMALIZED_URLS = RAW_URLS.map((url) => normalizeBIteUrl(url));
    
    // Find URLs that were normalized and update the whitelist
    const URLS_TO_UPDATE: Array<{oldUrl: string, newUrl: string}> = [];
    for (let i = 0; i < RAW_URLS.length; i++) {
      if (RAW_URLS[i] !== NORMALIZED_URLS[i]) {
        URLS_TO_UPDATE.push({ oldUrl: RAW_URLS[i], newUrl: NORMALIZED_URLS[i] });
      }
    }
    
    // Update whitelist in database if any URLs were normalized
    if (URLS_TO_UPDATE.length > 0) {
      for (const { oldUrl, newUrl } of URLS_TO_UPDATE) {
        try {
          // Delete old URL from whitelist
          await axios.delete(
            `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
            { data: { url: oldUrl } }
          );
          // Add normalized URL to whitelist
          await axios.post(
            `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
            { url: newUrl }
          );
        } catch (updateErr) {
          console.error(`Failed to update whitelist URL ${oldUrl}:`, updateErr instanceof Error ? updateErr.message : String(updateErr));
        }
      }
    }
    
    return NORMALIZED_URLS;
  } catch (error) {
    console.error(`Error fetching whitelist URLs for employer ID ${EMPLOYER_ID}:`, error.message);
    return [];
  }
}

/**
 * Initializes and scrapes job postings for a single employer sequentially.
 * @param EMPLOYER_ID - The ID of the employer.
 */
export async function serialStart(EMPLOYER_ID: number): Promise<void> {
  try {
    console.log("Crawler Controller has started in serial mode for a single employer!");

    await updateEmployerBlacklistWithMainUrls(EMPLOYER_ID);

    console.log("Starting URL classification...");
    await fetchEmployerAndClassifyJobs(EMPLOYER_ID);

    const JOB_URLS: string[] = await fetchUrlsFromWhitelist(EMPLOYER_ID);

    if (JOB_URLS.length === 0) {
      console.log(`No job URLs found in whitelist for employer ID: ${EMPLOYER_ID}`);
      return;
    }

    console.log("Final job URLs ready for WebMonitor (serial):", JOB_URLS);
    await checkResourceSequential(JOB_URLS, EMPLOYER_ID);
    console.log("All resources were checked serially.");
    
    // Cleanup: Delete jobs that are no longer in the whitelist (stale jobs)
    await cleanupStaleJobs(EMPLOYER_ID, JOB_URLS);
  } catch (error) {
    console.error("Error in serialStart:", error.message);
    throw new Error(`Error in serialStart for employer ID: ${EMPLOYER_ID} - ${error.message}`);
  }
}

/**
 * Initializes and scrapes job postings for a single employer in parallel.
 * @param EMPLOYER_ID - The ID of the employer.
 */
export async function parallelStart(EMPLOYER_ID: number): Promise<void> {
  try {
    console.log("Crawler Controller has started in parallel mode for a single employer!");

    await updateEmployerBlacklistWithMainUrls(EMPLOYER_ID);

    console.log("Starting URL classification...");
    await fetchEmployerAndClassifyJobs(EMPLOYER_ID);

    const JOB_URLS: string[] = await fetchUrlsFromWhitelist(EMPLOYER_ID);

    if (JOB_URLS.length === 0) {
      console.log(`No job URLs found in whitelist for employer ID: ${EMPLOYER_ID}`);
      return;
    }

    console.log("Final job URLs ready for WebMonitor (parallel):", JOB_URLS);
    checkResourceParallel(JOB_URLS, EMPLOYER_ID);
    console.log("Parallel resource check initiated.");
    
    // Cleanup: Delete jobs that are no longer in the whitelist (stale jobs)
    await cleanupStaleJobs(EMPLOYER_ID, JOB_URLS);
  } catch (error) {
    console.error("Error in parallelStart:", error.message);
    throw new Error(`Error in parallelStart for employer ID: ${EMPLOYER_ID} - ${error.message}`);
  }
}

/**
 * Fetches employer data, extracts and classifies job URLs, and filters them against the blacklist and whitelist.
 * @param EMPLOYER_ID - The ID of the employer.
 * @returns A promise that resolves to an array of classified job URLs.
 */
export async function fetchEmployerAndClassifyJobs(EMPLOYER_ID: number): Promise<string[]> {
  let employer: IEmployer | null;

  try {
    console.log(`Fetching data for employer ID ${EMPLOYER_ID} from DB`);
    const RESPONSE: AxiosResponse<IEmployer> = await axios.get<IEmployer>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}`,
    );
    employer = RESPONSE.data;
    console.log(`Employer data fetched: ${employer.ShortName}`);
  } catch (error) {
    console.error(`Error fetching employer ${EMPLOYER_ID}:`, error.message);
    throw error;
  }

  if (employer && employer.Website) {
    console.log(`Extracting job URLs from employer website: ${employer.Website}`);

    const RAW_URLS: string[] = await getJobUrls(employer.Website);

    if (employer.isEmbedded) {
      console.log(`Employer ${employer.ShortName} is marked as embedded. Fetching job URLs.`);

      const RESPONSE: Response = await fetch(
        `http://localhost:${process.env.AI_PORT}/aiAgent/embedded/scrape`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website: employer.Website }),
        },
      );

      if (!RESPONSE.ok) {
        console.error(`Failed to fetch embedded job URLs for ${employer.ShortName}`);
        return;
      }

      const { data: EMBEDDED_URLS } = await RESPONSE.json();
      RAW_URLS.push(...EMBEDDED_URLS);

      // For embedded employers, sync the whitelist with current embedded URLs
      // This removes stale URLs that are no longer found by the embedded scraper
      await syncEmbeddedWhitelist(EMPLOYER_ID, EMBEDDED_URLS);
    }

    const ABSOLUTE_URLS: string[] = RAW_URLS.map(function (url: string) {
      return toAbsoluteUrl(url, employer.Website);
    });

    // Sync whitelist with currently found URLs on the website
    // This removes stale URLs that are no longer present on the employer's website
    await syncWhitelistWithFoundUrls(EMPLOYER_ID, ABSOLUTE_URLS);

    const FILTERED_URLS: string[] = await filterUrlsAgainstBlacklistAndWhitelist(
      EMPLOYER_ID,
      ABSOLUTE_URLS,
      employer.Website,
    );

    const UNIQUE_URLS: string[] = Array.from(new Set(FILTERED_URLS));

    const CLASSIFICATION_LIMIT: number = parseInt(process.env.CLASSIFICATION_LIMIT);
    const LIMITED_URLS: string[] = UNIQUE_URLS.slice(0, CLASSIFICATION_LIMIT);

    if (LIMITED_URLS.length === 0) {
      console.log(
        "All URLs are already classified in blacklist or whitelist. Skipping classification.",
      );
      return [];
    }

    console.log("Classifying filtered URLs...");
    const CLASSIFIED_URLS: AxiosResponse<{ JOB_URLS: string[]; OTHER_URLS: string[] }> = await axios.post(
      `http://localhost:${process.env.AI_PORT}/aiAgent/classify`,
      {
        urls: process.env.MODE === "production" ? UNIQUE_URLS : LIMITED_URLS,
        employerId: EMPLOYER_ID,
        skipEmbeddedScrape: employer.isEmbedded,
      },
    );

    return CLASSIFIED_URLS.data.JOB_URLS;
  } else {
    console.error(`Employer ${EMPLOYER_ID} not found or website not defined.`);
    return [];
  }
}

/**
 * Filters the list of URLs against blacklist and whitelist, excluding main URL variants.
 * @param employerId - The ID of the employer.
 * @param urls - The list of URLs to filter.
 * @param mainUrl - The main URL of the employer.
 * @returns A promise that resolves to the filtered list of URLs.
 */
export async function filterUrlsAgainstBlacklistAndWhitelist(
  employerId: number,
  urls: string[],
  mainUrl: string,
): Promise<string[]> {
  try {
    console.log(`Fetching blacklist and whitelist for employer ID ${employerId}`);

    const BLACKLIST_RESPONSE: AxiosResponse<string[]> = await axios.get<string[]>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}/blacklist`,
    );
    const WHITELIST_RESPONSE: AxiosResponse<string[]> = await axios.get<string[]>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}/whitelist`,
    );

    const BLACKLIST: Set<string> = new Set(BLACKLIST_RESPONSE.data || []);
    const WHITELIST: Set<string> = new Set(WHITELIST_RESPONSE.data || []);
    const COMBINED_SET: Set<string> = new Set([...BLACKLIST, ...WHITELIST]);

    console.log(`Total URLs before filtering: ${urls.length}`);
    console.log(
      `Blacklist contains ${BLACKLIST.size} URLs, Whitelist contains ${WHITELIST.size} URLs`,
    );

    const URL_VARIANTS: string[] = [
      mainUrl,
      mainUrl.replace("de=", "en="),
      mainUrl.replace("en=", "de="),
      `${mainUrl}&locale=de_DE`,
      `${mainUrl}&locale=en_US`,
    ];

    // Patterns that indicate pagination or listing pages (not individual job postings)
    const PAGINATION_PATTERNS: RegExp[] = [
      /[?&]start=\d+/i,           // ?start=0, ?start=20, etc.
      /[?&]page=\d+/i,            // ?page=1, ?page=2, etc.
      /[?&]offset=\d+/i,          // ?offset=0, ?offset=10, etc.
      /[?&]p=\d+$/i,              // ?p=1, ?p=2, etc. (only if it's the only/last param)
      /\/page\/\d+\/?$/i,         // /page/1/, /page/2/, etc.
      /\/seite\/\d+\/?$/i,        // /seite/1/, /seite/2/, etc. (German)
      /[?&]limit=\d+/i,           // ?limit=10, etc.
      /[?&]per_page=\d+/i,        // ?per_page=20, etc.
    ];

    const FILTERED_URLS: string[] = urls.filter(function (url: string): boolean {
      // Exclude main URL variants
      if (URL_VARIANTS.includes(url)) {
        return false;
      }

      // Exclude invalid URL patterns
      if (
        url.includes("@") ||
        url.startsWith("javascript:") ||
        url.startsWith("#") ||
        url.startsWith("mailto:") ||
        url.endsWith(".xml") ||
        url.includes("#")
      ) {
        return false;
      }

      // Exclude pagination/listing pages
      for (const PATTERN of PAGINATION_PATTERNS) {
        if (PATTERN.test(url)) {
          console.log(`Excluded pagination URL: ${url}`);
          return false;
        }
      }

      // Exclude HZDR Angebote print pages (individual job views that duplicate multi-job page extraction)
      // These pages show single jobs from the main multi-job page, so we skip them to avoid duplicates
      if (url.includes("ContMan.Angebote.Liste") && url.includes("pNid=print")) {
        return false;
      }

      // Exclude HZDR invalid "pNid=no" URLs (appear on multiple HZDR pages)
      if (url.includes("hzdr.de") && url.includes("pNid=no")) {
        return false;
      }

      // Exclude HZDR info pages that are not job postings (pNid=1045 is "Duales Studium" info page)
      if (url.includes("hzdr.de") && url.match(/Cms\?pNid=\d+$/) && !url.includes("pOid=")) {
        return false;
      }

      return !COMBINED_SET.has(url);
    });

    console.log(
      `Filtered URLs not in blacklist or whitelist and excluding main URL variants: ${FILTERED_URLS.length}`,
    );
    return FILTERED_URLS;
  } catch (error) {
    console.error(
      `Error fetching blacklist and whitelist for employer ${employerId}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Updates the employer's blacklist with new URLs.
 * @param employerId - The ID of the employer.
 * @param urls - The list of URLs to add to the blacklist.
 */
export async function updateBlacklist(employerId: number, urls: string[]): Promise<void> {
  try {
    await axios.put(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}/blacklist`,
      { urls },
    );
    console.log(`Blacklist updated for employer ID ${employerId}.`);
  } catch (error) {
    console.error(`Error updating blacklist for employer ${employerId}:`, error.message);
  }
}

/**
 * Converts a relative URL to an absolute one based on the base URL.
 * Applies special handling only for the IPB Halle employer.
 * Also normalizes b-ite.careers URLs by removing trailing "0" from hashes.
 * @param url - The relative URL.
 * @param baseUrl - The base URL.
 * @returns The absolute URL.
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    if (baseUrl === "https://www.ipb-halle.de/karriere/stellenangebote/") {
      if (url.startsWith("karriere/stellenangebote/")) {
        const CORRECTED_URL: string = url.replace(/^karriere\/stellenangebote\//, "");
        const CORRECTED_ABSOLUTE_URL: URL = new URL(CORRECTED_URL, baseUrl);
        sanitizeUrl(CORRECTED_ABSOLUTE_URL);
        return normalizeBIteUrl(CORRECTED_ABSOLUTE_URL.toString());
      }
    }

    // Handle bav.bund.de URLs: SharedDocs paths should be resolved from root, not relative to current path
    // The website uses relative links like "SharedDocs/..." which should actually be "/SharedDocs/..."
    if (baseUrl.includes("bav.bund.de") && url.startsWith("SharedDocs/")) {
      const BASE_ORIGIN: string = new URL(baseUrl).origin;
      const ABSOLUTE_URL: URL = new URL("/" + url, BASE_ORIGIN);
      sanitizeUrl(ABSOLUTE_URL);
      return normalizeBIteUrl(ABSOLUTE_URL.toString());
    }

    const ABSOLUTE_URL: URL = new URL(url, baseUrl);
    sanitizeUrl(ABSOLUTE_URL);
    return normalizeBIteUrl(ABSOLUTE_URL.toString());
  } catch (error) {
    console.error(`Could not convert to absolute URL: ${url}`, error.message);
    return url;
  }
}

function sanitizeUrl(url: URL): void {
  TRACKING_QUERY_PARAMETERS.forEach(function (parameter: string): void {
    url.searchParams.delete(parameter);
  });

  if (!url.searchParams.toString()) {
    url.search = "";
  }
}
