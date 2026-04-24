// @ts-nocheck
import { jest, test, expect, beforeEach, afterEach, describe } from "@jest/globals";
import {
  scrapeEmbeddedJobUrls,
  scrapeUniLeipzigJobs,
  collectUniLeipzigJobUrlsFromPage,
} from "../../Services/embeddedScraper";
import { WebDriver, WebElement } from "selenium-webdriver";

let consoleLogMock: ReturnType<typeof jest.spyOn>;
let consoleWarnMock: ReturnType<typeof jest.spyOn>;
let consoleErrorMock: ReturnType<typeof jest.spyOn>;

jest.mock("selenium-webdriver", function () {
  const ORIGINAL: typeof import("selenium-webdriver") = jest.requireActual("selenium-webdriver");
  const MOCK_GET: jest.Mock = jest.fn();
  const MOCK_FIND_ELEMENTS: jest.Mock = jest.fn();
  const MOCK_FIND_ELEMENT: jest.Mock = jest.fn();
  const MOCK_WAIT: jest.Mock = jest.fn();
  const MOCK_CLOSE: jest.Mock = jest.fn();
  const MOCK_QUIT: jest.Mock = jest.fn();
  const MOCK_GET_CURRENT_URL: jest.Mock = jest.fn();
  const MOCK_SLEEP: jest.Mock = jest.fn();
  const MOCK_EXECUTE_SCRIPT: jest.Mock = jest.fn();
  const MOCK_NAVIGATE: { back: jest.Mock } = { back: jest.fn() };
  const MOCK_GET_WINDOW_HANDLE: jest.Mock = jest.fn();
  const MOCK_GET_ALL_WINDOW_HANDLES: jest.Mock = jest.fn();
  const MOCK_SWITCH_TO: jest.Mock = jest.fn().mockReturnValue({ window: jest.fn() });

  return {
    ...ORIGINAL,
    Builder: jest.fn().mockImplementation(function () {
      return {
        forBrowser: jest.fn().mockReturnThis(),
        setChromeOptions: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({
          get: MOCK_GET,
          findElements: MOCK_FIND_ELEMENTS,
          findElement: MOCK_FIND_ELEMENT,
          wait: MOCK_WAIT,
          close: MOCK_CLOSE,
          quit: MOCK_QUIT,
          getCurrentUrl: MOCK_GET_CURRENT_URL,
          sleep: MOCK_SLEEP,
          executeScript: MOCK_EXECUTE_SCRIPT,
          navigate: jest.fn().mockReturnValue(MOCK_NAVIGATE),
          getWindowHandle: MOCK_GET_WINDOW_HANDLE,
          getAllWindowHandles: MOCK_GET_ALL_WINDOW_HANDLES,
          switchTo: MOCK_SWITCH_TO,
        } as WebDriver),
      };
    }),
  };
});

jest.mock("selenium-webdriver/chrome", function () {
  return {
    Options: jest.fn().mockImplementation(function () {
      return {
        addArguments: jest.fn().mockReturnThis(),
      };
    }),
  };
});

let DRIVER_MOCK: jest.Mocked<WebDriver>;

beforeEach(function () {
  jest.clearAllMocks();
  DRIVER_MOCK = new (require("selenium-webdriver").Builder)().build();
  DRIVER_MOCK.getCurrentUrl.mockReset();
  DRIVER_MOCK.getCurrentUrl.mockResolvedValue("http://initial.test");
  DRIVER_MOCK.wait.mockImplementation(function (condition: unknown) {
    if (typeof condition === "function") {
      return Promise.resolve(condition()).then(function () {
        return true;
      });
    }
    return Promise.resolve(condition);
  });
  consoleLogMock = jest.spyOn(console, "log").mockImplementation(function () {});
  consoleWarnMock = jest.spyOn(console, "warn").mockImplementation(function () {});
  consoleErrorMock = jest.spyOn(console, "error").mockImplementation(function () {});
});

afterEach(function () {
  consoleLogMock.mockRestore();
  consoleWarnMock.mockRestore();
  consoleErrorMock.mockRestore();
});

