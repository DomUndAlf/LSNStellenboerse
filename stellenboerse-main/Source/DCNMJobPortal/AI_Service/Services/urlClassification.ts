import OpenAI from "openai";
import axios, { AxiosResponse } from "axios";
import { IScrapeResult, scrape } from "./scraper";
import { getText } from "./pdfService";
import {
  addToBlacklist,
  addToWhitelist,
  isRelevantUrl,
  isPotentialJobUrl,
  calculateContentScore,
  isKnownGeneralUrl,
  isPdfLikeUrl,
  isKnownJobPortal,
  isOverviewPage,
  hasStrongJobIndicators,
  hasVeryStrongJobUrlIndicators,
} from "./urlClassificationUtils";
import { URL_CLASSIFICATION_PROMPT } from "./prompts";
import { scrapeEmbeddedJobUrls } from "./embeddedScraper";
import { IEmployer } from "../../Shared/interfaces";

export type UrlClassificationResult = {
  JOB_URLS: string[];
  OTHER_URLS: string[];
};

const MAX_CONTENT_LENGTH: number = 150000;

function isContentSizeValid(content: string): boolean {
  return content.length <= MAX_CONTENT_LENGTH;
}

/**
 * Classifies a list of URLs as either job-related or non-job-related based on their content.
 *
 * The classification process involves scraping content from the URLs, processing PDFs if needed,
 * and analyzing the content using predefined heuristics and an AI model. URLs exceeding the
 * maximum allowed content length are automatically blacklisted.
 *
 * @param urls - Array of URLs to classify.
 * @param employerId - The employer ID for associating the classification results.
 * @returns A promise resolving to an object containing arrays of classified job URLs and other URLs.
 *
 * @throws {Error} If the employerId is not provided.
 */
type UrlClassifierOptions = {
  skipEmbeddedScrape?: boolean;
};

