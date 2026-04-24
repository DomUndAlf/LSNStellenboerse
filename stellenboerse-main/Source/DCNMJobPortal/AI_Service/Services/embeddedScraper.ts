import { Builder, By, until, WebDriver, WebElement } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

type SeleniumElement = {
  click(): Promise<void>;
  getAttribute(attribute: string): Promise<string | null>;
};

/**
 * Scrapes job URLs from embedded job boards using Selenium.
 * @param orgUrl - The organization's embedded job board URL.
 * @returns A promise that resolves to an array of extracted job URLs.
 */
export async function scrapeEmbeddedJobUrls(orgUrl: string): Promise<string[]> {
  const OPTIONS: chrome.Options = new chrome.Options();
  OPTIONS.addArguments("--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage");

  const DRIVER: WebDriver = new Builder().forBrowser("chrome").setChromeOptions(OPTIONS).build();
  const JOB_URLS: string[] = [];

  try {
    console.log(`Navigating to URL: ${orgUrl}`);
    await DRIVER.get(orgUrl);

    if (orgUrl.includes("bav.bund.de")) {
      await scrapeDeutscherWetterdienst(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("uni-leipzig.de")) {
      await scrapeUniLeipzigJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("cyberagentur.de")) {
      await scrapeCyberagenturJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("htwk-leipzig.de")) {
      await scrapeHTWKLeipzigJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("hmt-leipzig.de")) {
      await scrapeHMTLeipzigJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("karriere.leipzig.de/stellenangebote")) {
      await scrapeKarriereLeipzigJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("h2.de/hochschule/jobs-und-karriere/stellenangebote")) {
      await scrapeH2MagdeburgJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("ipk-gatersleben.de")) {
      await scrapeIPKGaterslebenJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    // Note: UFZ (ufz.de) does NOT need embedded scraping.
    // All job URLs are present in the static HTML via onclick attributes.
    // The normal crawler extracts them correctly.

    // HGB Leipzig - BITE widget with stellen.hgb-leipzig.de links
    if (orgUrl.includes("hgb-leipzig.de")) {
      await scrapeHGBLeipzigJobs(DRIVER, JOB_URLS);
      return JOB_URLS;
    }

    if (orgUrl.includes("burg-halle.de")) {
      await scrapeBurgHalleJobs(DRIVER, JOB_URLS);
    } else {
      const CONTAINER_SELECTORS: string[] = [
        "div[data-bite-jobs-api-listing]", // HMT
        "div.bite_container", // HGB
        "ul.result-list", // BGK
      ];

      const ENTRY_SELECTORS: string[] = [
        "div.bite_entry", // HMT
        "div.bite_container--entry", // HGB - new BITE widget format
        "div.bite_container", // HGB - old format
        "h3 > a[href]", // FLI
        "a.downloader", // H2
      ];

      const TAB_SELECTORS: string[] = [
        "a#bite-option-1_professur",
        "a#bite-option-2_nichtwissenschaftlich",
        "a#bite-option-3_wissenschaftlich",
      ];

      let jobContainer: WebElement | null = null;
      for (const CONTAINER_SELECTOR of CONTAINER_SELECTORS) {
        try {
          const LOCATED: WebElement = await DRIVER.wait(
            until.elementLocated(By.css(CONTAINER_SELECTOR)),
            10000,
          );
          jobContainer = LOCATED;
          console.log(`Job container found using selector: ${CONTAINER_SELECTOR}`);
          break;
        } catch {
          console.warn(`No container found using selector: ${CONTAINER_SELECTOR}`);
        }
      }

      if (!jobContainer) {
        console.error("No job container found on the page.");
        return JOB_URLS;
      }

      await DRIVER.sleep(2000);

      try {
        const TABS: SeleniumElement[] = await DRIVER.findElements(By.css(TAB_SELECTORS.join(",")));
        if (TABS.length > 0) {
          console.log(`Tabs detected: ${TABS.length}`);
          for (const TAB_SELECTOR of TAB_SELECTORS) {
            try {
              const TAB: SeleniumElement = await DRIVER.findElement(By.css(TAB_SELECTOR));
              await TAB.click();
              console.log(`Switched to tab using selector: ${TAB_SELECTOR}`);
              await DRIVER.sleep(2000);

              for (const ENTRY_SELECTOR of ENTRY_SELECTORS) {
                try {
                  const JOB_ENTRIES: SeleniumElement[] = await DRIVER.findElements(
                    By.css(ENTRY_SELECTOR),
                  );
                  const ORIGINAL_TAB: string = await DRIVER.getWindowHandle();

                  if (JOB_ENTRIES.length > 0) {
                    console.log(
                      `Found ${JOB_ENTRIES.length} job entries using selector: ${ENTRY_SELECTOR} (Tab: ${TAB_SELECTOR})`,
                    );

                    for (const [INDEX, JOB_ENTRY] of JOB_ENTRIES.entries()) {
                      try {
                        if (
                          ENTRY_SELECTOR === "h3 > a[href]" ||
                          ENTRY_SELECTOR === "a.downloader"
                        ) {
                          const JOB_URL: string | null = await JOB_ENTRY.getAttribute("href");
                          if (JOB_URL) {
                            console.log(`Extracted URL: ${JOB_URL}`);
                            JOB_URLS.push(JOB_URL);
                          } else {
                            console.warn("No URL found for this job entry.");
                          }
                        } else {
                          await DRIVER.executeScript(
                            "arguments[0].scrollIntoView(true);",
                            JOB_ENTRY,
                          );

                          const INITIAL_TABS: string[] = await DRIVER.getAllWindowHandles();
                          console.log(
                            `Clicking on job entry ${INDEX + 1}/${JOB_ENTRIES.length}. (Tab: ${TAB_SELECTOR})`,
                          );

                          await JOB_ENTRY.click();

                          await DRIVER.wait(async function (): Promise<boolean> {
                            const TABS_NOW: string[] = await DRIVER.getAllWindowHandles();
                            return TABS_NOW.length > INITIAL_TABS.length;
                          }, 5000).catch(function () {
                            console.warn("No new tab opened, using current tab.");
                          });

                          const NEW_TABS: string[] = await DRIVER.getAllWindowHandles();
                          const NEW_TAB: string | undefined = NEW_TABS.find(function (tab: string) {
                            return !INITIAL_TABS.includes(tab);
                          });

                          if (NEW_TAB) {
                            await DRIVER.switchTo().window(NEW_TAB);
                            const JOB_URL: string = await DRIVER.getCurrentUrl();
                            console.log(`Extracted URL: ${JOB_URL}`);
                            JOB_URLS.push(JOB_URL);

                            await DRIVER.close();
                            await DRIVER.switchTo().window(ORIGINAL_TAB);
                          } else {
                            const JOB_URL: string = await DRIVER.getCurrentUrl();
                            console.log(`Extracted URL (no new tab): ${JOB_URL}`);
                            JOB_URLS.push(JOB_URL);
                          }
                        }
                      } catch (error) {
                        console.error(
                          `Error processing job entry ${INDEX + 1} (Tab: ${TAB_SELECTOR}): ${error.message}`,
                        );
                        continue;
                      }
                    }
                  } else {
                    console.warn(
                      `No job entries found using selector: ${ENTRY_SELECTOR} (Tab: ${TAB_SELECTOR})`,
                    );
                  }
                } catch (error) {
                  console.warn(
                    `Error with ENTRY_SELECTOR ${ENTRY_SELECTOR} (Tab: ${TAB_SELECTOR}): ${error.message}`,
                  );
                }
              }
            } catch (error) {
              console.error(
                `Error switching to tab using selector: ${TAB_SELECTOR}: ${error.message}`,
              );
            }
          }
        } else {
          console.log("No tabs detected. Proceeding with standard job entry extraction.");
        }
      } catch (error) {
        console.error(`Error detecting tabs: ${error.message}`);
      }

      for (const ENTRY_SELECTOR of ENTRY_SELECTORS) {
        try {
          const JOB_ENTRIES: SeleniumElement[] = await DRIVER.findElements(By.css(ENTRY_SELECTOR));
          const ORIGINAL_TAB: string = await DRIVER.getWindowHandle();

          if (JOB_ENTRIES.length > 0) {
            console.log(
              `Found ${JOB_ENTRIES.length} job entries using selector: ${ENTRY_SELECTOR}`,
            );

            for (const [INDEX, JOB_ENTRY] of JOB_ENTRIES.entries()) {
              try {
                if (ENTRY_SELECTOR === "h3 > a[href]" || ENTRY_SELECTOR === "a.downloader") {
                  const JOB_URL: string | null = await JOB_ENTRY.getAttribute("href");
                  if (JOB_URL) {
                    console.log(`Extracted URL: ${JOB_URL}`);
                    JOB_URLS.push(JOB_URL);
                  } else {
                    console.warn("No URL found for this job entry.");
                  }
                } else {
                  await DRIVER.executeScript("arguments[0].scrollIntoView(true);", JOB_ENTRY);

                  const INITIAL_TABS: string[] = await DRIVER.getAllWindowHandles();
                  console.log(`Clicking on job entry ${INDEX + 1}/${JOB_ENTRIES.length}.`);
                  await JOB_ENTRY.click();

                  await DRIVER.wait(async function (): Promise<boolean> {
                    const TABS_NOW: string[] = await DRIVER.getAllWindowHandles();
                    return TABS_NOW.length > INITIAL_TABS.length;
                  }, 5000).catch(function () {
                    console.warn("No new tab opened, using current tab.");
                  });

                  const NEW_TABS: string[] = await DRIVER.getAllWindowHandles();
                  const NEW_TAB: string | undefined = NEW_TABS.find(function (tab: string) {
                    return !INITIAL_TABS.includes(tab);
                  });

                  if (NEW_TAB) {
                    await DRIVER.switchTo().window(NEW_TAB);
                    const JOB_URL: string = await DRIVER.getCurrentUrl();
                    console.log(`Extracted URL: ${JOB_URL}`);
                    JOB_URLS.push(JOB_URL);

                    await DRIVER.close();
                    await DRIVER.switchTo().window(ORIGINAL_TAB);
                  } else {
                    const JOB_URL: string = await DRIVER.getCurrentUrl();
                    console.log(`Extracted URL (no new tab): ${JOB_URL}`);
                    JOB_URLS.push(JOB_URL);
                  }
                }
              } catch (error) {
                console.error(`Error processing job entry ${INDEX + 1}: ${error.message}`);
                continue;
              }
            }
          } else {
            console.warn(`No job entries found using selector: ${ENTRY_SELECTOR}`);
          }
        } catch (error) {
          console.warn(`Error with ENTRY_SELECTOR ${ENTRY_SELECTOR}: ${error.message}`);
        }
      }
    }

    console.log(`Final extracted job URLs: ${JSON.stringify(JOB_URLS, null, 2)}`);
    return JOB_URLS;
  } catch (error) {
    console.error(`Error scraping embedded job URLs from ${orgUrl}: ${error.message}`);
    return [];
  } finally {
    await DRIVER.quit();
  }
}

/**
 * Custom function to scrape job postings from the DeutscherWetterdienst website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the University of Leipzig have been processed.
 */
export async function scrapeDeutscherWetterdienst(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  console.log("Starting scrapeDeutscherWetterdienst");

  console.log("Collecting links from current page...");
  await collectDeutscherWetterdienstJobUrlsFromPage(driver, jobUrls);
  console.log("Collected so far:", JSON.stringify(jobUrls, null, 2));

  jobUrls.splice(0, jobUrls.length, ...Array.from(new Set(jobUrls)));
  console.log("After deduplication:", JSON.stringify(jobUrls, null, 2));

  console.log("Finished scrapeDeutscherWetterdienst. Total job URLs:", jobUrls.length);
}

/**
 * Custom function to scrape job postings from the IPK-Gatersleben website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the University of Leipzig have been processed.
 */
export async function scrapeIPKGaterslebenJobs(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  console.log("Starting scrapeIPKGaterslebenJobs");

  const VISITED: Set<string> = new Set<string>();
  let initialHref: string | null = null;

  console.log("Collecting links from current page...");
  await collectIPKGaterslebenJobUrlsFromPage(driver, jobUrls);
  console.log("Collected so far:", JSON.stringify(jobUrls, null, 2));

  jobUrls.splice(0, jobUrls.length, ...Array.from(new Set(jobUrls)));
  console.log("After deduplication:", JSON.stringify(jobUrls, null, 2));

  const LINKS: WebElement[] = await driver.findElements(By.css(".page-link"));
  if (LINKS.length === 0) {
    console.log("No pagination links found. Stopping.");
  } else {
    const NEW_HREFS: Set<string> = new Set();
    for (const LINK_EL of LINKS) {
      try {
        const HREF: string | null = await LINK_EL.getAttribute("href");
        if (HREF && !VISITED.has(HREF)) {
          NEW_HREFS.add(HREF);
        }
      } catch {}
    }

    if (initialHref === null && NEW_HREFS.size > 0) {
      initialHref = Array.from(NEW_HREFS)[0];
      console.log("Set initialHref to:", initialHref);
    }

    if (initialHref) {
      NEW_HREFS.delete(initialHref);
    }

    for (const HREF of Array.from(NEW_HREFS)) {
      VISITED.add(HREF);
      console.log("Navigating to next page:", HREF);
      await driver.get(HREF);
      await driver.sleep(1000);
      await collectIPKGaterslebenJobUrlsFromPage(driver, jobUrls);

      jobUrls.splice(0, jobUrls.length, ...Array.from(new Set(jobUrls)));
      console.log("After visiting", HREF, "deduplicated list:", JSON.stringify(jobUrls, null, 2));
    }
  }

  console.log("Finished scrapeIPKGaterslebenJobs Total job URLs:", jobUrls.length);
}

/**
 * Custom function to scrape job postings from the HTWK Leipzig website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 */
async function scrapeHTWKLeipzigJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  const ROOT_SELECTOR: string = "div[data-bite-jobs-api-listing]";
  const JOB_LINK_SELECTOR: string = "a[href*='jobs.htwk-leipzig.de/jobposting/']";
  const NEXT_BUTTON_SELECTOR: string = ".bite-jobs-api-ui-pagination__link-next";

  await driver.wait(until.elementLocated(By.css(ROOT_SELECTOR)), 10000).catch(() => {
    console.warn("HTWK root container not found within timeout.");
  });

  await driver.wait(until.elementLocated(By.css(JOB_LINK_SELECTOR)), 15000).catch(() => {
    console.warn("No HTWK job links detected within timeout.");
  });

  const SEEN_URLS: Set<string> = new Set(jobUrls);

  const collectLinks = async (): Promise<void> => {
    const LINK_ELEMENTS: SeleniumElement[] = await driver.findElements(By.css(JOB_LINK_SELECTOR));
    for (const LINK_ELEMENT of LINK_ELEMENTS) {
      const HREF: string | null = await LINK_ELEMENT.getAttribute("href");
      if (HREF && HREF.includes("jobs.htwk-leipzig.de/jobposting/")) {
        if (!SEEN_URLS.has(HREF)) {
          SEEN_URLS.add(HREF);
          jobUrls.push(HREF);
          console.log(`Collected HTWK job URL: ${HREF}`);
        }
      }
    }
  };

  const isButtonDisabled = async (button: WebElement): Promise<boolean> => {
    const CLASS_NAME: string = (await button.getAttribute("class")) || "";
    const ARIA_DISABLED: string | null = await button.getAttribute("aria-disabled");
    return (
      CLASS_NAME.includes("bite-jobs-api-ui-pagination__link--disabled") ||
      ARIA_DISABLED === "true"
    );
  };

  await collectLinks();

  while (true) {
    const NEXT_BUTTONS: WebElement[] = await driver.findElements(By.css(NEXT_BUTTON_SELECTOR));
    let nextButton: WebElement | null = null;

    for (const BUTTON of NEXT_BUTTONS) {
      if (!(await isButtonDisabled(BUTTON))) {
        nextButton = BUTTON;
        break;
      }
    }

    if (!nextButton) {
      console.log("No further HTWK pagination detected.");
      break;
    }

    const CURRENT_LINK_ELEMENTS: SeleniumElement[] = await driver.findElements(
      By.css(JOB_LINK_SELECTOR),
    );
    const PREVIOUS_FIRST_LINK: string = CURRENT_LINK_ELEMENTS.length
      ? (await CURRENT_LINK_ELEMENTS[0].getAttribute("href")) || ""
      : "";

    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", nextButton);
    await driver.wait(until.elementIsVisible(nextButton), 5000).catch(() => undefined);

    await nextButton.click();

    await driver.wait(async () => {
      const CURRENT_LINKS: SeleniumElement[] = await driver.findElements(By.css(JOB_LINK_SELECTOR));
      if (CURRENT_LINKS.length === 0) {
        return false;
      }

      const FIRST_LINK: string | null = await CURRENT_LINKS[0].getAttribute("href");
      if (FIRST_LINK && FIRST_LINK !== PREVIOUS_FIRST_LINK) {
        return true;
      }

      for (const LINK of CURRENT_LINKS) {
        const HREF: string | null = await LINK.getAttribute("href");
        if (HREF && !SEEN_URLS.has(HREF)) {
          return true;
        }
      }

      return false;
    }, 7000).catch(() => undefined);

    await driver.sleep(500);
    await collectLinks();
  }

  console.log(`Finished scrapeHTWKLeipzigJobs with ${jobUrls.length} URLs collected.`);
}

/**
 * Custom function to scrape job postings from the HMT Leipzig bite jobs widgets.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 */
async function scrapeHMTLeipzigJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  const LISTING_SELECTOR: string = "div[data-bite-jobs-api-listing]";
  const ENTRY_SELECTOR: string = "div[data-bite-jobs-api-listing] div.bite_entry";
  const TARGET_SUBSTRING: string = "stelle.pro/jobposting/";
  const COLLECTOR_GLOBAL: string = "__hmtJobCollector__";
  const ORIGINAL_OPEN_GLOBAL: string = "__hmtOriginalWindowOpen__";

  await driver.wait(until.elementLocated(By.css(LISTING_SELECTOR)), 15000).catch(() => {
    console.warn("HMT listing containers not found within timeout.");
  });

  await driver.wait(async () => {
    const ENTRIES: WebElement[] = await driver.findElements(By.css(ENTRY_SELECTOR));
    return ENTRIES.length > 0;
  }, 15000).catch(() => {
    console.warn("HMT bite entries not loaded within timeout.");
  });

  const ROOT_URL: string = await driver.getCurrentUrl();
  const ROOT_SUBSTRING: string = "hmt-leipzig.de/aktuelles/stellenausschreibungen";

  const SEEN_URLS: Set<string> = new Set(jobUrls);
  await driver.executeScript(
    `
    const collectorKey = arguments[0];
    const originalKey = arguments[1];
    window[collectorKey] = [];
    if (!window[originalKey]) {
      window[originalKey] = window.open;
    }
    window.open = function(url) {
      if (url) {
        window[collectorKey].push(url);
      }
      return null;
    };
  `,
    COLLECTOR_GLOBAL,
    ORIGINAL_OPEN_GLOBAL,
  );

  const ENTRY_COUNT: number = (await driver.findElements(By.css(ENTRY_SELECTOR))).length;

  for (let index: number = 0; index < ENTRY_COUNT; index++) {
    try {
      const ENTRIES: WebElement[] = await driver.findElements(By.css(ENTRY_SELECTOR));
      if (index >= ENTRIES.length) {
        break;
      }

      const ENTRY: WebElement = ENTRIES[index];
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", ENTRY);
      await driver.sleep(150);

      const BEFORE_COUNT: number = await driver.executeScript(
        "return (window[arguments[0]] && window[arguments[0]].length) || 0;",
        COLLECTOR_GLOBAL,
      );

      await driver.executeScript(
        `
        const element = arguments[0];
        if (!element) {
          return false;
        }
        const event = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          button: 0,
          buttons: 1,
          view: window,
        });
        Object.defineProperty(event, 'which', { get: () => 1 });
        element.dispatchEvent(event);
        return true;
      `,
        ENTRY,
      );

      await driver.wait(async () => {
        const CURRENT_COUNT: number = await driver.executeScript(
          "return (window[arguments[0]] && window[arguments[0]].length) || 0;",
          COLLECTOR_GLOBAL,
        );
        return CURRENT_COUNT > BEFORE_COUNT;
      }, 2000).catch(() => undefined);

      await driver.sleep(150);
    } catch (error) {
      console.warn(`Error processing HMT entry ${index + 1}: ${error.message}`);
    }
  }

  const COLLECTED_URLS: string[] = ((await driver.executeScript(
    "return window[arguments[0]] || [];",
    COLLECTOR_GLOBAL,
  )) || []) as string[];

  await driver.executeScript(
    `
    const collectorKey = arguments[0];
    const originalKey = arguments[1];
    if (window[originalKey]) {
      window.open = window[originalKey];
      delete window[originalKey];
    }
    if (window[collectorKey]) {
      delete window[collectorKey];
    }
  `,
    COLLECTOR_GLOBAL,
    ORIGINAL_OPEN_GLOBAL,
  ).catch(() => undefined);

  for (const URL of COLLECTED_URLS) {
    if (URL.includes(ROOT_SUBSTRING)) {
      console.log(`Skipped HMT landing page URL: ${URL}`);
      continue;
    }

    if (URL.includes(TARGET_SUBSTRING) && !SEEN_URLS.has(URL)) {
      SEEN_URLS.add(URL);
      jobUrls.push(URL);
      console.log(`Collected HMT job URL: ${URL}`);
    } else {
      console.log(`Skipped non-HMT job URL: ${URL}`);
    }
  }

  jobUrls.splice(
    0,
    jobUrls.length,
    ...jobUrls.filter((url: string): boolean => !url.includes(ROOT_SUBSTRING)),
  );

  console.log(`Finished scrapeHMTLeipzigJobs with ${jobUrls.length} URLs collected.`);
}

