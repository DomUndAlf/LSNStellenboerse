import fs from "fs";
import path from "path";
import { IScrapeResult, scrape } from "../Services/scraper";
import * as cheerio from "cheerio";
import { ExpectedResult } from "../../Shared/aiHelpers";

const URL_LIST_FILE_PATH: string = path.join(__dirname, "./urlList.json");

/**
 * Saves the provided HTML content to a file and, if it does not already exist,
 * creates a corresponding JSON file with placeholder values for job details.
 *
 * This function organizes the HTML and JSON files into subdirectories for each institution,
 * creating the directories if they do not already exist.
 *
 * @param websiteId - A unique identifier for the job listing, used to name the saved files.
 * @param htmlContent - The HTML content to save as a `.html` file.
 * @param INSTITUTIONFolderPath - (Optional) A folder path specific to the institution where the file will be stored.
 *                                If provided, it is appended to the base folder path for organized storage.
 * @returns The full path of the saved HTML file.
 */
export function saveHTMLFile(
  websiteId: number,
  htmlContent: string,
  INSTITUTIONFolderPath?: string,
): string {
  type Placeholder = {
    jobTitle: string;
    jobDescription: string;
    jobTasks: string[];
    applicationDeadline: string;
    language: string;
  };
  const BASE_FOLDER_PATH: string = path.join(__dirname, "savedHTML");
  const FOLDER_PATH: string = INSTITUTIONFolderPath
    ? path.join(BASE_FOLDER_PATH, INSTITUTIONFolderPath)
    : BASE_FOLDER_PATH;

  if (!fs.existsSync(FOLDER_PATH)) {
    fs.mkdirSync(FOLDER_PATH, { recursive: true });
  }

  const HTML_FILE_PATH: string = path.join(FOLDER_PATH, `job_${websiteId}.html`);
  const JSON_FILE_PATH: string = path.join(FOLDER_PATH, `job_${websiteId}.json`);

  fs.writeFileSync(HTML_FILE_PATH, htmlContent);
  console.log(`HTML-Datei erfolgreich gespeichert: ${HTML_FILE_PATH}`);

  if (!fs.existsSync(JSON_FILE_PATH)) {
    const PLACEHOLDER_JSON: Placeholder = {
      jobTitle: "",
      jobDescription: "",
      jobTasks: [""],
      applicationDeadline: "",
      language: "",
    };
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(PLACEHOLDER_JSON, null, 2));
    console.log(`JSON-Datei erfolgreich erstellt: ${JSON_FILE_PATH}`);
  } else {
    console.log(`JSON-Datei bereits vorhanden: ${JSON_FILE_PATH}`);
  }

  return HTML_FILE_PATH;
}

/**
 * Scrapes HTML content from URLs specified in the urlList.json file, saves the HTML content,
 * and generates a JSON file with placeholder fields for job details if it doesn't already exist.
 *
 * Each institution's URLs are saved in separate directories named by institution,
 * and the function checks for and skips URLs that have already been scraped.
 *
 * @async
 * @returns A list of file paths where HTML content has been saved.
 *
 * @throws Will log an error message if a URL fails to be scraped or saved.
 */
export async function scrapeAndSaveHTML(): Promise<string[]> {
  type UrlList = { [institution: string]: string[] };
  const HTML_FILE_PATHS: string[] = [];
  const URL_LIST: UrlList = JSON.parse(fs.readFileSync(URL_LIST_FILE_PATH, "utf-8"));

  for (const INSTITUTION in URL_LIST) {
    for (const [INDEX, URL] of URL_LIST[INSTITUTION].entries()) {
      const HTML_FILE_PATH: string = path.join(
        __dirname,
        "savedHTML",
        INSTITUTION,
        `job_${INDEX + 1}.html`,
      );
      if (fs.existsSync(HTML_FILE_PATH)) {
        console.log(`Überspringe URL (bereits gescrapt): ${URL}`);
        HTML_FILE_PATHS.push(HTML_FILE_PATH);
        continue;
      } else
        try {
          const SCRAPE_RESULT: IScrapeResult = await scrape(URL);
          const HTML_FILE_PATH: string = saveHTMLFile(INDEX + 1, SCRAPE_RESULT.HTML, INSTITUTION);

          HTML_FILE_PATHS.push(HTML_FILE_PATH);
        } catch (error) {
          console.error(`Fehler beim Scrapen der URL ${URL}: ${error.message}`);
        }
    }
  }

  return HTML_FILE_PATHS;
}