export async function urlClassifier(
  urls: string[],
  employerId: number,
  options: UrlClassifierOptions = {},
): Promise<UrlClassificationResult> {
  if (!employerId) {
    throw new Error("Employer ID is required.");
  }

  const EMPLOYER: IEmployer = await axios
    .get<IEmployer>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}`,
    )
    .then(function (res: AxiosResponse<IEmployer>) {
      return res.data;
    })
    .catch(function (err: Error) {
      console.error(`Error fetching employer data for ID ${employerId}:`, err.message);
      throw err;
    });

  const SHOULD_FETCH_EMBEDDED: boolean = EMPLOYER.isEmbedded && !options.skipEmbeddedScrape;

  if (SHOULD_FETCH_EMBEDDED) {
    console.log(`Employer ${employerId} is marked as embedded. Using Selenium for scraping.`);
    const EMBEDDED_URLS: string[] = await scrapeEmbeddedJobUrls(EMPLOYER.Website);

    urls = [...urls, ...EMBEDDED_URLS];
  } else if (EMPLOYER.isEmbedded) {
    console.log(
      `Employer ${employerId} is marked as embedded, but embedded scraping was skipped per options.`,
    );
  }

  urls = Array.from(new Set(urls));

  urls = await Promise.all(
    urls.map(async function (url: string) {
      if (!isRelevantUrl(url)) {
        return null;
      }

      const IN_WHITELIST: boolean = await axios
        .get<string[]>(
          `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}/whitelist`,
        )
        .then(function (res: AxiosResponse<string[]>) {
          return res.data.includes(url);
        })
        .catch(function () {
          return false;
        });

      const IN_BLACKLIST: boolean = await axios
        .get<string[]>(
          `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}/blacklist`,
        )
        .then(function (res: AxiosResponse<string[]>) {
          return res.data.includes(url);
        })
        .catch(function () {
          return false;
        });

      return IN_WHITELIST || IN_BLACKLIST ? null : url;
    }),
  );

  urls = urls.filter(function (url: string) {
    return url !== null;
  });

  console.log(`Classifying ${urls.length} URLs by scraping content using OpenAI.`);

  const OPENAI: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const JOB_URLS: string[] = [];
  const OTHER_URLS: string[] = [];

  for (const URL of urls) {
    if (isKnownGeneralUrl(URL)) {
      OTHER_URLS.push(URL);
      await addToBlacklist(employerId, URL);
      continue;
    }

    // Check if URL has very strong job indicators that should bypass AI classification
    if (hasVeryStrongJobUrlIndicators(URL)) {
      JOB_URLS.push(URL);
      await addToWhitelist(employerId, URL);
      continue;
    }

    try {
      let pageContent: string;

      if (isPdfLikeUrl(URL) || URL.includes("download.php")) {
        console.log(`Processing PDF URL: ${URL}`);
        try {
          const RESULT: string = await getText(URL);
          pageContent = JSON.stringify(RESULT);
        } catch (error) {
          const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
          console.warn(
            `Falling back to HTML scraping for ${URL} due to PDF extraction error: ${ERROR_MESSAGE}`,
          );
          const SCRAPE_RESULT: IScrapeResult = await scrape(URL);
          pageContent = SCRAPE_RESULT.$("body").text().replace(/\s+/g, " ").trim();
        }
      } else {
        const SCRAPE_RESULT: IScrapeResult = await scrape(URL);
        pageContent = SCRAPE_RESULT.$("body").text().replace(/\s+/g, " ").trim();
      }

      if (!isContentSizeValid(pageContent)) {
        console.warn(`Content size exceeds the limit for URL: ${URL}.`);

        if (isKnownJobPortal(URL)) {
          console.warn(`Trusted job portal detected. Adding ${URL} to whitelist despite size.`);
          JOB_URLS.push(URL);
          await addToWhitelist(employerId, URL);
        } else if (hasStrongJobIndicators(pageContent)) {
          // Even if content is too large, check for strong job indicators
          console.warn(`Strong job indicators found in large content. Adding ${URL} to whitelist.`);
          JOB_URLS.push(URL);
          await addToWhitelist(employerId, URL);
        } else {
          OTHER_URLS.push(URL);
          await addToBlacklist(employerId, URL);
        }
        continue;
      }

      // Check if this is an overview/listing page rather than an actual job
      if (isOverviewPage(pageContent)) {
        console.log(`Overview page detected, classifying as "other": ${URL}`);
        OTHER_URLS.push(URL);
        await addToBlacklist(employerId, URL);
        continue;
      }

      const IS_LIKELY_JOB: boolean = isPotentialJobUrl(URL);
      const SCORE: number = calculateContentScore(pageContent);

      const SYSTEM_MESSAGE: string = URL_CLASSIFICATION_PROMPT.replace(
        "{isLikelyJob}",
        IS_LIKELY_JOB ? "likely" : "unlikely",
      ).replace("{score}", SCORE.toString());

      const AI_RESPONSE: OpenAI.Chat.Completions.ChatCompletion =
        await OPENAI.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_MESSAGE },
            { role: "user", content: `Here is the page content of the URL: ${pageContent}` },
          ],
          max_tokens: 1,
        });

      const RESPONSE_TEXT: string = AI_RESPONSE.choices[0].message.content.trim().toLowerCase();
      console.log(`AI classification for ${URL}: ${RESPONSE_TEXT}`);

      if (RESPONSE_TEXT === "job") {
        JOB_URLS.push(URL);
        await addToWhitelist(employerId, URL);
      } else if (RESPONSE_TEXT === "other") {
        OTHER_URLS.push(URL);
        await addToBlacklist(employerId, URL);
      } else {
        console.error(`Unexpected response from AI: ${RESPONSE_TEXT}`);
        // Fallback: If URL has job indicators, treat as job; otherwise skip (don't add to either list)
        if (isPotentialJobUrl(URL)) {
          console.warn(`URL has job keywords, treating as job despite unexpected AI response: ${URL}`);
          JOB_URLS.push(URL);
          await addToWhitelist(employerId, URL);
        } else {
          console.warn(`Skipping URL due to unexpected AI response (will be re-classified next run): ${URL}`);
        }
      }
    } catch (error) {
      const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
      console.error(`Error classifying URL ${URL}:`, ERROR_MESSAGE);

      if (isKnownJobPortal(URL)) {
        console.warn(
          `Trusted job portal detected. Adding ${URL} to whitelist despite classification error.`,
        );
        JOB_URLS.push(URL);
        await addToWhitelist(employerId, URL);
      } else if (isPotentialJobUrl(URL)) {
        // If the URL has job keywords in it, assume it's a job despite the error
        console.warn(
          `URL has job keywords, assuming job despite error. Adding ${URL} to whitelist.`,
        );
        JOB_URLS.push(URL);
        await addToWhitelist(employerId, URL);
      } else {
        OTHER_URLS.push(URL);
        await addToBlacklist(employerId, URL);
      }
    }
  }

  console.log(
    `Classification results - Job URLs: ${JOB_URLS.length}, Other URLs: ${OTHER_URLS.length}`,
  );

  return { JOB_URLS, OTHER_URLS };
}
