import { test, expect, describe } from "@jest/globals";
import {
  checkTag,
  normalizeText,
  ensurePeriod,
  removeFromText,
  cleanJavaScriptContent,
} from "../../Services/preprocessing";

describe("cleanJavaScriptContent", function () {
  test("removes JavaScript variable declarations with objects", function () {
    const input: string =
      "Job Description var StandardText = { title: 'test' } We are looking for a developer.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).toBe("Job Description We are looking for a developer.");
  });

  test("removes JavaScript variable declarations with arrays", function () {
    const input: string = "Job Title var myArray = ['item1', 'item2'] Description here.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).toBe("Job Title Description here.");
  });

  test("removes UI button strings", function () {
    const input: string =
      "Software Developer Position Jetzt bewerben Zurück zur Übersicht We offer great benefits.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).not.toContain("Jetzt bewerben");
    expect(result).not.toContain("Zurück zur Übersicht");
    expect(result).toContain("Software Developer Position");
    expect(result).toContain("We offer great benefits.");
  });

  test("removes English UI strings", function () {
    const input: string =
      "Software Developer Apply Now Back to overview We are hiring experienced developers.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).not.toContain("Apply Now");
    expect(result).not.toContain("Back to overview");
    expect(result).toContain("Software Developer");
    expect(result).toContain("We are hiring experienced developers.");
  });

  test("cleans up excessive whitespace", function () {
    const input: string = "Job   Title    with    lots   of    spaces.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).toBe("Job Title with lots of spaces.");
  });

  test("returns empty string for empty input", function () {
    const result: string = cleanJavaScriptContent("");
    expect(result).toBe("");
  });

  test("preserves normal job content without JS artifacts", function () {
    const input: string =
      "Wir suchen einen erfahrenen Softwareentwickler. Ihre Aufgaben umfassen die Entwicklung von Web-Applikationen.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).toBe(input);
  });

  test("handles complex umantis-style content", function () {
    const input: string =
      "Wissenschaftlicher Mitarbeiter var StandardText = { btn: 'Bewerben' } Jetzt bewerben Wir suchen für unsere Arbeitsgruppe einen Mitarbeiter.";
    const result: string = cleanJavaScriptContent(input);
    expect(result).toContain("Wissenschaftlicher Mitarbeiter");
    expect(result).toContain("Wir suchen für unsere Arbeitsgruppe einen Mitarbeiter.");
    expect(result).not.toContain("StandardText");
    expect(result).not.toContain("Jetzt bewerben");
  });
});

describe("checkTag", function () {
  test("removes HTML tags except ul, li, br, p", function () {
    const input: string = "<div>Test <p>paragraph</p> <ul><li>item</li></ul></div>";
    const result: string = checkTag(input);
    expect(result).toContain("<p>");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>");
    expect(result).not.toContain("<div>");
  });
});

describe("normalizeText", function () {
  test("removes p and br tags and normalizes whitespace", function () {
    const input: string = "<p>Test</p><br>More text";
    const result: string = normalizeText(input);
    expect(result).not.toContain("<p>");
    expect(result).not.toContain("<br>");
  });

  test("collapses multiple spaces to single space", function () {
    const input: string = "Test    with    spaces";
    const result: string = normalizeText(input);
    expect(result).toBe("Test with spaces");
  });
});

describe("ensurePeriod", function () {
  test("adds period if text does not end with one", function () {
    expect(ensurePeriod("Test sentence")).toBe("Test sentence.");
  });

  test("does not add period if text already ends with one", function () {
    expect(ensurePeriod("Test sentence.")).toBe("Test sentence.");
  });

  test("handles empty string", function () {
    expect(ensurePeriod("")).toBe(".");
  });
});

describe("removeFromText", function () {
  test("removes task keywords", function () {
    const input: string = "Your tasks include development.";
    const result: string = removeFromText(input);
    expect(result).not.toContain("Your tasks");
  });
});
