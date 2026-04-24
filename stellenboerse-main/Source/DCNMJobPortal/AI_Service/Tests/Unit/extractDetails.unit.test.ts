import { aiResponse, createAIMessageTemplate, getBodyText } from "../../Services/extractDetails";
import { IScrapeResult } from "../../Services/scraper";
import { test, expect, jest } from "@jest/globals";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { ExtractionAttributs } from "../../../Shared/aiHelpers";
import {
  PLAIN_TEXT_TITEL_EXTRACTION,
  PLAIN_TEXT_DEADLINE_EXTRACT,
  PLAIN_TEXT_LANGUAGE_EXTRACT,
} from "../../Services/prompts";
import { describe } from "node:test";

//ARRANGE
jest.mock("openai", function () {
  return jest.fn().mockImplementation(function () {
    return {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async function () {
            return {
              choices: [
                {
                  finish_reason: "stop",
                  message: {
                    content: JSON.stringify({
                      jobTitle: "Senior Software Engineer",
                    }),
                  },
                },
              ],
            };
          }),
        },
      },
    };
  });
});

const FILEPATH: string = path.join(__dirname, "scraperHTML.txt");
const HTMLCONTENT: string = fs.readFileSync(FILEPATH, "utf8");
const SCRAPE_EXAMPLE: IScrapeResult = {
  HTML: "",
  $: cheerio.load(HTMLCONTENT),
  ETAG: "no E-Tag",
};

describe("createTemplate", function () {
  test("should create the correct AI title template", function () {
    // ARRANGE
    const BODYTEXT: string = "This is a job description text.";
    const EXPECTEDTEMPLATE: string =
      PLAIN_TEXT_TITEL_EXTRACTION + "\n Text: ### \n" + BODYTEXT + "\n ###";
    // ACT

    const RESULT: string = createAIMessageTemplate(BODYTEXT, ExtractionAttributs.Titel);
    // ASSERT
    expect(RESULT).toBe(EXPECTEDTEMPLATE);
  });

  test("should create the correct AI deadline template", function () {
    // ARRANGE
    const BODYTEXT: string = "This is a job description text.";
    const EXPECTEDTEMPLATE: string =
      PLAIN_TEXT_DEADLINE_EXTRACT + "\n Text: ### \n" + BODYTEXT + "\n ###";
    // ACT

    const RESULT: string = createAIMessageTemplate(
      BODYTEXT,
      ExtractionAttributs.ApplicationDeadline,
    );
    // ASSERT
    expect(RESULT).toBe(EXPECTEDTEMPLATE);
  });

  test("should create the correct AI language template", function () {
    // ARRANGE
    const BODYTEXT: string = "This is a job description text.";
    const EXPECTEDTEMPLATE: string =
      PLAIN_TEXT_LANGUAGE_EXTRACT + "\n Text: ### \n" + BODYTEXT + "\n ###";
    // ACT

    const RESULT: string = createAIMessageTemplate(BODYTEXT, ExtractionAttributs.Language);
    // ASSERT
    expect(RESULT).toBe(EXPECTEDTEMPLATE);
  });
});

describe("aiResponse", function () {
  test("should return the correct JobTitel from the AI", async function () {
    //ARRANGE
    const BODYTEXT: string = "Wir suchen einen Senior Software Engineer für unser Team";
    //ACT
    const RESULT: string = await aiResponse(BODYTEXT, ExtractionAttributs.Titel);
    //ASSERT
    expect(RESULT).toEqual("Senior Software Engineer");
  });
});

describe("getBodyText", function () {
  test("body Text is extracted correctly", async function () {
    //Arrange
    const PATH: string = path.join(__dirname, "scraperBody.txt");
    const BODYTEXT: string = fs.readFileSync(PATH, "utf8");

    //Act
    const ANSWER: string = getBodyText(SCRAPE_EXAMPLE);

    //Assert
    expect(ANSWER).toBe(BODYTEXT);
  });

  test("error trying to extract body text", async function () {
    // Arrange
    const mockRemove: jest.Mock = jest.fn();
    const mockText: jest.Mock = jest.fn(function () {
      throw new Error("Cheerio load error");
    });

    const SCRAPE_TEST: IScrapeResult = {
      HTML: "<html><head></head><body><p>Example</p></body></html>",
      $: jest.fn(function () {
        return {
          remove: mockRemove,
          text: mockText,
        };
      }) as object as cheerio.CheerioAPI,
      ETAG: "no E-Tag",
    };

    console.error = jest.fn();

    // Act & Assert
    expect(function () {
      getBodyText(SCRAPE_TEST);
    }).toThrow("Cheerio load error");
    expect(console.error).toHaveBeenCalledWith(
      "Error trying to extract body text:",
      "Cheerio load error",
    );
  });
});
