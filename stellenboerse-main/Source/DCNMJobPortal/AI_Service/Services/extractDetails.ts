import OpenAI from "openai";
import { IScrapeResult } from "./scraper";
import {
  PLAIN_TEXT_TITEL_EXTRACTION,
  PLAIN_TEXT_DEADLINE_EXTRACT,
  PLAIN_TEXT_TASK_EXTRACTION,
  PLAIN_TEXT_DESCRIPTION_EXTRACT,
  PLAIN_TEXT_LANGUAGE_EXTRACT,
  PLAIN_TEXT_SPECIALTY_EXTRACT,
} from "./prompts";
import {
  ExtractionAttributs,
  createResponseFormat,
  createResponseFormatArray,
  ParsedResponseType,
  parseDate,
  validateSpecialties,
} from "../../Shared/aiHelpers";
import { getCurrentDate } from "../../Shared/dateUtils";
import { handleOpenAIResponse, getBodyText } from "./preprocessing";
import axios, { AxiosResponse } from "axios";
import { IEmployer, IKeywordForEmployer } from "../../Shared/interfaces";

export const OPENAI: OpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type JobResponse = {
  jobTitle: string;
  jobDescription?: string;
  tasks?: string[];
  applicationDeadline?: Date;
  language: string;
  LocationID?: number;
  specialty?: string[];
};

export function createAIMessageTemplate(BODYTEXT: string, attribute: ExtractionAttributs): string {
  let template: string = "";
  if (attribute == ExtractionAttributs.Titel) {
    template = PLAIN_TEXT_TITEL_EXTRACTION;
  } else if (attribute == ExtractionAttributs.Description) {
    template = PLAIN_TEXT_DESCRIPTION_EXTRACT;
  } else if (attribute == ExtractionAttributs.ApplicationDeadline) {
    template = PLAIN_TEXT_DEADLINE_EXTRACT;
  } else if (attribute == ExtractionAttributs.Tasks) {
    template = PLAIN_TEXT_TASK_EXTRACTION;
  } else if (attribute == ExtractionAttributs.Language) {
    template = PLAIN_TEXT_LANGUAGE_EXTRACT;
  } else if (attribute == ExtractionAttributs.Specialty) {
    template = PLAIN_TEXT_SPECIALTY_EXTRACT;
  }

  const FULLTEXT: string = template + "\n Text: ### \n" + BODYTEXT + "\n ###";
  return FULLTEXT;
}

/**
 * Generates an AI response by extracting specified attributes from a given body of text.
 * The function utilizes an OpenAI chat model to process the text and retrieve structured data
 * in JSON format based on the specified attribute.
 *
 * @param {string} BODYTEXT - The input text containing HTML and PDF content related to job advertisements.
 *                            This text is processed to extract information.
 * @param {ExtractionAttributs} attribute - The attribute to extract from the input text. Possible values
 *                                          include `Description`, `Tasks`, and `Titel`.
 * @returns {Promise<string>} A promise that resolves to a JSON string containing the extracted attribute data.
 *                            Throws an error if the process fails after the maximum number of attempts.
 *
 * @throws {Error} If the AI response process fails after the maximum number of attempts.
 * @example
 * // Example usage:
 * const result = await aiResponse("<html>Job description...</html>", ExtractionAttributs.Description);
 * console.log(result); // Output: JSON string with extracted data
 */
