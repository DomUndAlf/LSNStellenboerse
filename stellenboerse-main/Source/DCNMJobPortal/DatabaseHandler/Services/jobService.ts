import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import { Employer } from "../Models/Entities/Employer";
import { Job } from "../Models/Entities/Job";
import { Location } from "../Models/Entities/Location";
import { Website } from "../Models/Entities/Website";
import * as employerService from "./employerService";
import * as locationService from "./locationService";
import * as websiteService from "./websiteService";
import { DeleteResult, Repository, SelectQueryBuilder } from "typeorm";

/**
 * Retrieves all Object, that belongs to the class Job.
 * @returns Array of Objects that belongs to the class Job.
 * @throws Error
 */
export async function readAllJob(): Promise<Job[]> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const RESULT: Job[] = await JOB_REPO.find({ relations: ["Employer", "Location", "Website"] });
  return RESULT;
}

/**
 * Retrieves an Object and all its attribute
 * @param jobid -Primary Key für einen Job
 * @returns an Object of the class Job with unique JobID
 * @throws Error
 */
export async function readJob(jobid: number): Promise<Job | null> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const RESULT: Job | null = await JOB_REPO.createQueryBuilder("job")
    .select([
      "job.JobID",
      "job.Title",
      "job.Description",
      "job.Tasks",
      "job.Website",
      "job.Location",
      "job.Employer",
      "job.ApplicationDeadline",
      "job.Language",
      "job.created_at",
      "job.Specialty",
    ])
    .addSelect([
      "employer.EmployerID",
      "employer.LocationID",
      "employer.ShortName",
      "employer.FullName",
      "employer.Website",
      "employer.Emails",
      "employer.toValidate",
      "employer.ContactPerson",
      "employer.showContact",
      "employer.sendValidationEmails",
    ])
    .leftJoin("job.Employer", "employer")
    .leftJoinAndSelect("job.Location", "location")
    .leftJoinAndSelect("job.Website", "website")
    .where("job.JobID = :jobid", { jobid })
    .andWhere("(job.isValid = 1 OR employer.toValidate = 0)")
    .getOne();

  return RESULT;
}

/**
 * Retrieves an Object and all its attribute for Validation
 * @param jobid -Primary Key für einen Job
 * @returns an Object of the class Job with unique JobID
 * @throws Error
 */
export async function readJobForValidation(jobid: number): Promise<Job | null> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const RESULT: Job | null = await JOB_REPO.findOne({
    select: [
      "JobID",
      "Title",
      "Description",
      "Tasks",
      "Website",
      "Location",
      "Employer",
      "ApplicationDeadline",
      "Language",
      "created_at",
      "Specialty",
    ],
    relations: ["Employer", "Location", "Website"],
    where: [
      {
        JobID: jobid,
      },
    ],
  });

  return RESULT;
}

/**
 * Retrieves the JobID for the given URL.
 * @param url - The URL of the website.
 * @returns The JobID associated with the given URL.
 * @throws An error if no job is found for the given URL.
 */
export async function getJobIDByUrl(url: string): Promise<number | null> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const WEBSITE: Website | null = await WEBSITE_REPO.findOne({ where: { JobURL: url } });
  if (!WEBSITE) {
    throw new Error(`Website does not exist`);
  }
  const JOB: Job | null = await JOB_REPO.findOne({
    where: { Website: { WebsiteID: WEBSITE.WebsiteID } },
  });
  if (!JOB) {
    throw new Error(`Job with URL: ${url} does not exist`);
  }
  return JOB.JobID;
}

export async function getJobByWebsiteId(websiteid: number): Promise<Job | null> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const JOB: Job | null = await JOB_REPO.findOne({
    where: { WebsiteID: websiteid },
    relations: ["Employer", "Location"],
  });
  return JOB;
}

