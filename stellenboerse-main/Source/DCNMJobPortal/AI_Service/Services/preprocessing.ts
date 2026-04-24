import { ExpectedResult, ExtractionAttributs } from "../../Shared/aiHelpers";
import { IScrapeResult } from "./scraper";
import * as cheerio from "cheerio";

/**
 * Verifies and processes the presence of specific HTML tags in the input text.
 *
 * @param {string} html - The HTML content to check for specific tags.
 * @returns {string} The text extracted or processed based on tag presence.
 */
export function checkTag(Text: string): string {
  const CLEAN_HTML: string = Text.replace(/<(?!\/?(ul|li|br|p)\b)[^>]*>/g, "").trim();
  return CLEAN_HTML;
}

/**
 * Normalizes the given text by applying predefined formatting rules.
 *
 * @param {string} text - The input text to normalize.
 * @returns {string} The normalized text with consistent formatting.
 */
export function normalizeText(Text: string): string {
  Text = Text.replace(/(?<!\s)(<\/p>)/g, " $1")
    .replace(/(?<!\s)(<br>)/g, " $1")
    .replace(/(?<!\s)(\n)/g, " $1");
  Text = Text.replace(/<\/?p>/g, "")
    .replace(/<br>/g, "")
    .replace(/\n/g, "");
  return Text.trim().replace(/\s\s+/g, " ");
}

/**
 * Ensures that the given text ends with a period.
 *
 * @param {string} text - The input text.
 * @returns {string} The text guaranteed to end with a period.
 */
export function ensurePeriod(Text: string): string {
  return Text.trim().endsWith(".") ? Text : `${Text.trim()}.`;
}

/**
 * Removes unnecessary sections or keywords from the input text.
 *
 * @param {string} text - The input text.
 * @returns {string} The cleaned text without unwanted sections.
 */
export function removeFromText(text: string): string {
  const TO_FILTER: string[] = [
    "Your tasks",
    "The Job",
    "Die Stelle",
    "Was Du bei uns tust",
    "Im Detail gehört zu Deinen Aufgaben die Unterstützung bei:",
    "Ihre Aufgaben",
    "Ihre Aufgaben: ",
    "Inhaltliche Schwerpunkte",
    "Zu den Aufgaben der Professur gehören auch",
    "Ihre Aufgaben umfassen:",
    "Position Overview",
    "Key Responsibilities",
    "Das erwartet Sie",
    "Unsere Erwartungen",
    "Daneben aber auch:",
  ];
  const REGEX: RegExp = new RegExp(
    `\\b(${TO_FILTER.map(function (term: string) {
      return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|")})\\b`,
    "gi",
  );
  return text.replace(REGEX, "").replace(/\s\s+/g, " ").trim();
}

/**
 * Extracts relevant body text based on the provided attribute.
 *
 * @param {IScrapeResult} ScrapeResult - The result object containing the body HTML and utility methods.
 * @param {ExtractionAttributs} attribute - The type of content to extract. Valid values are:
 *   - `ExtractionAttributs.Tasks`: Extracts tasks-related content.
 *   - `ExtractionAttributs.Description`: Extracts the job description.
 *   - Any other value: Returns the full body text.
 * @returns {string} The extracted and processed body text based on the attribute.
 * @throws {Error} If an error occurs during text extraction.
 */
/**
 * Removes script and style tags and their content from HTML.
 * Also removes common JavaScript variable declarations and metadata.
 * @param $ - Cheerio API instance
 */
function removeScriptsAndStyles($: cheerio.CheerioAPI): void {
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("iframe").remove();
  // Remove hidden elements that often contain JS data
  $("[style*='display:none'], [style*='display: none']").remove();
  $("[hidden]").remove();
}

/**
 * Cleans JavaScript artifacts from extracted text content.
 * Some JavaScript-heavy pages (like umantis job portals) may have JS variable
 * declarations and data structures that leak into the extracted text.
 * @param text - The text to clean
 * @returns Cleaned text without JavaScript artifacts
 */