export async function aiResponse(
  BODYTEXT: string,
  attribute: ExtractionAttributs,
  isPDF?: boolean,
): Promise<string> {
  const MAX_ATTEMPTS: number = 3;
  const SYSTEM_CONTENT: string =
    "Du wirst einen Text aus HTML und PDF-Seiten erhalten, der Informationen zu Stellenanzeigen enthält. Deine Aufgabe wird es sein, mitgegebene Attribute vom Benutzer aus dem Text zu extrahieren und diese als ein reines JSON-Objekt ohne Markdown zurückgeben.";

  if (attribute === ExtractionAttributs.Description && !isPDF) {
    BODYTEXT = cleanBodyText(BODYTEXT);
  }

  const GENERATEDTEXT: string = createAIMessageTemplate(BODYTEXT, attribute);

  for (let attempt: number = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const COMPLETION: OpenAI.Chat.Completions.ChatCompletion =
        await OPENAI.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_CONTENT },
            { role: "user", content: GENERATEDTEXT },
          ],
          response_format: createResponseFormat(attribute),
          max_tokens: 2000,
        });

      let firstAnswer: number = 0;

      if (COMPLETION.choices[firstAnswer].finish_reason !== "stop") {
        throw new Error("AI response did not finish correctly");
      }

      const RESPONSETEXT: string = COMPLETION.choices[firstAnswer].message.content;
      let responseObject: ParsedResponseType<string>;

      try {
        responseObject = await handleOpenAIResponse(attribute, RESPONSETEXT);
      } catch (error) {
        console.error(error.message);
        continue;
      }

      if (attribute === ExtractionAttributs.Titel) {
        BODYTEXT = BODYTEXT.replace(/-\n/g, "");
        BODYTEXT = BODYTEXT.replace(/\n/g, " ");
        BODYTEXT = BODYTEXT.replace(/\s\s+/g, " ");
        BODYTEXT = BODYTEXT.replace(/[“”„”‘’‚'"]/g, '"');

        responseObject[attribute] = responseObject[attribute].replace(/[“”„”‘’‚'"]/g, '"');
        BODYTEXT = BODYTEXT.toLowerCase();
        let titleToCheck: string = responseObject[attribute].toLowerCase();
        if (!BODYTEXT.includes(titleToCheck)) {
          console.error(
            `Job title: /${responseObject[attribute]}/ is not found in the original text, retrying...`,
          );
          if (attempt < MAX_ATTEMPTS - 1) {
            continue;
          }
          console.error(
            `Job Title: /${responseObject[attribute]}/ is not found, but saving the last result`,
          );
        }
      }

      if (attribute == ExtractionAttributs.Description) {
        responseObject[attribute] = removeDieStelle(responseObject[attribute]);
        responseObject[attribute] = removeIhreAufgaben(responseObject[attribute]);
        responseObject[attribute] = responseObject[attribute].replace(/[“”„”‘’‚'"]/g, '"');
      }

      return responseObject[attribute];
    } catch (error) {
      console.error("Error trying to generate an AI response", error.message);
    }
  }
}

function cleanBodyText(text: string): string {
  return text.replace(/-\n/g, "").replace(/\n/g, "").replace(/\s\s+/g, "");
}

/**
 * Asynchronously extracts task descriptions or the specialty from a given scraping result using an AI model.
 *
 * This function utilizes an AI system to analyze the provided scraping result and extract specific task-related or specialty-related attributes defined by the user.
 * The response is structured as an array of descriptions in string format.
 *
 * @param ScrapeResult The result of a web scraping operation, containing the text and HTML structure of the page or document.
 * @param attribute The specific attribute(s) to extract from the text, represented as an `ExtractionAttributs` object.
 * @returns A Promise resolving to an array of strings, each representing an extracted task or specialty description.
 * @throws Will throw an error if task extraction fails after the maximum number of attempts.
 */
export async function aiResponseTasks(
  attribute: ExtractionAttributs,
  text: string,
  ScrapeResult?: IScrapeResult,
): Promise<string[]> {
  const MAX_ATTEMPTS: number = 3;
  const SYSTEM_CONTENT: string =
    "Du wirst einen Text aus HTML und PDF-Seiten erhalten, der Informationen zu Stellenanzeigen enthält. Deine Aufgabe wird es sein, mitgegebene Attribute vom Benutzer aus dem Text zu extrahieren und diese als ein reines JSON-Objekt ohne Markdown zurückgeben.";

  const GENERATEDTEXT: string = text
    ? await createAIMessageTemplate(text, attribute)
    : await createAIMessageTemplate(getBodyText(ScrapeResult, attribute), attribute);

  for (let attempt: number = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const COMPLETION: OpenAI.Chat.Completions.ChatCompletion =
        await OPENAI.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_CONTENT },
            { role: "user", content: GENERATEDTEXT },
          ],
          response_format: createResponseFormatArray(attribute),
          max_tokens: 10000,
          temperature: 0.1,
        });

      const FIRST_ANSWER: OpenAI.Chat.Completions.ChatCompletion.Choice = COMPLETION.choices[0];
      if (FIRST_ANSWER.finish_reason === "stop") {
        const RESPONSE_OBJECT: JobResponse = JSON.parse(FIRST_ANSWER.message.content);

        if (attribute === ExtractionAttributs.Specialty) {
          const EXTRACTEDSPECIALTIES: string[] = RESPONSE_OBJECT[attribute];
          if (EXTRACTEDSPECIALTIES.includes("Nicht-wissenschaftliche Berufe")) {
            return ["Nicht-wissenschaftliche Berufe"];
          }
          if (validateSpecialties(EXTRACTEDSPECIALTIES)) {
            return EXTRACTEDSPECIALTIES;
          } else {
            console.warn(`Attempt ${attempt + 1}: Wrong specialty detected, retrying...`);
            continue;
          }
        }
        return RESPONSE_OBJECT[attribute];
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1}: Error while extracting:`, error.message);
    }
  }

  console.warn("All attempts failed, returning default value");
  return ["Andere"];
}

/**
 * Extracts the details of a job from a given scraping result.
 *
 * This function extracts the job title and job description from the scraping result and returns a JobResponse object containing both attributes.
 *
 * @param SCRAPE_RESULT The scraping result with the text and the HTML DOM
 * @param EMPLOYER_ID id of the employer for the job
 * @param attributeToExtract attribute that is currently getting extractet (for accruacy test)
 * @returns extractet values as an instance of JobResponse
 */

export async function extractJobDetails(
  SCRAPE_RESULT: IScrapeResult,
  EMPLOYER_ID: number,
  attributeToExtract?: ExtractionAttributs,
): Promise<JobResponse> {
  if (attributeToExtract) {
    return await extractSingleAttribute(SCRAPE_RESULT, attributeToExtract);
  }

  let bodyText: string = getBodyText(SCRAPE_RESULT, ExtractionAttributs.Titel);
  const JOB_TITLE: string = await aiResponse(bodyText, ExtractionAttributs.Titel);

  let bodyTextDescription: string = getBodyText(SCRAPE_RESULT, ExtractionAttributs.Description);
  const JOB_DESCRIPTION: string = await aiResponse(
    bodyTextDescription,
    ExtractionAttributs.Description,
  );

  let bodyTextTasks: string = getBodyText(SCRAPE_RESULT, ExtractionAttributs.Tasks);
  const JOB_TASKS: string[] = await aiResponseTasks(ExtractionAttributs.Tasks, bodyTextTasks);

  let bodyTextSpecialty: string = getBodyText(SCRAPE_RESULT, ExtractionAttributs.Specialty);
  const JOB_SPECIALTY: string[] = await aiResponseTasks(
    ExtractionAttributs.Specialty,
    bodyTextSpecialty,
  );

  const DEADLINE_STRING: string = await aiResponse(
    bodyText,
    ExtractionAttributs.ApplicationDeadline,
  );
  let deadlineDate: Date | null = null;
  if (DEADLINE_STRING) {
    deadlineDate = parseDate(DEADLINE_STRING);
  }
  const NOW: Date = getCurrentDate();
  let finalDeadline: Date | null = null;
  if (deadlineDate && deadlineDate > NOW) {
    finalDeadline = deadlineDate;
  }

  const LANGUAGE: string = await aiResponse(JOB_TITLE, ExtractionAttributs.Language);

  const LOCATION_ID: number = await getLocationIDForJob(bodyText, EMPLOYER_ID);

  let jobObject: JobResponse = {
    jobTitle: JOB_TITLE,
    jobDescription: JOB_DESCRIPTION,
    tasks: JOB_TASKS,
    applicationDeadline: finalDeadline,
    language: LANGUAGE,
    LocationID: LOCATION_ID,
    specialty: JOB_SPECIALTY,
  };
  return jobObject;
}

async function extractSingleAttribute(
  SCRAPE_RESULT: IScrapeResult,
  attr: ExtractionAttributs,
): Promise<JobResponse> {
  let jobObject: JobResponse = {
    jobTitle: "",
    jobDescription: "",
    tasks: [],
    applicationDeadline: null,
    language: "",
    specialty: [],
  };

  switch (attr) {
    case ExtractionAttributs.Titel:
      const JOB_TITLE: string = await aiResponse(
        getBodyText(SCRAPE_RESULT, ExtractionAttributs.Titel),
        ExtractionAttributs.Titel,
      );
      jobObject.jobTitle = JOB_TITLE;
      break;
    case ExtractionAttributs.Language:
      const LANGUAGE: string = await aiResponse(
        getBodyText(SCRAPE_RESULT, ExtractionAttributs.Language),
        ExtractionAttributs.Language,
      );
      jobObject.language = LANGUAGE;
      break;
    case ExtractionAttributs.Description:
      const JOB_DESCRIPTION: string = await aiResponse(
        getBodyText(SCRAPE_RESULT, ExtractionAttributs.Description),
        ExtractionAttributs.Description,
      );
      jobObject.jobDescription = JOB_DESCRIPTION;
      break;
    case ExtractionAttributs.Tasks:
      const JOB_TASKS: string[] = await aiResponseTasks(
        ExtractionAttributs.Tasks,
        undefined,
        SCRAPE_RESULT,
      );
      jobObject.tasks = JOB_TASKS;
      break;
    case ExtractionAttributs.ApplicationDeadline:
      const BODY_TEXT: string = getBodyText(SCRAPE_RESULT, ExtractionAttributs.ApplicationDeadline);
      const DEADLINE_STRING: string = await aiResponse(
        BODY_TEXT,
        ExtractionAttributs.ApplicationDeadline,
      );
      let DEADLINE_DATE: Date | null = null;
      if (DEADLINE_STRING) {
        DEADLINE_DATE = parseDate(DEADLINE_STRING);
      }
      const NOW: Date = getCurrentDate();
      const FINAL_DEADLINE: Date = DEADLINE_DATE && DEADLINE_DATE > NOW ? DEADLINE_DATE : null;
      jobObject.applicationDeadline = FINAL_DEADLINE;
      break;
    case ExtractionAttributs.Specialty:
      const JOB_SPECIALTY: string[] = await aiResponseTasks(
        ExtractionAttributs.Specialty,
        getBodyText(SCRAPE_RESULT, ExtractionAttributs.Specialty),
      );
      jobObject.specialty = JOB_SPECIALTY;
      break;
    default:
      break;
  }
  return jobObject;
}

function removeDieStelle(input: string): string {
  let regex: RegExp = /(?<=\.[ ]?)Die Stelle(?=\s+[A-Z])/g;

  return input.replace(regex, "");
}

/**
 * Removes the substring " Ihre Aufgaben" if it appears at the end of a string.
 * @param input The input string to process.
 * @returns The processed string with the substring removed if present at the end.
 */
function removeIhreAufgaben(input: string): string {
  if (input.endsWith(" Ihre Aufgaben")) {
    return input.slice(0, -" Ihre Aufgaben".length);
  }
  return input;
}

async function getLocationIDForJob(jobText: string, employerId: number): Promise<number> {
  let keywordList: IKeywordForEmployer[];
  let employer: IEmployer;
  try {
    const KEYWORD_RESPONSE: AxiosResponse<IKeywordForEmployer[]> = await axios.get(
      `http://localhost:${process.env.DBSERVER_PORT}/database/keyword/${employerId}`,
    );
    keywordList = KEYWORD_RESPONSE.data;

    const EMPLOYER_RESPONSE: AxiosResponse<IEmployer> = await axios.get(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${employerId}`,
    );
    employer = EMPLOYER_RESPONSE.data;
  } catch (err) {
    throw new Error(`Error getting KeywordTable: ${err.message}`);
  }

  for (const KEYWORD of keywordList) {
    if (jobText.toLowerCase().includes(KEYWORD.Keyword.toLowerCase())) {
      return KEYWORD.Location.LocationID;
    }
  }

  return employer.LocationID;
}

export { getBodyText };
