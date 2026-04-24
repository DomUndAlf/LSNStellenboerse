import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import { Job } from "../Models/Entities/Job";
import { Website } from "../Models/Entities/Website";
import { Employer } from "../Models/Entities/Employer";
import { Repository } from "typeorm";
import * as employerService from "./employerService";

/**
 * Minimum character length for a job description to be considered valid.
 */
const MIN_DESCRIPTION_LENGTH: number = 50;

/**
 * Minimum character length for a task to be considered valid.
 */
const MIN_TASK_LENGTH: number = 5;

/**
 * Finds and removes orphaned Website entries (without associated Job)
 * and orphaned Jobs (without associated Website).
 * Also cleans up orphaned whitelist entries.
 * 
 * This ensures database integrity by cleaning up records that violate
 * the business rule: every Job must have a Website, and every Website should have a Job.
 * 
 * @returns Object containing counts of deleted websites, jobs, and whitelist entries
 */
export async function cleanupOrphanedRecords(): Promise<{
  deletedWebsites: number;
  deletedJobs: number;
  deletedWhitelistEntries: number;
}> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);

  // 1. Find Websites without a Job
  const ORPHANED_WEBSITES: Website[] = await WEBSITE_REPO
    .createQueryBuilder("website")
    .leftJoin("job", "job", "job.WebsiteID = website.WebsiteID")
    .where("job.JobID IS NULL")
    .getMany();

  // 2. Delete orphaned Websites and remove from whitelist
  // Since Website doesn't have EmployerID, we need to check all employers' whitelists
  let deletedWhitelistEntries = 0;
  const EMPLOYER_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  const ALL_EMPLOYERS: Employer[] = await EMPLOYER_REPO.find();
  
  for (const website of ORPHANED_WEBSITES) {
    // Remove from whitelist for all employers that have this URL
    if (website.JobURL) {
      for (const employer of ALL_EMPLOYERS) {
        if (employer.Whitelist && employer.Whitelist.includes(website.JobURL)) {
          try {
            await employerService.deleteFromWhitelist(employer.EmployerID, website.JobURL);
            deletedWhitelistEntries++;
          } catch (error) {
            console.warn(`Failed to delete whitelist entry for ${website.JobURL} from employer ${employer.EmployerID}:`, error);
          }
        }
      }
    }
    await WEBSITE_REPO.delete(website.WebsiteID);
  }

  // 3. Find Jobs without a Website (should not happen, but for safety)
  const ORPHANED_JOBS: Job[] = await JOB_REPO
    .createQueryBuilder("job")
    .leftJoin("website", "website", "website.WebsiteID = job.WebsiteID")
    .where("website.WebsiteID IS NULL")
    .getMany();

  // 4. Delete orphaned Jobs
  for (const job of ORPHANED_JOBS) {
    await JOB_REPO.delete(job.JobID);
  }

  console.log(
    `Cleanup completed: ${ORPHANED_WEBSITES.length} orphaned websites, ${ORPHANED_JOBS.length} orphaned jobs, and ${deletedWhitelistEntries} orphaned whitelist entries removed`,
  );

  return {
    deletedWebsites: ORPHANED_WEBSITES.length,
    deletedJobs: ORPHANED_JOBS.length,
    deletedWhitelistEntries: deletedWhitelistEntries,
  };
}

/**
 * Checks if a job has valid content (either a meaningful description or valid tasks).
 * @param job - The job to check
 * @returns true if the job has valid content, false otherwise
 */
function hasValidJobContent(job: Job): boolean {
  const hasDescription: boolean =
    job.Description !== undefined &&
    job.Description !== null &&
    job.Description.trim().length >= MIN_DESCRIPTION_LENGTH;

  const hasTasks: boolean =
    job.Tasks !== undefined &&
    job.Tasks !== null &&
    Array.isArray(job.Tasks) &&
    job.Tasks.length > 0 &&
    job.Tasks.some(function (task: string): boolean {
      return task.trim().length >= MIN_TASK_LENGTH;
    });

  return hasDescription || hasTasks;
}

/**
 * Finds and removes jobs that have no meaningful content (no description AND no tasks).
 * These are typically overview pages or failed extractions that slipped through validation.
 * Also removes the associated Website entries and removes the URL from whitelists.
 *
 * @returns Object containing the count of deleted empty jobs
 */
export async function cleanupEmptyJobs(): Promise<{
  deletedEmptyJobs: number;
  deletedWebsites: number;
  deletedWhitelistEntries: number;
}> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const EMPLOYER_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);

  // Find all jobs with their associated data
  const ALL_JOBS: Job[] = await JOB_REPO.find({
    relations: ["Employer", "Website"],
  });

  // Filter to jobs without valid content
  const EMPTY_JOBS: Job[] = ALL_JOBS.filter(function (job: Job): boolean {
    return !hasValidJobContent(job);
  });

  console.log(`Found ${EMPTY_JOBS.length} jobs without meaningful content`);

  let deletedWebsites: number = 0;
  let deletedWhitelistEntries: number = 0;
  const ALL_EMPLOYERS: Employer[] = await EMPLOYER_REPO.find();

  for (const job of EMPTY_JOBS) {
    console.log(
      `Removing empty job: ID=${job.JobID}, Title="${job.Title}", Employer=${job.Employer?.ShortName}`,
    );

    // Get the website URL before deletion for whitelist cleanup
    const websiteUrl: string | null = job.Website?.JobURL || null;
    const websiteId: number | null = job.Website?.WebsiteID || null;

    // Delete the job first
    await JOB_REPO.delete(job.JobID);

    // Delete the associated website if it exists
    if (websiteId) {
      await WEBSITE_REPO.delete(websiteId);
      deletedWebsites++;
    }

    // Remove from whitelist for all employers that have this URL
    if (websiteUrl) {
      for (const employer of ALL_EMPLOYERS) {
        if (employer.Whitelist && employer.Whitelist.includes(websiteUrl)) {
          try {
            await employerService.deleteFromWhitelist(employer.EmployerID, websiteUrl);
            deletedWhitelistEntries++;
            console.log(`Removed "${websiteUrl}" from whitelist of employer ${employer.ShortName}`);
          } catch (error) {
            console.warn(
              `Failed to delete whitelist entry for ${websiteUrl} from employer ${employer.EmployerID}:`,
              error,
            );
          }
        }
      }
    }
  }

  console.log(
    `Empty jobs cleanup completed: ${EMPTY_JOBS.length} empty jobs, ${deletedWebsites} websites, and ${deletedWhitelistEntries} whitelist entries removed`,
  );

  return {
    deletedEmptyJobs: EMPTY_JOBS.length,
    deletedWebsites: deletedWebsites,
    deletedWhitelistEntries: deletedWhitelistEntries,
  };
}
