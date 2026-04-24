import { scrapeAndSaveHTML } from "./fileUtils";

(async function scrapeAndSave() {
  try {
    const SAVED_FILES: string[] = await scrapeAndSaveHTML();
    console.log("HTML files have been saved successfully:", SAVED_FILES);
  } catch (error) {
    console.error("Error during scrape and save process:", error);
  }
})();
