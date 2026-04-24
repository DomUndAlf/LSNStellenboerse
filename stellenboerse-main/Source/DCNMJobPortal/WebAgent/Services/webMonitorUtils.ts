import { IWebsite, IEmployer } from "../../Shared/interfaces";
import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { httpStatus } from "../../Shared/httpStatus";
import { getJobUrls } from "./crawler";
import * as crypto from "crypto";
import * as cheerio from "cheerio";

wrapper(axios);

/**
 * Helper function to fetch employer and extract job URLs
 */
export async function getJobUrlsByEmployerId(EMPLOYER_ID: number): Promise<string[]> {
  let response: AxiosResponse<IEmployer> = await axios.get<IEmployer>(
    `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}`,
  );
  let employer: IEmployer = response.data;
  const JOB_URLS: string[] = await getJobUrls(employer.Website);
  return JOB_URLS;
}

export async function getWebsiteByJobUrl(url: string): Promise<IWebsite | null> {
  try {
    const RESPONSE: AxiosResponse<IWebsite> = await axios.put<IWebsite>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/websites/joburl`,
      {
        joburl: url,
      },
    );
    return RESPONSE.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status == httpStatus.NOT_FOUND) {
      return null;
    } else {
      throw new Error(`Internal Server Error`);
    }
  }
}

export async function sendToExtraction(
  key: string,
  websiteId: number,
  employerId: number,
): Promise<void> {
  await axios.post(`http://localhost:${process.env.AI_PORT}/aiAgent/extract`, {
    URL: key,
    websiteId: websiteId,
    employerId: employerId,
  });
}

export async function sendToExtractionPDF(
  key: string,
  websiteId: number,
  employerId: number,
): Promise<void> {
  await axios.post(`http://localhost:${process.env.AI_PORT}/aiAgent/pdf`, {
    url: key,
    websiteId: websiteId,
    employerId: employerId,
  });
}

export async function createWebsite(url: string, response: AxiosResponse): Promise<number> {
  const { hash: contentHash } = await computeStableContentHash(url, response.data);
  const responseEtag: string = parseEtag(response);
  const responseLastmodified: string = parseLastmodified(response);

  const RESPONSE: AxiosResponse<number> = await axios.post(
    `http://localhost:${process.env.DBSERVER_PORT}/database/websites`,
    {
      joburl: url,
      etag: responseEtag,
      hash: contentHash,
      lastmodified: responseLastmodified,
    },
  );
  return RESPONSE.data;
}