/**
 * Custom function to scrape job postings from the Hochschule Magdeburg (H2) bite jobs widgets.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 */
export async function scrapeH2MagdeburgJobs(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  const ROOT_SELECTOR: string = "div[data-bite-jobs-api-listing]";
  const BUTTON_SELECTOR: string = `${ROOT_SELECTOR} .bite-button`;
  const LINK_SELECTOR: string = `${ROOT_SELECTOR} a.downloader[href]`;
  const TAB_DELAY_MS: number = 1200;
  const WAIT_FOR_BUTTONS_TIMEOUT_MS: number = 8000;
  const WAIT_FOR_LINKS_TIMEOUT_MS: number = 6000;

  const ROOT_ELEMENT: WebElement | null = await driver
    .wait(until.elementLocated(By.css(ROOT_SELECTOR)), 15000)
    .catch(() => null);

  if (!ROOT_ELEMENT) {
    console.error("H2 Magdeburg: No bite listing container found within timeout.");
    return;
  }

  const SEEN_URLS: Set<string> = new Set(jobUrls);

  const dismissConsentBanner = async (): Promise<boolean> => {
    try {
      const DISMISSED: boolean = (await driver.executeScript(
        `
          const TEXT_MATCHERS = ${JSON.stringify([
            "akzeptieren",
            "alle akzeptieren",
            "zustimmen",
            "accept all",
            "accept",
          ])};
          const BUTTON_SELECTORS = ${JSON.stringify([
            "button.ccm--button-accept",
            "button.ccm--btn-accept",
            "button[data-ccm-action='accept']",
            "button[data-accept]",
            "button[aria-label='Akzeptieren']",
            "button[title='Akzeptieren']",
          ])};
          let button = null;
          for (const selector of BUTTON_SELECTORS) {
            const candidate = document.querySelector(selector);
            if (candidate) {
              button = candidate;
              break;
            }
          }
          if (!button) {
            const candidates = Array.from(document.querySelectorAll('button, a'));
            button = candidates.find((element) => {
              if (!element || typeof element.textContent !== 'string') {
                return false;
              }
              const text = element.textContent.trim().toLowerCase();
              return TEXT_MATCHERS.some((match) => text.includes(match));
            }) || null;
          }
          if (!button) {
            const overlay = document.querySelector('.ccm--container, .ccm--modal, .ccm--overlay');
            if (overlay && overlay instanceof HTMLElement) {
              overlay.style.display = 'none';
              return true;
            }
            return false;
          }
          if (button instanceof HTMLElement) {
            button.click();
            return true;
          }
          return false;
        `,
      )) as boolean;

      if (DISMISSED) {
        console.log("H2 Magdeburg: Consent banner dismissed.");
        await driver.sleep(600);
      }

      return DISMISSED;
    } catch (error) {
      console.warn(
        `H2 Magdeburg: Error attempting to dismiss consent banner: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  };

  const waitForButtonsAvailable = async (): Promise<boolean> => {
    return driver
      .wait(async () => {
        const ELEMENTS: WebElement[] = await driver.findElements(By.css(BUTTON_SELECTOR));
        return ELEMENTS.length > 0;
      }, WAIT_FOR_BUTTONS_TIMEOUT_MS)
      .then(() => true)
      .catch(() => false);
  };

  const waitForDownloaderLinks = async (): Promise<boolean> => {
    return driver
      .wait(async () => {
        const LINKS: WebElement[] = await driver.findElements(By.css(LINK_SELECTOR));
        return LINKS.length > 0;
      }, WAIT_FOR_LINKS_TIMEOUT_MS)
      .then(() => true)
      .catch(() => false);
  };

  await waitForButtonsAvailable();
  await waitForDownloaderLinks();
  await dismissConsentBanner();

  const collectLinksForContext = async (context: string): Promise<number> => {
    await waitForDownloaderLinks();

    const LINKS: SeleniumElement[] = await driver.findElements(By.css(LINK_SELECTOR));
    let collected: number = 0;

    for (const LINK of LINKS) {
      const HREF: string | null = await LINK.getAttribute("href");
      if (HREF && HREF.trim().length > 0 && /^https?:\/\//i.test(HREF)) {
        if (!SEEN_URLS.has(HREF)) {
          SEEN_URLS.add(HREF);
          jobUrls.push(HREF);
          collected++;
          console.log(`H2 Magdeburg (${context}): Collected job URL ${HREF}`);
        }
      }
    }

    return collected;
  };

  const TAB_BUTTONS: WebElement[] = (await driver.findElements(By.css(BUTTON_SELECTOR))) as WebElement[];

  if (TAB_BUTTONS.length === 0) {
    console.warn("H2 Magdeburg: No tab buttons detected, collecting visible entries only.");
    const DEFAULT_COUNT: number = await collectLinksForContext("default");
    if (DEFAULT_COUNT === 0) {
      console.warn("H2 Magdeburg: No job URLs found on default view.");
    }
    return;
  }

  for (let index: number = 0; index < TAB_BUTTONS.length; index++) {
    const TAB_BUTTON: WebElement = TAB_BUTTONS[index];
    const TAB_ID: string = (await TAB_BUTTON.getAttribute("id")) || `tab-${index + 1}`;

    try {
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", TAB_BUTTON);
    } catch (error) {
      console.warn(`H2 Magdeburg: Unable to scroll to tab ${TAB_ID}: ${error.message}`);
    }

    let tabClicked: boolean = false;
    try {
      await TAB_BUTTON.click();
      tabClicked = true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("element click intercepted")) {
        console.warn(`H2 Magdeburg: Click intercepted for tab ${TAB_ID}: ${error.message}`);
        const DISMISSED: boolean = await dismissConsentBanner();
        if (DISMISSED) {
          await driver.sleep(500);
        }
        try {
          await driver.executeScript("arguments[0].click();", TAB_BUTTON);
          tabClicked = true;
          console.log(`H2 Magdeburg: Fallback script click succeeded for ${TAB_ID}.`);
        } catch (scriptError) {
          console.warn(
            `H2 Magdeburg: Script click fallback failed for tab ${TAB_ID}: ${
              scriptError instanceof Error ? scriptError.message : String(scriptError)
            }`,
          );
        }
      } else {
        console.warn(`H2 Magdeburg: Failed to click tab ${TAB_ID}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!tabClicked) {
      continue;
    }

    await driver
      .wait(async () => {
        const CLASS_NAME: string = (await TAB_BUTTON.getAttribute("class")) || "";
        return CLASS_NAME.includes("active");
      }, 4000)
      .catch(() => undefined);

    await driver.sleep(TAB_DELAY_MS);

    const COLLECTED_COUNT: number = await collectLinksForContext(TAB_ID);
    if (COLLECTED_COUNT === 0) {
      console.warn(`H2 Magdeburg: No job URLs detected for tab ${TAB_ID}.`);
    }
  }

  console.log(`H2 Magdeburg: Finished with ${jobUrls.length} URLs collected.`);
}

/**
 * Custom function to scrape paginated job postings from karriere.leipzig.de.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 */
async function scrapeKarriereLeipzigJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  const JOB_CARD_SELECTOR: string = ".joboffer_container";
  const JOB_LINK_SELECTOR: string = ".joboffer_container a[href*='stellenangebote/'][href$='.html']";
  const PAGINATION_LINK_SELECTOR: string = "#joblist_navigator .path_nav li a[href*='start=']";
  const DOMAIN_SNIPPET: string = "karriere.leipzig.de/stellenangebote/";

  const normalizeJobUrl = (url: string): string => {
    try {
      const parsed: URL = new URL(url);
      parsed.search = "";
      parsed.hash = "";
      return parsed.toString();
    } catch {
      return url.split("?")[0];
    }
  };

  const SEEN_JOBS: Set<string> = new Set(jobUrls.map(normalizeJobUrl));
  const VISITED_PAGES: Set<string> = new Set();
  const PAGES_TO_VISIT: string[] = [];

  const INITIAL_URL: string = await driver.getCurrentUrl();
  PAGES_TO_VISIT.push(INITIAL_URL);

  while (PAGES_TO_VISIT.length > 0) {
    const CURRENT_PAGE: string | undefined = PAGES_TO_VISIT.shift();
    if (!CURRENT_PAGE || VISITED_PAGES.has(CURRENT_PAGE)) {
      continue;
    }

    VISITED_PAGES.add(CURRENT_PAGE);

    if ((await driver.getCurrentUrl()) !== CURRENT_PAGE) {
      console.log(`Navigating to Karriere Leipzig page: ${CURRENT_PAGE}`);
      await driver.get(CURRENT_PAGE);
    }

    await driver
      .wait(until.elementLocated(By.css(JOB_CARD_SELECTOR)), 10000)
      .catch(() => console.warn("Karriere Leipzig job cards not found within timeout."));

    await driver.sleep(1500);

    await driver
      .wait(async () => {
        const ENTRIES: WebElement[] = await driver.findElements(By.css(JOB_LINK_SELECTOR));
        return ENTRIES.length > 0;
      }, 7000)
      .catch(() => console.warn("Karriere Leipzig job links not loaded within timeout."));

    const LINK_ELEMENTS: WebElement[] = await driver.findElements(By.css(JOB_LINK_SELECTOR));
    console.log(`Found ${LINK_ELEMENTS.length} job links on current page.`);

    for (const LINK_ELEMENT of LINK_ELEMENTS) {
      try {
        const RAW_HREF: string | null = await LINK_ELEMENT.getAttribute("href");
        if (!RAW_HREF) {
          continue;
        }

        if (!RAW_HREF.includes(DOMAIN_SNIPPET)) {
          continue;
        }

        const NORMALIZED: string = normalizeJobUrl(RAW_HREF);
        if (!SEEN_JOBS.has(NORMALIZED)) {
          SEEN_JOBS.add(NORMALIZED);
          jobUrls.push(NORMALIZED);
          console.log(`Collected Karriere Leipzig job URL: ${NORMALIZED}`);
        }
      } catch (error) {
        console.warn(`Error reading Karriere Leipzig job link: ${error.message}`);
      }
    }

    const PAGINATION_LINKS: WebElement[] = await driver.findElements(By.css(PAGINATION_LINK_SELECTOR));
    console.log(`Found ${PAGINATION_LINKS.length} pagination links.`);

    for (const PAGE_LINK of PAGINATION_LINKS) {
      try {
        const PAGE_HREF: string | null = await PAGE_LINK.getAttribute("href");
        if (!PAGE_HREF) {
          continue;
        }

        const NORMALIZED_PAGE: string = PAGE_HREF.split("#")[0];

        if (VISITED_PAGES.has(NORMALIZED_PAGE) || PAGES_TO_VISIT.includes(NORMALIZED_PAGE)) {
          continue;
        }

        console.log(`Adding pagination URL to queue: ${NORMALIZED_PAGE}`);
        PAGES_TO_VISIT.push(NORMALIZED_PAGE);
      } catch (error) {
        console.warn(`Error reading Karriere Leipzig pagination link: ${error.message}`);
      }
    }
  }

  jobUrls.splice(0, jobUrls.length, ...Array.from(new Set(jobUrls)));
  console.log(`Finished scrapeKarriereLeipzigJobs with ${jobUrls.length} URLs collected.`);
}

