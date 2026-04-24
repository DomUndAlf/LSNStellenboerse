import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { loadUrls } from "../../Util/fileUtils";
import path from "path";
import { accuracyCount } from "../../Util/accuracyCount";

describe("Integrationstest aiService", function () {
  const JEST_CONSOLE: Console = console;

  beforeEach(function () {
    global.console = require("console");
  });

  afterEach(function () {
    global.console = JEST_CONSOLE;
  });

  it("sollte die URLs korrekt extrahieren und die Erfolgsquote berechnen", async function () {
    // ARRANGE
    const URL_LIST_FILE_PATH: string = path.resolve(__dirname, "../../Util/urlList.json");
    const URLS: string[] = loadUrls(URL_LIST_FILE_PATH);
    const TOTAL_URLS: number = URLS.length;
    const ITERATION: number = 1; //ADJUST ITERATION FOR YOUR NEEDS

    // ACT
    await accuracyCount(ITERATION);

    // ASSERT
    expect(TOTAL_URLS).toBeGreaterThan(0);
  }, 3000000);
});
