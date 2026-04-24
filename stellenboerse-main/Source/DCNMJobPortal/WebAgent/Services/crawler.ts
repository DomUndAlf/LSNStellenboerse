import axios, { AxiosError, AxiosResponse } from "axios";
import * as cheerio from "cheerio";

/**
 * Network error codes that indicate a transient failure worth retrying.
 */
const RETRYABLE_ERROR_CODES: Set<string> = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "EHOSTUNREACH",
]);

/**
 * Checks if an error is a retryable network error.
 */
function isRetryableError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const code = error.code;
    if (code && RETRYABLE_ERROR_CODES.has(code)) {
      return true;
    }
    // Also retry on 429 (Too Many Requests) and 503 (Service Unavailable)
    const status = error.response?.status;
    if (status === 429 || status === 503) {
      return true;
    }
  }
  return false;
}

/**
 * Delay helper for retry backoff.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a URL with retry logic for transient errors.
 */
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<AxiosResponse<string>> {
  const INITIAL_DELAY_MS = 2000; // Start with 2s for rate limiting
  
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get<string>(url);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries && isRetryableError(error)) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const code = axios.isAxiosError(error) ? error.code : 'unknown';
        console.log(`Retryable error (${status || code}) for ${url}, retry ${attempt + 1}/${maxRetries} in ${delayMs}ms`);
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

/**
 * Extracts all URLs from the page.
 * @param {string} orgUrl - The URL of the organization's page.
 * @returns {Promise<string[]>} A promise that resolves to an array of URLs.
 */
export async function getJobUrls(orgUrl: string): Promise<string[]> {
  try {
    const RESPONSE: AxiosResponse<string> = await fetchWithRetry(orgUrl);
    const HTML: string = RESPONSE.data;
    const $: cheerio.CheerioAPI = cheerio.load(HTML) as cheerio.CheerioAPI;

    const ALL_URLS: string[] = [];

    $("a").each(function (_: number, element: cheerio.Element): void {
      const HREF: string | undefined = $(element).attr("href");
      if (HREF) {
        ALL_URLS.push(HREF);
      }
    });

    $("[onclick]").each(function (_: number, element: cheerio.Element): void {
      const ONCLICK: string | undefined = $(element).attr("onclick");
      const MATCH: RegExpMatchArray | null = ONCLICK
        ? ONCLICK.match(/window\.open\(['"]([^'"]+)['"]/)
        : null;
      if (MATCH && MATCH[1]) {
        ALL_URLS.push(MATCH[1]);
      }
    });

    // Extract URLs from JSON/JavaScript embedded data (e.g., Remix, Next.js, React apps)
    // Look for patterns like "detailsUrl":"/path/to/job" or "link":"/path/to/page"
    const JSON_URL_PATTERNS: RegExp[] = [
      /"detailsUrl"\s*:\s*"([^"]+)"/g,
      /"url"\s*:\s*"(\/[^"]+)"/g,
      /"link"\s*:\s*"(\/[^"]+)"/g,
      /"href"\s*:\s*"(\/[^"]+)"/g,
    ];

    for (const pattern of JSON_URL_PATTERNS) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(HTML)) !== null) {
        if (match[1] && match[1].startsWith("/")) {
          ALL_URLS.push(match[1]);
        }
      }
    }

    return ALL_URLS;
  } catch (error) {
    console.error(`Error extracting URLs from ${orgUrl}:`, error);
    return [];
  }
}