/**
 * @param specialty
 * @param language
 * @param employers
 * @param sortmode - the order mode chosen by user, if empty then does not sort the jobs.
 * @param sortorder
 * @param searchterms
 * @param page - the page user currently is, if negative then it skips pagination.
 *
 * Selects jobs depending on the filter criteria and sort criteria.
 * @returns array of jobs and the count of total jobs
 */
export async function mainFilter(
  specialty: string,
  language: string,
  employers: string[],
  searchterms: string[],
): Promise<[Job[], number]> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);

  const QUERY: SelectQueryBuilder<Job> = JOB_REPO.createQueryBuilder("job")
    .select([
      "job.JobID",
      "job.Title",
      "job.Description",
      "job.Tasks",
      "job.Website",
      "job.Location",
      "job.Employer",
      "job.ApplicationDeadline",
      "job.Language",
      "job.created_at",
      "job.Specialty",
    ])
    .addSelect([
      "employer.EmployerID",
      "employer.LocationID",
      "employer.ShortName",
      "employer.FullName",
      "employer.Website",
      "employer.Emails",
      "employer.ContactPerson",
      "employer.showContact",
      "employer.sendValidationEmails",
    ])
    .leftJoin("job.Employer", "employer")
    .leftJoinAndSelect("job.Location", "location")
    .leftJoinAndSelect("job.Website", "website")
    .where("(job.isValid = 1 or employer.toValidate = 0)");

  if (searchterms && searchterms.length > 0) {
    const CONDITIONS: string[] = searchterms.map((_, index) => 
      `(LOWER(job.Title) LIKE LOWER(:searchterm${index}) OR LOWER(location.City) LIKE LOWER(:searchterm${index}) OR LOWER(employer.FullName) LIKE LOWER(:searchterm${index}) OR LOWER(employer.ShortName) LIKE LOWER(:searchterm${index}))`
    );
    const PARAMETERS: Record<string, string> = {};
    searchterms.forEach((term, index) => {
      PARAMETERS[`searchterm${index}`] = `%${term}%`;
    });
    QUERY.andWhere(`(${CONDITIONS.join(" OR ")})`, PARAMETERS);
  }

  if (employers.length > 0) {
    QUERY.andWhere("employer.FullName IN (:...employers)", { employers });
  }

  if (language) {
    QUERY.andWhere("job.language = :language", { language });
  }

  if (specialty.length > 0) {
    QUERY.andWhere("JSON_CONTAINS(job.specialty, :specialty)", {
      specialty: JSON.stringify(specialty),
    });
  }

  const [RESULT, COUNT]: [Job[], number] = await QUERY.getManyAndCount();
  return [RESULT, COUNT];
}

/**
 * Updates the attributes of the Job with unique JobID.
 * The JobID cannot be changed. Since it is the Primary key.
 * @param jobid
 * @param new_empid
 * @param new_locationid
 * @param new_title
 * @param new_description
 * @param new_websiteid
 * @returns the updated Job.
 * @throws Error
 */

/**
 * Validates the required fields for a job entry.
 * Ensures that both title and description are not empty and do not consist only of whitespace.
 *
 * Validation rules:
 * - The title must not be empty or whitespace.
 * - The description must not be empty or whitespace.
 *
 * If any validation fails, appropriate error messages are logged to the console.
 * Throws Error but it is handled in the Controller
 *
 * @param title {string} - The title of the job to validate.
 * @returns {boolean} - Returns true if the validation passes; otherwise, false.
 * @throws Error
 */
function validateJobData(title: string): void {
  if (!title || title.trim() === "") {
    throw new Error("Title is not Valid");
  }
}

