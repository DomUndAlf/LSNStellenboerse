import axios from "axios";

/**
 * Schedules the scraper to run for all organizations with a specified number of retry attempts.
 *
 * This function attempts to start the scraper for all organizations by making an HTTP POST request.
 * If the request fails, it retries up to the specified number of times.
 * After each attempt, it waits for a specified duration before retrying.
 * The function then schedules itself to run again after 60 seconds, creating a continuous scraping schedule.
 *
 * @param {number} [retries=3] - The number of retry attempts allowed if the scraper fails to start.
 *
 * @returns {Promise<void>} - Returns a Promise that resolves when the function completes its scheduling logic.
 */
export async function scheduleScraper(retries: number = 3): Promise<void> {
  let attempt: number = 0;
  while (attempt < retries) {
    try {
      console.log("Start Scraper for all organizations...");
      await axios.post(`http://localhost:${process.env.WEBAGENT_PORT}/webagent/scrapeAllActive`);
      console.log("Scraper successfully launched for all organizations");
      break;
    } catch (error) {
      console.error("Error starting the scraper:", error.message);
      attempt++;
      console.log(`Attempt ${attempt} of ${retries}`);
    }
  }

  setTimeout(
    function () {
      scheduleScraper(retries);
    },
    72 * 60 * 60 * 1000,
  );
}