/**
 * Custom function for the Burg-Halle logic.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs have been processed.
 */
async function scrapeBurgHalleJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  const BURG_JOB_SELECTOR: string = "article.teaser-card.element.mode-news a.card-inner";
  const APPLICATION_LINK_SELECTOR: string = 'a[href*="/qisserver/rds"]';

  try {
    const BURG_JOBS: SeleniumElement[] = await driver.findElements(By.css(BURG_JOB_SELECTOR));
    if (BURG_JOBS.length === 0) {
      console.warn("No job entries found on BURG page.");
    }

    for (let i: number = 0; i < BURG_JOBS.length; i++) {
      try {
        const BURG_JOBS_UPDATED: SeleniumElement[] = await driver.findElements(
          By.css(BURG_JOB_SELECTOR),
        );
        const CURRENT_JOB: SeleniumElement = BURG_JOBS_UPDATED[i];

        await CURRENT_JOB.click();
        await driver.sleep(2000);

        try {
          const APPLICATION_LINK: SeleniumElement = await driver.findElement(
            By.css(APPLICATION_LINK_SELECTOR),
          );
          const APPLICATION_URL: string | null = await APPLICATION_LINK.getAttribute("href");
          if (APPLICATION_URL) {
            console.log(`Extracted Application URL: ${APPLICATION_URL}`);
            jobUrls.push(APPLICATION_URL);
          } else {
            console.warn("No application URL found.");
          }
        } catch (error) {
          console.error("Error finding application link: " + error.message);
        }

        await driver.navigate().back();
        await driver.sleep(2000);

        try {
          const WHITE_LOADER: WebElement = await driver.findElement(By.id("white-loader"));
          await driver.wait(until.elementIsNotVisible(WHITE_LOADER), 10000);
        } catch {
          console.log("No visible white-loader overlay found (or already gone).");
        }
      } catch (error) {
        console.error("Error processing a BURG job entry: " + error.message);
        continue;
      }
    }
  } catch (error) {
    console.error("Error processing BURG job entries: " + error.message);
  }
}