/**
 * Saves or updates a job record in the database based on the provided parameters.
 * This function first validates the job data using `validateJobData`. If validation passes,
 * it checks if a job with the given title, employer ID, and location ID already exists.
 * If it exists, the job is updated; if not, a new job record is created.
 *
 * This function handles:
 * - Validation of job data.
 * - Searching for an existing job record.
 * - Creating or updating the job record in the database.
 *
 * Throws an error if the job data is invalid or if any database operation fails.
 *
 * @param empid {number} - The ID of the employer associated with the job.
 * @param locationid {number} - The ID of the location associated with the job.
 * @param title {string} - The title of the job to be saved or updated.
 * @param description{string} - The description of the job.
 * @param tasks {array of strings} - the tasks the job includes.
 * @throws Error
 */
export async function saveOrUpdateJob(
  empid: number,
  locationid: number,
  title: string,
  description: string,
  tasks: string[],
  applicationdeadline: Date,
  websiteid: number,
  language: string,
  specialty: string[],
): Promise<number> {
  validateJobData(title);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const EMPLOYER: Employer | null = await employerService.readEmployer(empid);
  const LOCATION: Location | null = await locationService.readLocation(locationid);
  const WEBSITE: Website | null = await websiteService.readWebsite(websiteid);

  if (!EMPLOYER) {
    throw new Error(`Employer with ID ${empid} does not exist`);
  }

  if (!LOCATION) {
    throw new Error(`Location with ID ${locationid} does not exist`);
  }

  if (!WEBSITE) {
    throw new Error(`Website with ID ${websiteid} does not exist`);
  }

  const JOBDATA: {
    Title: string;
    Description: string;
    Tasks: string[];
    Employer: Employer;
    Location: Location;
    Website: Website;
    ApplicationDeadline: Date;
    Language: string;
    Specialty: string[];
  } = {
    Title: title,
    Description: description,
    Tasks: tasks,
    Employer: EMPLOYER,
    Location: LOCATION,
    Website: WEBSITE,
    ApplicationDeadline: applicationdeadline,
    Language: language,
    Specialty: specialty,
  };

  let job: Job | null = await JOB_REPO.findOne({
    where: { WebsiteID: websiteid, Title: title },
  });

  // If no exact match by WebsiteID and Title, check if there's an existing job with same WebsiteID
  // This handles the case where a job title was updated on the source website
  if (!job) {
    // Check if this is a known multi-job page URL (e.g., HZDR ContMan.Angebote.Liste)
    // Multi-job pages have multiple jobs sharing the same WebsiteID, so we NEVER want to overwrite
    const isMultiJobPage: boolean = WEBSITE.JobURL.includes("ContMan.Angebote.Liste");
    
    if (!isMultiJobPage) {
      // For single-job pages: check if exactly 1 job exists for this website
      // If so, this might be a title update - use the existing job
      const jobCountForWebsite: number = await JOB_REPO.count({ where: { WebsiteID: websiteid } });
      
      if (jobCountForWebsite === 1) {
        const existingJobByWebsite: Job | null = await JOB_REPO.findOne({
          where: { WebsiteID: websiteid },
        });
        if (existingJobByWebsite) {
          job = existingJobByWebsite;
        }
      }
    }
    // For multi-job pages or count != 1: job stays null, a new job will be created
  }

  if (job) {
    Object.assign(job, JOBDATA);
  } else {
    job = JOB_REPO.create(JOBDATA);
  }

  const RESULT: Job = await JOB_REPO.save(job);
  return RESULT.JobID;
}

/**
 * A Job with unique JobID is deleted from the database.
 * Also deletes the associated Website entry to avoid orphaned records.
 * @param jobid
 * @throws Error
 */
export async function deleteJob(jobid: number): Promise<boolean> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  
  // First, get the job to find the associated website and employer
  const JOB: Job | null = await JOB_REPO.findOne({ 
    where: { JobID: jobid },
    relations: ["Website"]
  });
  
  if (!JOB) {
    return false;
  }
  
  // Delete from whitelist if website URL exists
  if (JOB.Website?.JobURL) {
    await employerService.deleteFromWhitelist(JOB.EmployerID, JOB.Website.JobURL);
  }
  
  // Delete the job
  const JOB_DELETE_RESULT: DeleteResult = await JOB_REPO.delete(jobid);
  
  // Delete the associated website if it exists
  if (JOB.WebsiteID) {
    await WEBSITE_REPO.delete(JOB.WebsiteID);
  }
  
  return (JOB_DELETE_RESULT.affected ?? 0) > 0;
}