export function cleanJavaScriptContent(text: string): string {
  // Remove JavaScript variable declarations like "var StandardText = { ... }"
  let cleaned: string = text.replace(/var\s+\w+\s*=\s*\{[^}]*\}/g, "");
  
  // Remove JavaScript array declarations like "var arr = [ ... ]"
  cleaned = cleaned.replace(/var\s+\w+\s*=\s*\[[^\]]*\]/g, "");
  
  // Remove common JavaScript patterns
  cleaned = cleaned.replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, "");
  
  // Remove UI button texts that shouldn't be in job descriptions
  const UI_STRINGS: string[] = [
    "Jetzt bewerben",
    "Apply Now",
    "Zurück zur Übersicht",
    "Back to overview",
    "Teilen",
    "Share",
    "Drucken",
    "Print",
    "E-Mail senden",
    "Send email",
  ];
  
  for (const uiString of UI_STRINGS) {
    // Remove UI strings that appear standalone (with whitespace around them)
    const regex: RegExp = new RegExp(`\\s${uiString}\\s`, "gi");
    cleaned = cleaned.replace(regex, " ");
  }
  
  // Clean up excessive whitespace created by removals
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  return cleaned;
}

export function getBodyText(ScrapeResult: IScrapeResult, attribute?: ExtractionAttributs): string {
  try {
    // Clone the cheerio instance to avoid modifying the original
    const $: cheerio.CheerioAPI = ScrapeResult.$;
    
    // Remove scripts, styles and hidden elements for cleaner text extraction
    removeScriptsAndStyles($);
    
    if (attribute !== ExtractionAttributs.Tasks && attribute !== ExtractionAttributs.Description) {
      const TEXT: string = $("body").text().replace(/\s+/g, " ").trim();
      return TEXT;
    } else if (attribute == ExtractionAttributs.Description) {
      const TAGGED_TEXT: string = checkTag($("body").html());
      const ONLY_LI: string = extractListItems(TAGGED_TEXT, "desc");
      const NORMTEXT: string = normalizeText(ONLY_LI);
      const TEXT: string = ensurePeriod(NORMTEXT);
      return TEXT;
    } else if (
      attribute == ExtractionAttributs.Tasks ||
      attribute == ExtractionAttributs.Specialty
    ) {
      const BODY_OR_MAIN: string = $("main").html() || $("body").html();
      const TAGGED_TEXT: string = checkTag(BODY_OR_MAIN);
      const ONLY_LI: string = extractListItems(TAGGED_TEXT, "task");
      const REMOVE_NESTED: string = removeNestedList(ONLY_LI);
      const NORMTEXT: string = normalizeText(REMOVE_NESTED);
      const TEXT: string = ensurePeriod(NORMTEXT);
      const BODYTEXT: string = removeFromText(TEXT);
      return BODYTEXT;
    }
  } catch (error) {
    console.error("Error trying to extract body text:", error.message);
    throw error;
  }
}

export async function handleOpenAIResponse<T extends keyof ExpectedResult>(
  attribute: T,
  responseText: string,
): Promise<{ [K in T]: string }> {
  try {
    const RESPONSE_OBJECT: ExpectedResult = JSON.parse(responseText);

    if (typeof RESPONSE_OBJECT[attribute] !== "string") {
      throw new Error(`Expected a string for property "${attribute}"`);
    }

    return RESPONSE_OBJECT as { [K in T]: string };
  } catch (error) {
    throw new Error("Invalid response format: " + error.message);
  }
}

/**
 * Extracts list items from the given HTML text based on the specified flag.
 *
 * @param {string} text - The HTML content from which list items are to be extracted.
 * @param {string} flag - Determines the extraction behavior:
 *   - `"task"`: Extracts and returns all `<li>` elements as a single string.
 *   - `"desc"`: Removes all `<li>` tags and their content from the input text, including `<ul>` tags.
 * @returns {string} A string representing the extracted or cleaned content.
 */
export function extractListItems(text: string, flag: string): string {
  if (flag == "task") {
    let listItemRegex: RegExp = /<li[^>]*>(.*?)<\/li>/g;
    let matches: RegExpStringIterator<RegExpExecArray> = text.matchAll(listItemRegex);
    let extractedItems: string[] = [];
    for (const MATCH of matches) {
      extractedItems.push(MATCH[0].trim());
    }
    return extractedItems.join();
  } else if (flag == "desc") {
    let listRegex: RegExp = /<ul[^>]*>[.\s\S]*?<\/ul>|<li[^>]*>[.\s\S]*?<\/li>/g;
    return text.replace(listRegex, "").trim();
  }
}

/**
 * Removes nested list items from the given text.
 *
 * @param {string} text - The text containing list items, potentially with nested lists.
 * @returns {string} Text with nested list items removed.
 */
export function removeNestedList(text: string): string {
  let listItemRegex: RegExp = /<li[^>]*>(.*?)<\/li>/g;
  let matches: string[] = Array.from(
    text.matchAll(listItemRegex),
    function (match: RegExpExecArray) {
      return match[1].trim();
    },
  );
  return matches
    .map(function (item: string) {
      return `<li>${item}</li>`;
    })
    .join("");
}