/**
 * Custom function to scrape job postings from the University of Leipzig's website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the University of Leipzig have been processed.
 */
export async function scrapeUniLeipzigJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  console.log("Starting scrapeUniLeipzigJobs");

  const PAGINATION_SELECTOR: string =
    "div.navi.navi-pagebrowser ul.ajax-links li a.ajax-get-request";
  const VISITED_PAGES: Set<string> = new Set<string>();
  const ENQUEUED_PAGES: Set<string> = new Set<string>();
  const PAGES_TO_VISIT: string[] = [];

  const INITIAL_URL: string = await driver.getCurrentUrl();
  PAGES_TO_VISIT.push(INITIAL_URL);
  ENQUEUED_PAGES.add(INITIAL_URL);

  while (PAGES_TO_VISIT.length > 0) {
    const CURRENT_PAGE: string | undefined = PAGES_TO_VISIT.shift();
    if (!CURRENT_PAGE) {
      continue;
    }

    if (VISITED_PAGES.has(CURRENT_PAGE)) {
      continue;
    }

    if ((await driver.getCurrentUrl()) !== CURRENT_PAGE) {
      console.log("Navigating to Uni Leipzig page:", CURRENT_PAGE);
      await driver.get(CURRENT_PAGE);
      await driver.sleep(500);
    }

    console.log("Collecting links from current page...");
    await collectUniLeipzigJobUrlsFromPage(driver, jobUrls);
    console.log("Collected so far:", JSON.stringify(jobUrls, null, 2));

    VISITED_PAGES.add(CURRENT_PAGE);

    const LINKS: WebElement[] = await driver.findElements(By.css(PAGINATION_SELECTOR));
    if (LINKS.length === 0) {
      console.log("No pagination links found on current page.");
      continue;
    }

    for (const LINK_EL of LINKS) {
      try {
        const RAW_HREF: string | null = await LINK_EL.getAttribute("href");
        const NORMALIZED_HREF: string | null = RAW_HREF
          ? normalizeLeipzigHref(RAW_HREF, CURRENT_PAGE)
          : null;

        if (
          !NORMALIZED_HREF ||
          VISITED_PAGES.has(NORMALIZED_HREF) ||
          ENQUEUED_PAGES.has(NORMALIZED_HREF)
        ) {
          continue;
        }

        ENQUEUED_PAGES.add(NORMALIZED_HREF);
        PAGES_TO_VISIT.push(NORMALIZED_HREF);
      } catch {}
    }
  }

  jobUrls.splice(0, jobUrls.length, ...Array.from(new Set(jobUrls)));
  console.log("Finished scrapeUniLeipzigJobs. Total job URLs:", jobUrls.length);
}