/**
 * Sets the Validation Key for the given Job
 * Throws Error but it is handled in the Controller
 * @param jobid
 * @param validationkey
 * @throws Error
 */
export async function setValidationKey(jobid: number, validationkey: string): Promise<boolean> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  let validatingJob: Job | null = await JOB_REPO.findOneBy({ JobID: jobid });
  if (!validatingJob) {
    return false;
  }
  validatingJob.ValidationKey = validationkey;
  await JOB_REPO.save(validatingJob);
  return true;
}

/**
 * Deletes the Validation Key of a specific Job
 * Throws Error, but it is handled in the Controller
 * @param jobid
 * @returns Job
 * @throws Error
 */
export async function validateJob(
  jobid: number,
  valid_title: string,
  valid_description: string,
  valid_tasks: string[],
  valid_deadline: Date | null,
  valid_language: string,
  valid_specialty: string[],
): Promise<boolean> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  let job: Job | null = await readJobForValidation(jobid);
  if (!job) {
    return false;
  }
  job.Title = valid_title;
  job.Description = valid_description;
  job.Tasks = valid_tasks;
  job.isValid = true;
  job.ApplicationDeadline = valid_deadline;
  job.Language = valid_language;
  job.Specialty = valid_specialty;
  await JOB_REPO.save(job);
  return true;
}

/**
 * Retrieves a Job by given Validation Key
 * Throws Error, but it is handled in the Controller
 * @param key
 * @returns Job or Null
 * @throws Error
 */
export async function readJobByValidationKey(
  key: string,
): Promise<(Job & { JobURL: string | null }) | null> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);

  return await JOB_REPO.findOne({
    where: { ValidationKey: key },
    relations: ["Website"],
    select: {
      JobID: true,
      EmployerID: true,
      LocationID: true,
      WebsiteID: true,
      isValid: true,
      Title: true,
      Description: true,
      Tasks: true,
      Specialty: true,
      ValidationKey: true,
      ApplicationDeadline: true,
      Language: true,
      created_at: true,
      Website: {
        JobURL: true,
      },
    },
  }).then(function (job: Job) {
    if (job) {
      return { ...job, JobURL: job.Website?.JobURL || null };
    }
    return null;
  });
}

export async function deleteJobByUrl(url: string, employerId: number): Promise<boolean> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository<Website>(Website);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository<Job>(Job);

  await employerService.deleteFromWhitelist(employerId, url);

  const WEBSITE: Website | null = await WEBSITE_REPO.findOne({ where: { JobURL: url } });
  if (!WEBSITE) return true; // URL already not in database

  const JOB: Job | null = await JOB_REPO.findOne({
    where: { Website: { WebsiteID: WEBSITE.WebsiteID } },
  });
  
  // Delete the job if it exists
  if (JOB) {
    await JOB_REPO.delete(JOB.JobID);
  }
  
  // Always delete the website (whether job existed or not)
  const WEBSITE_DELETE_RESULT: DeleteResult = await WEBSITE_REPO.delete(WEBSITE.WebsiteID);

  return (WEBSITE_DELETE_RESULT.affected ?? 0) > 0;
}

export async function readAllJobForUser(): Promise<Job[]> {
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  // return Job list including Employer relation (to provide ShortName for frontend tool)
  const RESULT: Job[] = await JOB_REPO.createQueryBuilder("job")
    .select(["job.JobID", "job.Title", "job.ValidationKey"])
    .leftJoinAndSelect("job.Employer", "employer")
    .getMany();

  return RESULT;
}