/**
 * Loads URLs from a JSON file containing a structured list of institutions and their respective URLs.
 *
 * @param {string} filePath - The file path to the JSON file containing URLs.
 * @returns {string[]} - An array of URLs extracted from all institutions listed in the JSON.
 *
 * @throws Will throw an error if the JSON file cannot be read or parsed.
 */
export function loadUrls(filePath: string): string[] {
  type UrlList = { [institution: string]: string[] };
  const URL_DATA: UrlList = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const URLS: string[] = [];
  for (const INSTITUTION in URL_DATA) {
    if (Array.isArray(URL_DATA[INSTITUTION])) {
      URLS.push(...URL_DATA[INSTITUTION]);
    }
  }

  return URLS;
}

/**
 * Recursively scans a directory for all HTML files, including files in subdirectories.
 *
 * @param {string} directory - The directory path where HTML files are located.
 * @returns {string[]} - An array of file paths for each HTML file found.
 *
 * @throws Will throw an error if there is an issue accessing the directory.
 */
export function getAllFiles(directory: string): string[] {
  let allFiles: string[] = [];
  const FILES_N_DIR: string[] = fs.readdirSync(directory);

  for (const ENTRY of FILES_N_DIR) {
    const FULL_PATH: string = path.join(directory, ENTRY);

    if (fs.statSync(FULL_PATH).isDirectory()) {
      allFiles = allFiles.concat(getAllFiles(FULL_PATH));
    } else if (ENTRY.endsWith(".html") || ENTRY.endsWith(".txt")) {
      allFiles.push(FULL_PATH);
    }
  }

  return allFiles;
}

/**
 * Reads and loads an HTML file from a specified path, parsing its content with Cheerio
 * to return a structured IScrapeResult for further processing.
 *
 * @param {string} filePath - The file path of the saved HTML file to load.
 * @returns {Promise<IScrapeResult>} - A promise that resolves to an object containing
 * parsed HTML content and Cheerio selectors.
 *
 * @throws Will throw an error if the HTML file cannot be read or parsed.
 */
export async function loadSavedHTML(filePath: string): Promise<IScrapeResult> {
  try {
    const HTML_CONTENT: string = fs.readFileSync(path.resolve(__dirname, filePath), "utf-8");
    const $: cheerio.CheerioAPI = cheerio.load(HTML_CONTENT);

    return { HTML: "", $, ETAG: "no E-Tag" } as IScrapeResult;
  } catch (error) {
    console.error("Error reading file ${filePath}:", error.message);
    throw error;
  }
}

/**
 * Loads an expected result from a JSON file based on the provided file path.
 *
 * This function checks if the given `filePath` ends with `.html` or `.txt`
 * and replaces the extension with `.json` to determine the corresponding JSON file path.
 * If the JSON file exists, it reads the content, parses it, and returns it as an `ExpectedResult` object.
 * If the file does not exist or is not in the specified formats, the function returns `null`.
 *
 * @param filePath The path to the source file with `.html` or `.txt` extension.
 *                 It is used to derive the path of the JSON file.
 * @return An `ExpectedResult` object parsed from the JSON file if the file exists;
 *         otherwise, `null`.
 *
 */
export function loadExpectedResult(filePath: string): ExpectedResult | null {
  let jsonFilePath: string;

  if (filePath.endsWith(".html")) {
    jsonFilePath = filePath.replace(".html", ".json");
  } else if (filePath.endsWith(".txt")) {
    jsonFilePath = filePath.replace(".txt", ".json");
  }

  if (fs.existsSync(jsonFilePath)) {
    const DATA: string = fs.readFileSync(jsonFilePath, "utf-8");
    return JSON.parse(DATA);
  }

  return null;
}