function cleanHtmlContent(html: string): string {
  html = html.replace(/<img[^>]*>/g, "");
  html = html.replace(/<div[^>]*class=["'][^"']*shariff[^"']*["'][^>]*>[^]*?<\/div>/g, "");
  html = html.replace(
    /<div[^>]*style=["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[^]*?<\/div>/g,
    "",
  );
  html = html.replace(/<span[^>]*>\s*<\/span>/g, "");
  html = html.replace(/<div[^>]*>\s*<\/div>/g, "");
  html = html.replace(/<a[^>]*>\s*<\/a>/g, "");
  html = html.replace(/<hr\s*\/?>/g, "");
  html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, "");
  html = html.replace(/href="([^"]*?)\?\w+=\d+"/g, 'href="$1"');
  html = html.replace(/<div[^>]*>\s*<\/div>/g, "");
  html = html.replace(/<br\s*\/?>/g, "");
  html = html.replace(/\s*tabindex=['"][^'"']*['"]/gi, "");
  html = html.replace(/\s+(?:id|for)=["']j_idt\d+["']/gi, "");
  html = html.replace(/formAcymailing\d+/gi, "formAcymailing");
  html = html.replace(
    /(href|action)=("|')\.\/?crypt\.[^"']*\2/gi,
    (match: string, attr: string, quote: string): string => {
      return `${attr}=${quote}./crypt${quote}`;
    },
  );
  html = html.replace(/\|\s*K\d+/gi, "");
  html = html.replace(/(href|src)=(["'])([^"']+)\2/gi, (match, attribute: string, quote: string, value: string) => {
    if (!value.toLowerCase().includes("sid=")) {
      return match;
    }

    try {
      const [base, query] = value.split("?");
      if (!query) {
        return `${attribute}=${quote}${base}${quote}`;
      }

      const FILTERED_PARAMS: string[] = query
        .split("&")
        .filter((param) => param && !param.toLowerCase().startsWith("sid="));

      const CLEANED_VALUE: string =
        FILTERED_PARAMS.length > 0 ? `${base}?${FILTERED_PARAMS.join("&")}` : base;

      return `${attribute}=${quote}${CLEANED_VALUE}${quote}`;
    } catch (_err) {
      return match;
    }
  });

  html = html.replace(/&nbsp;/gi, " ");
  html = html.replace(/\u00a0/g, " ");

  // Remove CSP nonce attributes (sprind.org generates new nonces on each request)
  html = html.replace(/\s*nonce=["'][^"']*["']/gi, "");

  // Remove dynamic CDN URLs (ipb-halle.de uses cdn-cgi/content?id=<random>)
  html = html.replace(
    /(href|src)=(["'])([^"']*cdn-cgi\/content\?id=)[^"']*(\2)/gi,
    '$1=$2$3NORMALIZED$4',
  );

  // Remove Cloudflare email protection (ipb-halle.de encrypts emails differently on each request)
  html = html.replace(/href="[^"]*cdn-cgi\/l\/email-protection#[^"]*"/gi, 'href="EMAIL_PROTECTED"');
  html = html.replace(/data-cfemail="[^"]*"/gi, 'data-cfemail="NORMALIZED"');

  // Remove Cloudflare challenge parameters (ipb-halle.de has dynamic CF params on each request)
  html = html.replace(/__CF\$cv\$params=\{[^}]*\}/gi, '__CF$cv$params={NORMALIZED}');

  // Remove Cloudflare/CDN challenge tokens
  html = html.replace(/data-cf-[^=]*=["'][^"']*["']/gi, "");

  // Remove theme_token (opencampus.net generates new tokens on each request)
  html = html.replace(/"theme_token"\s*:\s*"[^"]*"/gi, '"theme_token":"NORMALIZED"');

  // Remove Drupal form_build_id (opencampus.net generates new form IDs on each request)
  html = html.replace(/name="form_build_id"\s+value="[^"]*"/gi, 'name="form_build_id" value="NORMALIZED"');

  // Normalize dynamic form/input IDs (sprind.org uses different IDs per server/request)
  // Example: id="input_3" name="form_3" vs id="input_0" name="form_1"
  html = html.replace(/id="input_\d+"/gi, 'id="input_X"');
  html = html.replace(/name="form_\d+"/gi, 'name="form_X"');
  html = html.replace(/for="input_\d+"/gi, 'for="input_X"');
  html = html.replace(/name="submit_\d+"/gi, 'name="submit_X"');

  html = html.replace(/\s+/g, " ");
  html = html.replace(/>\s+</g, "><");

  return html.trim();
}

export async function compareAndUpdateWebsite(
  website: IWebsite,
  response: AxiosResponse,
): Promise<boolean> {
  const { hash: contentHash } = await computeStableContentHash(
    website.JobURL,
    response.data,
  );

  const responseEtag: string = parseEtag(response);
  const responseLastmodified: string = parseLastmodified(response);

  const previousEtag: string = website.ETag || "";
  const previousLastModified: string = website.LastModified || "";
  const previousHash: string = website.Hash || "";

  const etagChanged: boolean = responseEtag !== previousEtag;
  const lastModifiedChanged: boolean = responseLastmodified !== previousLastModified;
  const hashChanged: boolean = hashIsDifferent(contentHash, previousHash);

  if (etagChanged || lastModifiedChanged || hashChanged) {
    await axios.put(
      `http://localhost:${process.env.DBSERVER_PORT}/database/websites/${website.WebsiteID}`,
      {
        new_joburl: website.JobURL,
        new_etag: responseEtag,
        new_hash: contentHash,
        new_lastmodified: responseLastmodified,
      },
    );
  }

  return hashChanged;
}

export function parseEtag(response: AxiosResponse): string {
  let parsedEtag: string = response.headers["etag"];
  if (!parsedEtag) {
    return "";
  } else {
    return parsedEtag;
  }
}

export function parseLastmodified(response: AxiosResponse): string {
  let parsedLastmodified: string = response.headers["last-modified"];
  if (!parsedLastmodified) {
    return "";
  } else {
    return parsedLastmodified;
  }
}

export function generateHash(DATA: string): string {
  return crypto.createHash("sha256").update(DATA).digest("hex");
}

export function extractBodyContent(html: string): string {
  const MATCH: RegExpMatchArray | null = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (MATCH) {
    let content: string = MATCH[1].trim();
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    content = content.replace(/<!--[\s\S]*?-->/g, "");
    content = content.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
    content = content.replace(/>\s+</g, "><");
    return content.trim();
  } else {
    return "";
  }
}

export function hashIsDifferent(firstHash: string, secondHash: string): boolean {
  if (firstHash != secondHash) {
    return true;
  } else {
    return false;
  }
}

export async function makeRequest(url: string): Promise<AxiosResponse> {
  return await fetchWithSession(url);
}

export async function verifyHtml(html: string, url: string): Promise<boolean> {
  const $: cheerio.CheerioAPI = cheerio.load(html) as cheerio.CheerioAPI;
  const VISIBLE_TEXT: string = extractVisibleText($);
  const TEXT_LENGTH: number = VISIBLE_TEXT.length;
  const MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_FRAUNH: number = 3200;
  const MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_OTHER: number = 500;

  // Check for common "job not found" / "archived" messages
  // These phrases indicate that a job posting has been removed or is no longer available
  const ERROR_PHRASES: string[] = [
    // German phrases
    "Die von Ihnen aufgerufene Stellenausschreibung ist nicht mehr verfügbar",
    "stellenausschreibung ist nicht mehr verfügbar",
    "Diese Stellenausschreibung ist abgelaufen",
    "Die Stelle ist nicht mehr verfügbar",
    "Stellenangebot nicht gefunden",
    "Das Stellenangebot ist nicht (mehr) ausgeschrieben und steht daher nicht zur Verfügung",
    "ist nicht (mehr) ausgeschrieben und steht daher nicht zur Verfügung",
    "Stellenangebot ist nicht (mehr) ausgeschrieben",
    "Die gesuchte Stellenausschreibung konnte nicht gefunden werden",
    "Stellenausschreibung konnte nicht gefunden werden",
    "Diese Stelle ist nicht mehr verfügbar",
    "Diese Stellenanzeige ist nicht mehr aktiv",
    "Stellenanzeige ist nicht mehr aktiv",
    "Diese Position ist nicht mehr verfügbar",
    "Die Stellenanzeige wurde entfernt",
    "Stellenanzeige wurde entfernt",
    "Die Stelle wurde bereits besetzt",
    "Stelle wurde bereits besetzt",
    "Stellenangebot existiert nicht mehr",
    "Stellenangebot nicht mehr vorhanden",
    "Seite nicht gefunden",
    // English phrases
    "This job posting has expired",
    "This position is no longer available",
    "Job not found",
    "Job listing not found",
    "This job is no longer available",
    "This position has been filled",
    "Position has been filled",
    "Job posting has been removed",
    "This vacancy is no longer available",
    "Page not found",
    "The requested job could not be found",
    // "No job openings" phrases for career pages with no current positions
    "Currently, we have no job openings",
    "We have no job openings",
    "No job openings at this time",
    "No current job openings",
    "There are currently no vacancies",
    "There are no vacancies at the moment",
    "We currently have no open positions",
    "No open positions at this time",
    // German "keine Stellen" phrases
    "Aktuell haben wir keine offenen Stellen",
    "Derzeit keine Stellenangebote",
    "Keine aktuellen Stellenangebote",
  ];

  const TEXT_LOWER: string = VISIBLE_TEXT.toLowerCase();
  for (const PHRASE of ERROR_PHRASES) {
    if (TEXT_LOWER.includes(PHRASE.toLowerCase())) {
      console.log(`Job archived/removed - detected phrase: "${PHRASE}" in ${url}`);
      return false;
    }
  }

  // EVA MPG specific check: Empty job pages have h2 elements with no text content
  // Valid jobs have h2 with job titles like "PhD Student (f/m/d)" or section titles
  if (url.includes("eva.mpg.de")) {
    const h2Elements: cheerio.Cheerio = $("h2");
    let hasContentInH2: boolean = false;

    h2Elements.each((_index: number, element: cheerio.Element) => {
      const h2Text: string = $(element).text().trim();
      // Check if h2 has meaningful content (not just whitespace/navigation)
      // Filter out common navigation headings like "Abteilungen und Gruppen", "Stellenangebote", "Applications"
      if (
        h2Text.length > 5 &&
        !/^(stellenangebote|applications?|abteilungen und gruppen)$/i.test(h2Text)
      ) {
        hasContentInH2 = true;
      }
    });

    if (!hasContentInH2 && h2Elements.length > 0) {
      console.log(
        `Job page is empty/placeholder - EVA MPG page with no meaningful h2 content in ${url}`,
      );
      return false;
    }
  }

  // Check for archive/error URL patterns
  const ERROR_URL_PATTERNS: RegExp[] = [
    /\/archiv\.html?$/i,
    /\/archive\.html?$/i,
    /\/error\.html?$/i,
    /\/404\.html?$/i,
    /\/not-found\.html?$/i,
  ];

  for (const PATTERN of ERROR_URL_PATTERNS) {
    if (PATTERN.test(url)) {
      console.log(`Job archived/removed - detected URL pattern: ${url}`);
      return false;
    }
  }

  if (
    url.startsWith("https://jobs.fraunhofer.de/") &&
    TEXT_LENGTH < MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_FRAUNH
  ) {
    return false;
  }

  // Berufungsportal pages are Vaadin SPAs that embed PDFs - they have minimal visible text
  // but the actual job content is in the embedded PDF. Skip the text length check for these.
  if (url.includes("berufungsportal.uni-jena.de")) {
    console.log(`[verifyHtml] Berufungsportal URL detected - skipping text length check (PDF embedded): ${url}`);
    return true;
  }

  if (TEXT_LENGTH < MAX_TEXT_LENGTH_FOR_ERROR_WEBSITE_OTHER) {
    return false;
  }
  return true;
}

export function extractVisibleText($: cheerio.CheerioAPI): string {
  $(
    "script, style, noscript, iframe, meta, link, [style*='display:none'], [style*='visibility:hidden'], [hidden]",
  ).remove();

  const VISIBLE_TEXT: string = $("body")
    .text()
    .replace(/[\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return VISIBLE_TEXT;
}

export async function deleteJobByUrl(joburl: string, employerId: number): Promise<boolean> {
  try {
    await axios.post<number>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/urldelete`,
      {
        url: joburl,
        employerId: employerId,
      },
    );
    return true;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status == httpStatus.NOT_FOUND) {
      return false;
    } else {
      throw new Error(`Internal Server Error`);
    }
  }
}

export function normalizeHtml(html: string): string {
  const BODY_CONTENT: string = extractBodyContent(html);
  return cleanHtmlContent(BODY_CONTENT);
}

export function hashNormalizedHtml(html: string): string {
  const NORMALIZED: string = normalizeHtml(html);
  return generateHash(NORMALIZED);
}

type NormalizedHashResult = {
  normalizedHtml: string;
  hash: string;
};

async function computeStableContentHash(url: string, rawHtml: string): Promise<NormalizedHashResult> {
  let normalizedHtml: string = cleanHtmlContent(extractBodyContent(rawHtml));
  let hash: string = generateHash(normalizedHtml);

  if (!needsLeipzigStabilityCheck(url)) {
    return { normalizedHtml, hash };
  }

  try {
    const SECOND_RESPONSE: AxiosResponse<string> = await fetchWithSession<string>(url);

    let secondaryNormalized: string = cleanHtmlContent(
      extractBodyContent(SECOND_RESPONSE.data),
    );
    let secondaryHash: string = generateHash(secondaryNormalized);

    if (secondaryHash !== hash) {
      normalizedHtml = sanitizeLeipzigDynamicHtml(normalizedHtml);
      secondaryNormalized = sanitizeLeipzigDynamicHtml(secondaryNormalized);

      hash = generateHash(normalizedHtml);
      secondaryHash = generateHash(secondaryNormalized);

      if (secondaryHash !== hash) {
        console.warn(
          `Leipzig hash mismatch persists after dynamic cleanup for ${url}. Using primary hash value.`,
        );
      }
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.warn(
        `Second fetch for Leipzig hash stability failed (${url}): ${error.message}`,
      );
    } else if (error instanceof Error) {
      console.warn(
        `Second fetch for Leipzig hash stability failed (${url}): ${error.message}`,
      );
    } else {
      console.warn(`Second fetch for Leipzig hash stability failed (${url}).`);
    }
  }

  return { normalizedHtml, hash };
}

function needsLeipzigStabilityCheck(url: string): boolean {
  try {
    const PARSED_URL: URL = new URL(url);
    const HOST: string = PARSED_URL.hostname.toLowerCase();
    const PATHNAME: string = PARSED_URL.pathname.toLowerCase();

    const IS_INTERNAL_ARTICLE: boolean =
      HOST.includes("uni-leipzig.de") &&
      (PATHNAME.includes("/stellenausschreibung/") || PATHNAME.includes("/newsdetail/artikel/"));

    const IS_B_ITE_POSTING: boolean =
      HOST.includes("uni-leipzig.b-ite.careers") && PATHNAME.includes("/jobposting/");

    return IS_INTERNAL_ARTICLE || IS_B_ITE_POSTING;
  } catch {
    return false;
  }
}

function buildRequestConfig(url: string): AxiosRequestConfig {
  try {
    const HOST: string = new URL(url).hostname.toLowerCase();
    if (HOST.includes("uni-leipzig")) {
      return {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      };
    }
  } catch {}

  return {};
}

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

async function fetchWithSession<T = any>(
  url: string,
  extraConfig: AxiosRequestConfig = {},
): Promise<AxiosResponse<T>> {
  const MAX_RETRIES = 3;
  const INITIAL_DELAY_MS = 1000;
  
  const jar: CookieJar = new CookieJar();
  const baseConfig: AxiosRequestConfig = buildRequestConfig(url);

  const mergedHeaders = {
    ...(baseConfig.headers ?? {}),
    ...(extraConfig.headers ?? {}),
  };

  const mergedConfig: AxiosRequestConfig = {
    ...baseConfig,
    ...extraConfig,
    headers: Object.keys(mergedHeaders).length > 0 ? mergedHeaders : undefined,
    withCredentials: true,
  };

  (mergedConfig as any).jar = jar;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get<T>(url, mergedConfig);
      return response;
    } catch (error) {
      lastError = error;
      
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
        const errorCode = axios.isAxiosError(error) ? error.code : 'unknown';
        console.log(`Retryable error (${errorCode}) for ${url}, retry ${attempt + 1}/${MAX_RETRIES} in ${delayMs}ms`);
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

function sanitizeLeipzigDynamicHtml(html: string): string {
  let sanitized: string = html;

  sanitized = sanitized.replace(
    /<input[^>]+type=("|')hidden\1[^>]*>/gi,
    (match: string): string => {
      if (/name=("|')(?:tx_news_pi1|__referrer|__trustedproperties|newssearchsubmitted|search\[)/i.test(match)) {
        return "";
      }
      return match;
    },
  );

  sanitized = sanitized.replace(
    /(href|action)=("|')([^"']+)(\2)/gi,
    (_: string, attr: string, quote: string, value: string): string => {
      const CLEANED: string = stripDynamicQueryParams(value);
      return `${attr}=${quote}${CLEANED}${quote}`;
    },
  );

  sanitized = sanitized.replace(
    /data-[^=]+=("|')[^"']*(?:tx_news_pi1|chash)[^"']*\1/gi,
    "",
  );

  sanitized = sanitized.replace(/\s{2,}/g, " ");
  sanitized = sanitized.replace(/>\s+</g, "><");

  return sanitized.trim();
}

function stripDynamicQueryParams(value: string): string {
  const HASH_INDEX: number = value.indexOf("#");
  const HAS_FRAGMENT: boolean = HASH_INDEX >= 0;
  const FRAGMENT: string = HAS_FRAGMENT ? value.slice(HASH_INDEX) : "";
  const WITHOUT_FRAGMENT: string = HAS_FRAGMENT ? value.slice(0, HASH_INDEX) : value;

  const QUESTION_INDEX: number = WITHOUT_FRAGMENT.indexOf("?");
  if (QUESTION_INDEX === -1) {
    return value;
  }

  const BASE_PATH: string = WITHOUT_FRAGMENT.slice(0, QUESTION_INDEX);
  const QUERY_STRING: string = WITHOUT_FRAGMENT.slice(QUESTION_INDEX + 1);
  const PARAMS: string[] = QUERY_STRING.split("&").filter(Boolean);

  const FILTERED_PARAMS: string[] = PARAMS.filter((param: string): boolean => {
    return !isDynamicQueryParam(param);
  });

  const REBUILT_QUERY: string = FILTERED_PARAMS.join("&");
  const REBUILT_URL: string = REBUILT_QUERY ? `${BASE_PATH}?${REBUILT_QUERY}` : BASE_PATH;

  return HAS_FRAGMENT ? `${REBUILT_URL}${FRAGMENT}` : REBUILT_URL;
}

function isDynamicQueryParam(param: string): boolean {
  const EQUAL_INDEX: number = param.indexOf("=");
  const RAW_NAME: string = EQUAL_INDEX === -1 ? param : param.slice(0, EQUAL_INDEX);

  let decodedName: string = RAW_NAME;
  try {
    decodedName = decodeURIComponent(RAW_NAME);
  } catch {}

  const LOWER_NAME: string = decodedName.toLowerCase();

  return (
    LOWER_NAME.startsWith("tx_news_pi1") ||
    LOWER_NAME === "chash" ||
    LOWER_NAME === "pk_campaign" ||
    LOWER_NAME === "pk_kwd"
  );
}

export const __test = {
  needsLeipzigStabilityCheck,
  stripDynamicQueryParams,
  sanitizeLeipzigDynamicHtml,
  buildRequestConfig,
};
