import axios from "axios";

/**
 * Calls the DatabaseHandler API to cleanup orphaned records.
 * This removes Websites without Jobs and Jobs without Websites.
 * 
 * @returns Promise with cleanup results
 */
export async function cleanupOrphanedRecords(): Promise<{
  deletedWebsites: number;
  deletedJobs: number;
} | null> {
  try {
    console.log("Starting database cleanup for orphaned records...");
    const response = await axios.post(
      `http://localhost:${process.env.DBSERVER_PORT}/database/cleanup/orphaned`,
    );
    console.log(
      `Cleanup completed: ${response.data.deletedWebsites} websites, ${response.data.deletedJobs} jobs removed`,
    );
    return {
      deletedWebsites: response.data.deletedWebsites,
      deletedJobs: response.data.deletedJobs,
    };
  } catch (error) {
    console.error("Error during cleanup:", error.message);
    return null;
  }
}

/**
 * Calls the DatabaseHandler API to cleanup empty jobs.
 * This removes jobs that have no description AND no tasks.
 * Also removes associated websites and whitelist entries.
 *
 * @returns Promise with cleanup results
 */
export async function cleanupEmptyJobs(): Promise<{
  deletedEmptyJobs: number;
  deletedWebsites: number;
  deletedWhitelistEntries: number;
} | null> {
  try {
    console.log("Starting cleanup for empty jobs (no description AND no tasks)...");
    const response = await axios.post(
      `http://localhost:${process.env.DBSERVER_PORT}/database/cleanup/empty-jobs`,
    );
    console.log(
      `Empty jobs cleanup completed: ${response.data.deletedEmptyJobs} jobs, ${response.data.deletedWebsites} websites, ${response.data.deletedWhitelistEntries} whitelist entries removed`,
    );
    return {
      deletedEmptyJobs: response.data.deletedEmptyJobs,
      deletedWebsites: response.data.deletedWebsites,
      deletedWhitelistEntries: response.data.deletedWhitelistEntries,
    };
  } catch (error) {
    console.error("Error during empty jobs cleanup:", error.message);
    return null;
  }
}