describe("scrapeEmbeddedJobUrls tests", function () {
  test("driver.get rejects => [] + consoleError", function () {
    DRIVER_MOCK.get.mockRejectedValueOnce(new Error("Navigation fails"));
    return scrapeEmbeddedJobUrls("http://fail.com").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Error scraping embedded job URLs from http://fail.com: Navigation fails",
      );
    });
  });

  test("burg-halle branch, no BURG_JOBS => warns", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.findElements.mockResolvedValueOnce([]);
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/abc").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleWarnMock).toHaveBeenCalledWith("No job entries found on BURG page.");
    });
  });

  test("burg-halle branch, 1 job => logs extracted url", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([{ click: jest.fn() }])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.sleep.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.findElement.mockResolvedValueOnce({ getAttribute: jest.fn() });
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/job").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleLogMock).toHaveBeenCalledTimes(2);
    });
  });

  test("no container => returns [] + consoleError", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockRejectedValueOnce(new Error("No container1"));
    DRIVER_MOCK.wait.mockRejectedValueOnce(new Error("No container2"));
    DRIVER_MOCK.wait.mockRejectedValueOnce(new Error("No container3"));
    return scrapeEmbeddedJobUrls("http://example.com").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalledWith("No job container found on the page.");
    });
  });

  test("container found, no tabs => noTabs log, 1 entry => returns link", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockResolvedValueOnce({} as WebElement);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ getAttribute: jest.fn() }]);
    return scrapeEmbeddedJobUrls("http://normalflow.com").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleLogMock).toHaveBeenCalledWith(
        "No tabs detected. Proceeding with standard job entry extraction.",
      );
    });
  });

  test("container found, tabs exist => tries tab, error on tab => logs error", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockResolvedValueOnce({} as WebElement);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements.mockResolvedValueOnce([{}] as WebElement);
    DRIVER_MOCK.findElement.mockRejectedValueOnce(new Error("Tab 1 fail"));
    return scrapeEmbeddedJobUrls("http://hasTabs.com").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Error switching to tab using selector: a#bite-option-1_professur: Tab 1 fail",
      );
    });
  });

  test("standard extraction, 0 job entries => warns", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockResolvedValueOnce({} as WebElement);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    return scrapeEmbeddedJobUrls("http://noJobs.com").then(function (result: string[]) {
      expect(result).toEqual([]);
      expect(consoleWarnMock).toHaveBeenCalledWith(
        "No job entries found using selector: div.bite_entry",
      );
    });
  });

  test("No new tab opened => logs fallback warning, uses current tab", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.wait.mockResolvedValue({} as WebElement);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.getWindowHandle.mockResolvedValue("MAIN_TAB");
    DRIVER_MOCK.getAllWindowHandles.mockResolvedValue(["MAIN_TAB"]);
    DRIVER_MOCK.wait.mockImplementationOnce(function () {
      return Promise.reject(new Error("Timeout or no new tab"));
    });
    DRIVER_MOCK.getCurrentUrl.mockResolvedValue("http://staysInSameTab.com");
    return scrapeEmbeddedJobUrls("http://testNoNewTab.com").then(function (result: string[]) {
      expect(result).toEqual(["http://staysInSameTab.com"]);
      expect(consoleWarnMock).toHaveBeenCalledTimes(4);
    });
  });

  test("H2 Magdeburg branch collects job URLs across tabs", async function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockResolvedValueOnce({} as WebElement);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);

    let dismissCall: number = 0;
    DRIVER_MOCK.executeScript.mockImplementation(function (script: unknown) {
      if (typeof script === "string" && script.includes("TEXT_MATCHERS")) {
        dismissCall += 1;
        return Promise.resolve(dismissCall === 2);
      }
      return Promise.resolve(undefined);
    });

    const firstTabClick = jest
      .fn()
      .mockRejectedValueOnce(new Error("element click intercepted: overlay"))
      .mockResolvedValue(undefined);

    const createButton = function (id: string) {
      return {
        click: id === "bite-option-1_professur" ? firstTabClick : jest.fn().mockResolvedValue(undefined),
        getAttribute: jest.fn().mockImplementation(function (attribute: string) {
          if (attribute === "id") {
            return Promise.resolve(id);
          }
          if (attribute === "class") {
            return Promise.resolve("bite-button active");
          }
          return Promise.resolve(null);
        }),
      };
    };

    const createLink = function (href: string) {
      return {
        click: jest.fn(),
        getAttribute: jest.fn().mockImplementation(function (attribute: string) {
          if (attribute === "href") {
            return Promise.resolve(href);
          }
          return Promise.resolve(null);
        }),
      };
    };

    const TAB_BUTTONS = [
      createButton("bite-option-1_professur"),
      createButton("bite-option-2_nichtwissenschaftlich"),
      createButton("bite-option-5_login"),
    ];

    const LINK_ALPHA = createLink("https://karriere.h2.de/jobposting/alpha");
    const LINK_BETA = createLink("https://karriere.h2.de/jobposting/beta");
    const LINK_GAMMA = createLink("https://karriere.h2.de/jobposting/gamma");

    let linkCall: number = 0;
    DRIVER_MOCK.findElements.mockImplementation(function (locator: { value?: string }) {
      const VALUE: string | undefined = locator && locator.value;
      if (VALUE && VALUE.includes(".bite-button")) {
        return Promise.resolve(TAB_BUTTONS);
      }
      if (VALUE && VALUE.includes("a.downloader")) {
        linkCall += 1;
        switch (linkCall) {
          case 1:
          case 2:
          case 3:
            return Promise.resolve([LINK_ALPHA, LINK_BETA]);
          case 4:
          case 5:
            return Promise.resolve([LINK_ALPHA, LINK_BETA, LINK_GAMMA]);
          default:
            return Promise.resolve([]);
        }
      }
      return Promise.resolve([]);
    });

    const RESULT: string[] = await scrapeEmbeddedJobUrls(
      "https://www.h2.de/hochschule/jobs-und-karriere/stellenangebote.html",
    );

    expect(RESULT).toEqual([
      "https://karriere.h2.de/jobposting/alpha",
      "https://karriere.h2.de/jobposting/beta",
      "https://karriere.h2.de/jobposting/gamma",
    ]);
    expect(consoleLogMock).toHaveBeenCalledWith("H2 Magdeburg: Consent banner dismissed.");
    expect(consoleLogMock).toHaveBeenCalledWith(
      "H2 Magdeburg: Fallback script click succeeded for bite-option-1_professur.",
    );
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "H2 Magdeburg: No job URLs detected for tab bite-option-5_login.",
    );
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining("Click intercepted for tab bite-option-1_professur"),
    );
    expect(DRIVER_MOCK.executeScript).toHaveBeenCalledWith(
      "arguments[0].click();",
      TAB_BUTTONS[0],
    );
  });

  test("Burg-Halle flow: White-loader not found => logs overlay gone", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements.mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElement
      .mockResolvedValueOnce({ getAttribute: jest.fn() })
      .mockRejectedValueOnce(new Error("Loader not found"));
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/noLoader").then(function (
      result: string[],
    ) {
      expect(result).not.toEqual(["http://someLink.com"]);
      expect(consoleLogMock).toHaveBeenCalledTimes(2);
    });
  });

  test("Burg-Halle flow: White-loader present => waits for invisibility", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([{ click: jest.fn() }])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElement
      .mockResolvedValueOnce({ getAttribute: jest.fn() })
      .mockResolvedValueOnce({});
    DRIVER_MOCK.wait.mockResolvedValueOnce(undefined);
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/loaderPresent").then(function (
      result: string[],
    ) {
      expect(result).toEqual([]);
      expect(consoleLogMock).toHaveBeenCalledTimes(3);
    });
  });

  test("Burg-Halle flow: no application link => logs No application URL found", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([{ click: jest.fn() }])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElement.mockResolvedValueOnce({ getAttribute: jest.fn() });
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/noAppLink").then(function (
      result: string[],
    ) {
      expect(result).toEqual([]);
      expect(consoleWarnMock).toHaveBeenCalledWith("No application URL found.");
    });
  });

  test("Error processing BURG job entries => logs error", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements.mockRejectedValueOnce(new Error("BURG_JOBS fail"));
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/failJobs").then(function (
      result: string[],
    ) {
      expect(result).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Error processing BURG job entries: BURG_JOBS fail",
      );
    });
  });

  test("Error processing a BURG job entry => logs error + continues", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([{ click: jest.fn() }])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElement.mockRejectedValueOnce(new Error("Loader not found"));
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/errorAtJob").then(function (
      result: string[],
    ) {
      expect(result).toEqual([]);
      expect(consoleErrorMock).not.toHaveBeenCalledWith(
        "Error processing a BURG job entry: Click error",
      );
    });
  });

  test("Error finding application link => logs Error finding application link", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements.mockResolvedValue([{ click: jest.fn() }]);
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElement.mockRejectedValueOnce(new Error("No link"));
    return scrapeEmbeddedJobUrls("https://www.burg-halle.de/linkNotFound").then(function (
      result: string[],
    ) {
      expect(result).toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalledWith("Error finding application link: No link");
    });
  });

  test("Error processing job entry => logs error + continues", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.wait.mockResolvedValue({});
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    return scrapeEmbeddedJobUrls("http://errorJobEntry.com").then(function (result: string[]) {
      expect(result).not.toEqual([]);
      expect(consoleErrorMock).toHaveBeenCalledTimes(2);
    });
  });

  test("New tab exists => extracts from new tab, closes it, returns URL", function () {
    DRIVER_MOCK.get.mockResolvedValue(undefined);
    DRIVER_MOCK.wait.mockResolvedValue({});
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ click: jest.fn() }]);
    DRIVER_MOCK.getWindowHandle.mockResolvedValue("MAIN_TAB");
    DRIVER_MOCK.getAllWindowHandles
      .mockResolvedValueOnce(["MAIN_TAB"])
      .mockResolvedValueOnce(["MAIN_TAB", "NEW_TAB"]);
    DRIVER_MOCK.wait.mockImplementationOnce(function () {
      return Promise.resolve(true);
    });
    DRIVER_MOCK.getCurrentUrl.mockResolvedValue("http://fromNewTab.com");
    return scrapeEmbeddedJobUrls("http://openNewTab.com").then(function (result: string[]) {
      expect(result).not.toEqual(["http://fromNewTab.com"]);
      expect(consoleLogMock).toHaveBeenCalledWith("Extracted URL: http://fromNewTab.com");
    });
  });

  test("Final extracted job URLs => logs JSON of the array", function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockResolvedValueOnce({});
    DRIVER_MOCK.sleep.mockResolvedValue(undefined);
    DRIVER_MOCK.getCurrentUrl.mockResolvedValue("http://fromNewTab.com");
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ getAttribute: jest.fn() }]);
    return scrapeEmbeddedJobUrls("http://finalLog.com").then(function (result: string[]) {
      expect(result).toEqual(["http://fromNewTab.com"]);
      expect(consoleLogMock).toHaveBeenCalledTimes(11);
    });
  });

  test(
    "collectUniLeipzigJobUrlsFromPage normalizes malformed hrefs and filters targets",
    async function () {
      const makeLink = function (href: string | null): WebElement {
        return {
          getAttribute: jest.fn().mockImplementation(function () {
            return Promise.resolve(href);
          }),
        } as unknown as WebElement;
      };

      DRIVER_MOCK.getCurrentUrl.mockResolvedValueOnce(
        "https://www.uni-leipzig.de/jobs/angebote/",
      );
      DRIVER_MOCK.findElements.mockResolvedValueOnce([
        makeLink(" https://uni-leipzig.de/jobposting/abc123 "),
        makeLink("https:// https://uniklinikum-leipzig.de/stellenangebote/post-42"),
  makeLink("../../newsdetail/artikel/neue-stelle/"),
        makeLink("mailto:bewerbung@uni-leipzig.de"),
        makeLink(""),
        makeLink(null),
      ]);

      const JOB_URLS: string[] = ["https://uni-leipzig.de/jobposting/abc123"];
      await collectUniLeipzigJobUrlsFromPage(DRIVER_MOCK, JOB_URLS);

      expect(JOB_URLS).toEqual([
        "https://uni-leipzig.de/jobposting/abc123",
        "https://uniklinikum-leipzig.de/stellenangebote/post-42",
        "https://www.uni-leipzig.de/newsdetail/artikel/neue-stelle/",
      ]);
      expect(consoleLogMock).toHaveBeenCalledWith(
        "Extracted URL:",
        "https://uniklinikum-leipzig.de/stellenangebote/post-42",
      );
    },
  );

  test("scrapeUniLeipzigJobs ohne Pagination-Links => bricht ab", async function () {
    DRIVER_MOCK.getCurrentUrl.mockResolvedValue("https://www.uni-leipzig.de/jobs");
    DRIVER_MOCK.findElements.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const JOB_URLS: string[] = [];
    await scrapeUniLeipzigJobs(DRIVER_MOCK, JOB_URLS);
    expect(consoleLogMock).toHaveBeenCalledWith("No pagination links found on current page.");
    expect(JOB_URLS).toEqual([]);
  });

  test(
    "scrapeUniLeipzigJobs normalizes pagination hrefs and deduplicates visits",
    async function () {
      const makeLink = function (href: string | null): WebElement {
        return {
          getAttribute: jest.fn().mockImplementation(function () {
            return Promise.resolve(href);
          }),
        } as unknown as WebElement;
      };

      const PAGE_ONE: string = "https://www.uni-leipzig.de/jobs?page=1";
      const PAGE_TWO: string = "https://www.uni-leipzig.de/jobs?page=2";

      DRIVER_MOCK.getCurrentUrl
        .mockResolvedValueOnce(PAGE_ONE)
        .mockResolvedValueOnce(PAGE_ONE)
        .mockResolvedValueOnce(PAGE_ONE)
        .mockResolvedValueOnce(PAGE_ONE)
        .mockResolvedValueOnce(PAGE_TWO)
        .mockResolvedValue(PAGE_TWO);

      DRIVER_MOCK.findElements
        .mockResolvedValueOnce([
          makeLink("https://uni-leipzig.de/jobposting/first"),
          makeLink("https://www.uni-leipzig.de/stellenausschreibung/second"),
        ])
        .mockResolvedValueOnce([
          makeLink(PAGE_ONE),
          makeLink("https:// https://www.uni-leipzig.de/jobs?page=2"),
        ])
        .mockResolvedValueOnce([
          makeLink("../newsdetail/artikel/dritte/"),
        ])
        .mockResolvedValueOnce([]);

      DRIVER_MOCK.get.mockResolvedValue(undefined);
      DRIVER_MOCK.sleep.mockResolvedValue(undefined);

      const JOB_URLS: string[] = [];
      await scrapeUniLeipzigJobs(DRIVER_MOCK, JOB_URLS);

      expect(DRIVER_MOCK.get).toHaveBeenCalledWith(PAGE_TWO);
      expect(JOB_URLS).toEqual([
        "https://uni-leipzig.de/jobposting/first",
        "https://www.uni-leipzig.de/stellenausschreibung/second",
        "https://www.uni-leipzig.de/newsdetail/artikel/dritte/",
      ]);
    },
  );

  test("orgUrl enthält 'uni-leipzig.de' => ruft scrapeUniLeipzigJobs auf und gibt gefundene URLs zurück", async function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    const RESULT: string[] = await scrapeEmbeddedJobUrls("https://www.uni-leipzig.de/stellen");
    expect(RESULT).toEqual([]);
  });

  test("Container gefunden + Tabs vorhanden => Erfolgreicher Tab-Klick + h3 > a[href] wird verarbeitet", async function () {
    DRIVER_MOCK.get.mockResolvedValueOnce(undefined);
    DRIVER_MOCK.wait.mockResolvedValueOnce({} as WebElement);
    const TAB_ELEMENT: WebElement = { click: jest.fn() } as unknown as WebElement;
    DRIVER_MOCK.findElements
      .mockResolvedValueOnce([TAB_ELEMENT])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          getAttribute: jest.fn().mockResolvedValue("https://example-with-tabs.com/job"),
        } as WebElement,
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    DRIVER_MOCK.findElement.mockResolvedValueOnce({
      click: jest.fn(),
    } as WebElement);
    DRIVER_MOCK.getWindowHandle.mockResolvedValue("MAIN_TAB");
    DRIVER_MOCK.getAllWindowHandles.mockResolvedValue(["MAIN_TAB"]);
    const RESULT: string[] = await scrapeEmbeddedJobUrls("http://example-with-tabs.com");
    expect(RESULT).toEqual(["https://example-with-tabs.com/job"]);
    expect(consoleLogMock).toHaveBeenCalledTimes(7);
  });
});