/**
 * Custom function to scrape job postings from the Cyberagentur website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the University of Leipzig have been processed.
 */
export async function scrapeCyberagenturJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  console.log("Starting scrapeCyberagenturJobs");

  console.log("Collecting links from current page...");
  await collectCyberagenturJobUrlsFromPage(driver, jobUrls);
  console.log("Collected so far:", JSON.stringify(jobUrls, null, 2));

  jobUrls.splice(0, jobUrls.length, ...Array.from(new Set(jobUrls)));
  console.log("After deduplication:", JSON.stringify(jobUrls, null, 2));

  console.log("Finished scrapeCyberagenturJobs. Total job URLs:", jobUrls.length);
}

/**
 * Helper function to collect job posting URLs from the current page of the University of Leipzig's website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the current page have been collected.
 */
export async function collectUniLeipzigJobUrlsFromPage(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  const CURRENT_PAGE_URL: string = await driver.getCurrentUrl();
  const TARGET_PATTERNS: RegExp[] = [
    /\/jobposting\//i,
    /\/stellenausschreibung\//i,
    /\/newsdetail\/artikel\//i,
    /uniklinikum-leipzig\.de\/stellenangebote\//i,
  ];

  const SEEN: Set<string> = new Set(jobUrls);
  const ALL_LINKS: WebElement[] = await driver.findElements(By.css("a[href]"));

  for (const LINK of ALL_LINKS) {
    try {
      const RAW_HREF: string | null = await LINK.getAttribute("href");
      if (!RAW_HREF) {
        continue;
      }

      const RESOLVED_URL: string | null = normalizeLeipzigHref(RAW_HREF, CURRENT_PAGE_URL);
      if (!RESOLVED_URL) {
        continue;
      }

      if (!TARGET_PATTERNS.some((pattern: RegExp): boolean => pattern.test(RESOLVED_URL))) {
        continue;
      }

      if (SEEN.has(RESOLVED_URL)) {
        continue;
      }

      SEEN.add(RESOLVED_URL);
      jobUrls.push(RESOLVED_URL);
      console.log("Extracted URL:", RESOLVED_URL);
    } catch (error) {
      console.warn("Failed to process Uni Leipzig link", error);
    }
  }
}

