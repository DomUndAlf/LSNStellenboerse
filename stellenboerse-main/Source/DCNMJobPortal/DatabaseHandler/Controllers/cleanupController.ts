import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import * as cleanupService from "../Services/cleanupService";

/**
 * Executes cleanup of orphaned database records.
 * Removes Websites without Jobs and Jobs without Websites.
 * Also removes orphaned whitelist entries.
 */
export async function cleanupOrphanedRecords(_req: Request, res: Response) {
  try {
    const RESULT: { deletedWebsites: number; deletedJobs: number; deletedWhitelistEntries: number } =
      await cleanupService.cleanupOrphanedRecords();
    res.status(httpStatus.OK).json({
      message: "Cleanup completed successfully",
      deletedWebsites: RESULT.deletedWebsites,
      deletedJobs: RESULT.deletedJobs,
      deletedWhitelistEntries: RESULT.deletedWhitelistEntries,
    });
  } catch (err) {
    console.error("Error during cleanup:", err instanceof Error ? err.message : String(err));
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Executes cleanup of jobs without meaningful content.
 * Removes jobs that have no description AND no tasks.
 * Also removes associated websites and whitelist entries.
 */
export async function cleanupEmptyJobs(_req: Request, res: Response) {
  try {
    const RESULT: {
      deletedEmptyJobs: number;
      deletedWebsites: number;
      deletedWhitelistEntries: number;
    } = await cleanupService.cleanupEmptyJobs();
    res.status(httpStatus.OK).json({
      message: "Empty jobs cleanup completed successfully",
      deletedEmptyJobs: RESULT.deletedEmptyJobs,
      deletedWebsites: RESULT.deletedWebsites,
      deletedWhitelistEntries: RESULT.deletedWhitelistEntries,
    });
  } catch (err) {
    console.error("Error during empty jobs cleanup:", err instanceof Error ? err.message : String(err));
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}
