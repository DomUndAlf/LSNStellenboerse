import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import { httpStatus } from "../../Shared/httpStatus";

wrapper(axios);

const USER_AGENT_HEADER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Delay helper for retry backoff.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if an error is retryable (429 or 503).
 */
function isRetryableStatus(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return status === 429 || status === 503;
  }
  return false;
}

export interface IScrapeResult {
  HTML: string;
  $: cheerio.CheerioAPI;
  ETAG: string;
}

/**
 * Checks the robots.txt file of a given URL to determine if crawling is allowed.
 *
 * @param {string} URL_LINK - The URL to check against the robots.txt file.
 * @returns {Promise<boolean>} - A promise that resolves to true if crawling is allowed, false otherwise.
 */
async function checkRobotsTxt(URL_LINK: string, jar: CookieJar): Promise<boolean> {
  const BASEURL: string = new URL(URL_LINK).origin;
  const ROBOTSTXTURL: string = `${BASEURL}/robots.txt`;

  try {
    const CONFIG: AxiosRequestConfig = {
      responseType: "text",
      validateStatus: function (status: httpStatus) {
        return status === httpStatus.OK || status === httpStatus.NOT_FOUND;
      },
      withCredentials: true,
      headers: {
        "User-Agent": USER_AGENT_HEADER,
      },
    };

    (CONFIG as unknown as { jar: CookieJar }).jar = jar;

    const RESPONSE: AxiosResponse<string> = await axios.get(ROBOTSTXTURL, CONFIG);

    if (RESPONSE.status === httpStatus.NOT_FOUND) {
      return true;
    }

    const ROBOTSTXTCONTENT: string = RESPONSE.data;
    const USER_AGENT: string = "User-agent: *";
    const DISALLOW: string = "Disallow:";
    const LINES: string[] = ROBOTSTXTCONTENT.split("\n");

    let isUserAgentSection: boolean = false;
    for (let line of LINES) {
      line = line.trim();

      if (line.startsWith("User-agent:")) {
        isUserAgentSection = line === USER_AGENT;
      } else if (isUserAgentSection) {
        if (line.startsWith("User-agent:") || line === "") {
          isUserAgentSection = false;
        } else if (line.startsWith(DISALLOW)) {
          const DISALLOWED_PATH: string = line.split(":")[1].trim();
          if (DISALLOWED_PATH && URL_LINK.includes(DISALLOWED_PATH)) {
            return false;
          }
        }
      }
    }
    return true;
  } catch (error) {
    const MESSAGE: string = error instanceof Error ? error.message : String(error);
    console.error("Error trying to read robots.txt", MESSAGE);
    return false;
  }
}

/**
 * Scrapes a given URL for its HTML content, cheerio root, and ETag.
 *
 * @param {string} URL_LINK - The URL to scrape.
 * @returns {Promise<IScrapeResult>} - A promise that resolves to an object containing the HTML, cheerio root, and ETag.
 * @throws Will throw an error if the robots.txt does not allow access or if the URL cannot be fetched.
 */
export async function scrape(URL_LINK: string): Promise<IScrapeResult> {
  const COOKIE_JAR: CookieJar = new CookieJar();
  const MAX_RETRIES = 3;
  const INITIAL_DELAY_MS = 3000;

  if (await checkRobotsTxt(URL_LINK, COOKIE_JAR)) {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const CONFIG: AxiosRequestConfig = {
          responseType: "text",
          validateStatus: function (status: httpStatus) {
            return status == httpStatus.OK;
          },
          withCredentials: true,
          headers: {
            "User-Agent": USER_AGENT_HEADER,
          },
        };

        (CONFIG as unknown as { jar: CookieJar }).jar = COOKIE_JAR;

        const RESPONSE: AxiosResponse<string> = await axios.get(URL_LINK, CONFIG);
        const HTML: string = RESPONSE.data;
        const $: cheerio.CheerioAPI = cheerio.load(HTML);
        const ETAG: string = RESPONSE.headers["etag"] || "no E-Tag";
        return { HTML, $, ETAG };
      } catch (error) {
        lastError = error;
        
        if (attempt < MAX_RETRIES && isRetryableStatus(error)) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
          console.log(`Rate limited (${status}) for ${URL_LINK}, retry ${attempt + 1}/${MAX_RETRIES} in ${delayMs}ms`);
          await delay(delayMs);
        } else {
          const MESSAGE: string = error instanceof Error ? error.message : String(error);
          console.error(`Error trying to reach the website: ${URL_LINK}.`, MESSAGE);
          throw new Error(`Failed to fetch the URL: ${URL_LINK}`);
        }
      }
    }
    
    const MESSAGE: string = lastError instanceof Error ? lastError.message : String(lastError);
    console.error(`Error trying to reach the website: ${URL_LINK}.`, MESSAGE);
    throw new Error(`Failed to fetch the URL: ${URL_LINK}`);
  } else {
    console.log(`Robots.txt does not allow the access for ${URL_LINK}.`);
    throw new Error(`Robots.txt does not allow the access for ${URL_LINK}.`);
  }
}