function normalizeLeipzigHref(rawHref: string, baseUrl: string): string | null {
  const DISALLOWED_PREFIXES: string[] = ["javascript:", "mailto:", "tel:", "#"];
  const TRIMMED: string = rawHref.trim();
  if (!TRIMMED) {
    return null;
  }

  const LOWER: string = TRIMMED.toLowerCase();
  if (DISALLOWED_PREFIXES.some((prefix: string): boolean => LOWER.startsWith(prefix))) {
    return null;
  }

  let candidate: string = TRIMMED.replace(/\s+/g, "");

  candidate = candidate.replace(/^(https?:\/\/)\s*(https?:\/\/)/i, "$2");
  candidate = candidate.replace(/^https?:\/\/https?:\/\//i, "https://");

  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  }

  try {
    return new URL(candidate, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Helper function to collect job posting URLs from the current page of the Cyberagentur website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the current page have been collected.
 */
export async function collectCyberagenturJobUrlsFromPage(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  await driver.sleep(2000);
  driver.switchTo().frame(0);
  await driver.sleep(2000);
  const ALL_ELEMENTS: WebElement[] = await driver.findElements(By.className("vacancy-item"));

  for (const ELEMENT of ALL_ELEMENTS) {
    try {
      const JOB_VIEW: WebElement = await ELEMENT.findElement(By.css(".boxed.btn-primary.button"));
      await driver.executeScript("arguments[0].click();", JOB_VIEW);

  const PRINT_BTN = await driver.wait(
        async function (): Promise<WebElement | false> {
          const BUTTONS: WebElement[] = await driver.findElements(
            By.css(".btn.btn-outline-primary"),
          );
          for (const BUTTON of BUTTONS) {
            const HREF: string | null = await BUTTON.getAttribute("href");
            if (HREF && HREF.includes("jobview")) {
              return BUTTON;
            }
          }
          return false;
        },
        10000,
        "Print-Button with 'jobview' in href not found.",
      );

      if (!PRINT_BTN) {
        continue;
      }

      const HREF: string | null = await PRINT_BTN.getAttribute("href");

      const CLOSE_BTN: WebElement = await driver.findElement(
        By.css(".btn.btn-primary.closeDetailView"),
      );
      await driver.executeScript("arguments[0].click();", CLOSE_BTN);

      if (HREF && HREF.includes("/jobview") && !jobUrls.includes(HREF)) {
        console.log("Extracted URL:", HREF);
        jobUrls.push(HREF);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Helper function to collect job posting URLs from the current page of the IPKGatersleben website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the current page have been collected.
 */
export async function collectIPKGaterslebenJobUrlsFromPage(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  const ALL_LINKS: WebElement[] = await driver.findElements(By.css("a[href]"));
  for (const LINK of ALL_LINKS) {
    try {
      const HREF: string | null = await LINK.getAttribute("href");
      if (HREF && HREF.includes("/job-offer/") && !jobUrls.includes(HREF)) {
        console.log("Extracted URL:", HREF);
        jobUrls.push(HREF);
      }
    } catch {}
  }
}

/**
 * Helper function to collect job posting URLs from the current page of the IPKGatersleben website.
 * @param driver - The Selenium WebDriver instance used for navigating and interacting with the page.
 * @param jobUrls - An array where the discovered job URLs will be stored.
 * @returns A promise that resolves once all job URLs from the current page have been collected.
 */
export async function collectDeutscherWetterdienstJobUrlsFromPage(
  driver: WebDriver,
  jobUrls: string[],
): Promise<void> {
  const ALL_LINKS: WebElement[] = await driver.findElements(By.css("a[href]"));
  for (const LINK of ALL_LINKS) {
    try {
      const HREF: string | null = await LINK.getAttribute("href");
      if (HREF && HREF.includes("/SharedDocs/StellenangeboteEBV/") && !jobUrls.includes(HREF)) {
        console.log("Extracted URL:", HREF);
        jobUrls.push(HREF);
      }
    } catch {}
  }
}

/**
 * Scrapes the rendered HTML content from a JavaScript-based SPA page using Selenium.
 * This is necessary for sites that use frameworks like Vaadin, React, Angular, etc.
 * that render content dynamically via JavaScript.
 * 
 * @param url - The URL to scrape
 * @param waitForSelector - Optional CSS selector to wait for before returning HTML
 * @param waitTimeout - Optional timeout in ms to wait for selector (default: 10000)
 * @returns A promise that resolves to the rendered HTML content
 */
export async function scrapeRenderedHtml(
  url: string,
  waitForSelector?: string,
  waitTimeout: number = 10000,
): Promise<string> {
  const OPTIONS: chrome.Options = new chrome.Options();
  OPTIONS.addArguments("--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage");

  const DRIVER: WebDriver = new Builder().forBrowser("chrome").setChromeOptions(OPTIONS).build();

  try {
    console.log(`[Selenium] Navigating to URL: ${url}`);
    await DRIVER.get(url);

    // Wait for dynamic content to load
    if (waitForSelector) {
      try {
        await DRIVER.wait(until.elementLocated(By.css(waitForSelector)), waitTimeout);
        console.log(`[Selenium] Found element: ${waitForSelector}`);
      } catch {
        console.warn(`[Selenium] Selector "${waitForSelector}" not found within ${waitTimeout}ms`);
      }
    } else {
      // Default wait for body to be present and page to stabilize
      await DRIVER.wait(until.elementLocated(By.css("body")), waitTimeout);
      // Give additional time for JavaScript to execute
      await DRIVER.sleep(2000);
    }

    // Get the rendered page source
    const HTML: string = await DRIVER.getPageSource();
    console.log(`[Selenium] Retrieved ${HTML.length} characters of HTML from ${url}`);
    
    return HTML;
  } catch (error) {
    console.error(`[Selenium] Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape rendered HTML from ${url}: ${error.message}`);
  } finally {
    await DRIVER.quit();
  }
}

/**
 * Extracts the PDF URL from a Uni Jena Berufungsportal page.
 * The berufungsportal embeds the PDF URL in the page's Vaadin UIDL JSON data,
 * which is available in the initial HTTP response (no JavaScript rendering needed).
 * 
 * Format in HTML: "pdfUrl","feat":1,"value":"VAADIN/dynamic/resource/0/{guid}/{filename}.pdf"
 * 
 * @param html - The raw HTML content of the berufungsportal page
 * @param baseUrl - The base URL for constructing the full PDF URL
 * @returns The full PDF URL, or null if not found
 */
export function extractBerufungsportalPdfUrl(html: string, baseUrl: string): string | null {
  // Extract PDF URL from the Vaadin UIDL JSON
  // Pattern: "pdfUrl","feat":1,"value":"VAADIN/dynamic/resource/..."
  const PDF_URL_PATTERN = /"pdfUrl","feat":\d+,"value":"([^"]+\.pdf)"/i;
  const match = html.match(PDF_URL_PATTERN);
  
  if (match && match[1]) {
    try {
      // Construct full URL from relative path
      const parsedBase = new URL(baseUrl);
      const pdfPath = match[1];
      // Decode the URL-encoded path for logging
      const fullPdfUrl = `${parsedBase.origin}/${pdfPath}`;
      console.log(`[Berufungsportal] Found PDF URL: ${decodeURIComponent(fullPdfUrl)}`);
      return fullPdfUrl;
    } catch (error) {
      console.error(`[Berufungsportal] Error constructing PDF URL:`, error);
      return null;
    }
  }
  
  console.warn(`[Berufungsportal] No PDF URL found in page`);
  return null;
}

/**
 * Scrapes job URLs from HGB Leipzig (Hochschule für Grafik und Buchkunst).
 * HGB uses a BITE widget that loads jobs from stellen.hgb-leipzig.de.
 * The entries are clickable divs that navigate to job pages.
 * @param driver - The Selenium WebDriver instance.
 * @param jobUrls - Array to store scraped job URLs.
 */
async function scrapeHGBLeipzigJobs(driver: WebDriver, jobUrls: string[]): Promise<void> {
  console.log("[HGB Leipzig] Starting job scraping...");
  
  try {
    // Wait for the BITE widget to load
    await driver.sleep(3000);
    
    // Wait for the bite container to appear
    try {
      await driver.wait(until.elementLocated(By.css("div.bite_container, div[data-bite-jobs-api-listing]")), 10000);
      console.log("[HGB Leipzig] BITE container found");
    } catch {
      console.warn("[HGB Leipzig] BITE container not found within timeout");
    }
    
    // Additional wait for dynamic content
    await driver.sleep(2000);
    
    // Find all job entries - they are clickable divs, not links
    const entries = await driver.findElements(By.css("div.bite_container--entry"));
    console.log(`[HGB Leipzig] Found ${entries.length} job entries`);
    
    const originalWindow = await driver.getWindowHandle();
    
    for (let i = 0; i < entries.length; i++) {
      try {
        // Re-find entries each iteration as DOM may have changed
        const currentEntries = await driver.findElements(By.css("div.bite_container--entry"));
        if (i >= currentEntries.length) break;
        
        const entry = currentEntries[i];
        
        // Scroll entry into view
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", entry);
        await driver.sleep(500);
        
        // Get current windows before click
        const windowsBefore = await driver.getAllWindowHandles();
        
        // Click the entry
        await entry.click();
        console.log(`[HGB Leipzig] Clicked entry ${i + 1}/${entries.length}`);
        
        // Wait for navigation or new tab
        await driver.sleep(1500);
        
        // Check if a new tab was opened
        const windowsAfter = await driver.getAllWindowHandles();
        
        if (windowsAfter.length > windowsBefore.length) {
          // New tab opened
          const newTab = windowsAfter.find(w => !windowsBefore.includes(w));
          if (newTab) {
            await driver.switchTo().window(newTab);
            const jobUrl = await driver.getCurrentUrl();
            
            if (jobUrl.includes("stellen.hgb-leipzig.de") && !jobUrls.includes(jobUrl)) {
              jobUrls.push(jobUrl);
              console.log(`[HGB Leipzig] Found job URL: ${jobUrl}`);
            }
            
            await driver.close();
            await driver.switchTo().window(originalWindow);
          }
        } else {
          // Same tab navigation
          const currentUrl = await driver.getCurrentUrl();
          
          if (currentUrl.includes("stellen.hgb-leipzig.de") && !jobUrls.includes(currentUrl)) {
            jobUrls.push(currentUrl);
            console.log(`[HGB Leipzig] Found job URL: ${currentUrl}`);
          }
          
          // Navigate back to the listing page
          await driver.navigate().back();
          await driver.sleep(2000);
          
          // Wait for BITE container to reload
          try {
            await driver.wait(until.elementLocated(By.css("div.bite_container--entry")), 10000);
          } catch {
            console.warn("[HGB Leipzig] BITE container not reloaded after navigation");
          }
        }
      } catch (err) {
        console.warn(`[HGB Leipzig] Error processing entry ${i + 1}:`, err);
        // Try to recover by navigating back
        try {
          await driver.navigate().back();
          await driver.sleep(2000);
        } catch {
          // Ignore navigation errors
        }
      }
    }
    
    console.log(`[HGB Leipzig] Total job URLs found: ${jobUrls.length}`);
  } catch (error) {
    console.error("[HGB Leipzig] Error scraping jobs:", error);
  }
}
