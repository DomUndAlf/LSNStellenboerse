import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import { Employer } from "../Models/Entities/Employer";
import { DeleteResult, Repository, SelectQueryBuilder } from "typeorm";

/**
 * New Employer will be inserted into the Database.
 * EmployerID is the Primary Key and it is automatically generated.
 * Throws error but it is handled in Controller
 * @param shortname
 * @param fullname
 * @param website
 * @param emails
 * @throws Error
 */
export async function createEmployer(
  shortname: string,
  fullname: string,
  website: string,
  locationid: number,
  emails: string[],
  isEmbedded: boolean = false,
  contactPerson: string = null,
  showContact: boolean = false,
  sendValidationEmails: boolean = true,
): Promise<number> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  const NEW_EMP: Employer = EMP_REPO.create({
    FullName: fullname,
    ShortName: shortname,
    Website: website,
    LocationID: locationid,
    Emails: emails,
    isEmbedded: isEmbedded,
    ContactPerson: contactPerson,
    showContact: showContact,
    sendValidationEmails: sendValidationEmails,
  });
  const SAVED_EMP: Employer = await EMP_REPO.save(NEW_EMP);
  return SAVED_EMP.EmployerID;
}

/**
 * Retrieves all the Employers in the Database
 * Throws error but it is handled in Controller
 * @returns Array of Employer.
 * @throws Error
 */
export async function readAllEmployer(): Promise<Employer[]> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  return await EMP_REPO.find();
}

/**
 * Retrieves all active Employers in the Database
 * Throws error but it is handled in Controller
 * @returns Array of Employer.
 * @throws Error
 */
export async function readAllActiveEmployers(): Promise<Employer[]> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  return await EMP_REPO.find({
    where: { isActive: true },
  });
}

export async function readAllEmployerForUser(): Promise<Employer[]> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  const RESULT: Employer[] = await EMP_REPO.find({
    select: [
      "EmployerID",
      "LocationID",
      "ShortName",
      "FullName",
      "Emails",
      "Website",
      "toValidate",
      "isEmbedded",
      "isActive",
      "ContactPerson",
      "showContact",
      "sendValidationEmails",
    ],
  });

  return RESULT;
}
export async function readAllDistinctEmployerName(): Promise<{employer_FullName: string, employer_ShortName: string}[]> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  const QUERY: SelectQueryBuilder<Employer> = EMP_REPO.createQueryBuilder("employer")
    .select("employer.FullName", "employer_FullName")
    .addSelect("employer.ShortName", "employer_ShortName")
    .leftJoin("employer.Jobs", "job")
    .where("employer.toValidate = 0")
    .orWhere("job.isValid = :isValid", { isValid: 1 })
    .distinct(true)
    .orderBy("employer.FullName", "ASC");

  return await QUERY.getRawMany();
}

/**
 * Retrieves an Employer with unique EmployerID
 * Throws error but it is handled in Controller
 * @param empid
 * @returns an Employer.
 * @throws Error
 */
export async function readEmployer(empid: number): Promise<Employer | null> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  const EMPLOYER: Employer | null = await EMP_REPO.findOneBy({ EmployerID: empid });

  if (EMPLOYER) {
    EMPLOYER.Blacklist = EMPLOYER.Blacklist || [];
    EMPLOYER.Whitelist = EMPLOYER.Whitelist || [];
  }

  return EMPLOYER;
}

/**
 * The attributes of an Employer with unique EmployerID will be updated.
 * Throws error but it is handled in Controller
 * @param empid
 * @param new_fullname
 * @param new_shortname
 * @param new_website
 * @param new_emails
 * @returns the updated Employer.
 * @throws Error
 */
export async function updateEmployer(
  empid: number,
  new_shortname: string,
  new_fullname: string,
  new_website: string,
  new_emails: string[],
  new_tovalidate: boolean,
  new_isEmbedded: boolean,
  new_isActive: boolean,
  new_contactPerson: string,
  new_showContact: boolean,
  new_sendValidationEmails: boolean,
): Promise<boolean> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  let employer: Employer = await readEmployer(empid);
  if (!employer) {
    return false;
  }
  employer.FullName = new_fullname;
  employer.ShortName = new_shortname;
  employer.Website = new_website;
  employer.Emails = new_emails;
  employer.toValidate = new_tovalidate;
  employer.isEmbedded = new_isEmbedded;
  employer.isActive = new_isActive;
  employer.ContactPerson = new_contactPerson;
  employer.showContact = new_showContact;
  employer.sendValidationEmails = new_sendValidationEmails;
  await EMP_REPO.save(employer);
  return true;
}

/**
 * Updates the blacklist of an employer.
 * @param employerId - The ID of the employer.
 * @param urls - The list of URLs to add to the blacklist.
 * @throws Error
 */
export async function updateBlacklist(employerId: number, urls: string[]): Promise<void> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);

  try {
    const EMPLOYER: Employer | null = await EMP_REPO.findOneBy({ EmployerID: employerId });

    if (!EMPLOYER) {
      throw new Error(`Employer with ID ${employerId} not found`);
    }

    const CURRENT_BLACKLIST: Set<string> = new Set(EMPLOYER.Blacklist || []);
    const UNIQUE_URLS: string[] = urls.filter(function (url: string): boolean {
      return !CURRENT_BLACKLIST.has(url);
    });

    if (UNIQUE_URLS.length > 0) {
      EMPLOYER.Blacklist = [...CURRENT_BLACKLIST, ...UNIQUE_URLS];
      await EMP_REPO.save(EMPLOYER);
      console.log(`Blacklist updated successfully for employer ID: ${employerId}`);
    } else {
      console.log("No new URLs to add to the blacklist.");
    }
  } catch (error) {
    console.error(`Error updating blacklist for employer ${employerId}:`, error.message);
    throw error;
  }
}

/**
 * Replaces the entire blacklist of an employer with a new list.
 * Unlike updateBlacklist, this completely replaces the existing list.
 * @param employerId - The ID of the employer.
 * @param urls - The complete list of URLs to set as the blacklist.
 * @throws Error
 */
export async function setBlacklist(employerId: number, urls: string[]): Promise<void> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);

  try {
    const EMPLOYER: Employer | null = await EMP_REPO.findOneBy({ EmployerID: employerId });

    if (!EMPLOYER) {
      throw new Error(`Employer with ID ${employerId} not found`);
    }

    EMPLOYER.Blacklist = urls;
    await EMP_REPO.save(EMPLOYER);
    console.log(`Blacklist replaced successfully for employer ID: ${employerId} (${urls.length} URLs)`);
  } catch (error) {
    console.error(`Error setting blacklist for employer ${employerId}:`, error.message);
    throw error;
  }
}

/**
 * Updates the whitelist of an employer.
 * @param employerId - The ID of the employer.
 * @param urls - The list of URLs to add to the whitelist.
 * @throws Error
 */
export async function updateWhitelist(employerId: number, urls: string[]): Promise<void> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);

  try {
    const EMPLOYER: Employer | null = await EMP_REPO.findOneBy({ EmployerID: employerId });

    if (!EMPLOYER) {
      throw new Error(`Employer with ID ${employerId} not found`);
    }

    const CURRENT_WHITELIST: Set<string> = new Set(EMPLOYER.Whitelist || []);
    const UNIQUE_URLS: string[] = urls.filter(function (url: string): boolean {
      return !CURRENT_WHITELIST.has(url);
    });

    if (UNIQUE_URLS.length > 0) {
      EMPLOYER.Whitelist = [...CURRENT_WHITELIST, ...UNIQUE_URLS];
      await EMP_REPO.save(EMPLOYER);
      // Whitelist updated
    } else {
      console.log("No new URLs to add to the whitelist.");
    }
  } catch (error) {
    console.error(`Error updating whitelist for employer ${employerId}:`, error.message);
    throw error;
  }
}

/**
 * Normalizes a URL for comparison by removing query parameters and trailing slashes.
 * @param url - The URL to normalize.
 * @returns The normalized URL (without query params and trailing slash).
 */
function normalizeUrlForComparison(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Remove query parameters and hash
    parsedUrl.search = '';
    parsedUrl.hash = '';
    // Remove trailing slash
    let normalized = parsedUrl.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Deletes a URL from the whitelist of an employer.
 * Uses normalized URL comparison to handle query parameters like ?ref=homepage.
 * @param employerId - The ID of the employer.
 * @param urlToDelete - The URL to remove from the whitelist.
 * @throws Error
 */
export async function deleteFromWhitelist(employerId: number, urlToDelete: string): Promise<void> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);

  try {
    const EMPLOYER: Employer | null = await EMP_REPO.findOneBy({ EmployerID: employerId });

    if (!EMPLOYER) {
      throw new Error(`Employer with ID ${employerId} not found`);
    }

    let currentWhitelist: string[] = EMPLOYER.Whitelist || [];
    const normalizedUrlToDelete = normalizeUrlForComparison(urlToDelete);
    
    // Find matching URL in whitelist (using normalized comparison)
    const matchingUrl = currentWhitelist.find(
      (whitelistUrl) => normalizeUrlForComparison(whitelistUrl) === normalizedUrlToDelete
    );

    if (!matchingUrl) {
      console.log(`URL ${urlToDelete} not found in the whitelist for employer ID: ${employerId}`);
      return;
    }

    // Remove the matching URL from whitelist
    currentWhitelist = currentWhitelist.filter((url) => url !== matchingUrl);
    EMPLOYER.Whitelist = currentWhitelist;

    await EMP_REPO.save(EMPLOYER);
    console.log(
      `URL ${matchingUrl} deleted successfully from whitelist for employer ID: ${employerId}`,
    );
  } catch (error) {
    console.error(`Error deleting URL from whitelist for employer ${employerId}:`, error.message);
    throw error;
  }
}

/**
 * Deletes a specific URL from the blacklist of an employer.
 * Uses normalized URL comparison to match URLs regardless of trailing slashes or query parameters.
 * @param employerId - The ID of the employer.
 * @param urlToDelete - The URL to remove from the blacklist.
 */
export async function deleteFromBlacklist(employerId: number, urlToDelete: string): Promise<void> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);

  try {
    const EMPLOYER: Employer | null = await EMP_REPO.findOneBy({ EmployerID: employerId });

    if (!EMPLOYER) {
      throw new Error(`Employer with ID ${employerId} not found`);
    }

    let currentBlacklist: string[] = EMPLOYER.Blacklist || [];
    const normalizedUrlToDelete = normalizeUrlForComparison(urlToDelete);
    
    // Find matching URL in blacklist (using normalized comparison)
    const matchingUrl = currentBlacklist.find(
      (blacklistUrl) => normalizeUrlForComparison(blacklistUrl) === normalizedUrlToDelete
    );

    if (!matchingUrl) {
      console.log(`URL ${urlToDelete} not found in the blacklist for employer ID: ${employerId}`);
      return;
    }

    // Remove the matching URL from blacklist
    currentBlacklist = currentBlacklist.filter((url) => url !== matchingUrl);
    EMPLOYER.Blacklist = currentBlacklist;

    await EMP_REPO.save(EMPLOYER);
    console.log(
      `URL ${matchingUrl} deleted successfully from blacklist for employer ID: ${employerId}`,
    );
  } catch (error) {
    console.error(`Error deleting URL from blacklist for employer ${employerId}:`, error.message);
    throw error;
  }
}

/**
 * An Employer with unique EmployerID will be deleted from the Database.
 * Throws Error but handled in Controller
 * @param empid
 * @throws Error
 */
export async function deleteEmployer(empid: number): Promise<boolean> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  const RESULT: DeleteResult = await EMP_REPO.delete(empid);
  if (RESULT.affected == 0) {
    return false;
  } else {
    return true;
  }
}

/**
 * Retrieves all job URLs for a specific employer by joining Job and Website tables
 * @param employerId - The employer ID
 * @returns Array of objects containing JobURL
 * @throws Error
 */
export async function getJobUrlsByEmployer(employerId: number): Promise<Array<{ JobURL: string }>> {
  const EMP_REPO: Repository<Employer> = DATA_SOURCE.getRepository(Employer);
  
  const RESULT = await EMP_REPO
    .createQueryBuilder("employer")
    .innerJoin("job", "job", "job.EmployerID = employer.EmployerID")
    .innerJoin("website", "website", "website.WebsiteID = job.WebsiteID")
    .select("website.JobURL", "JobURL")
    .where("employer.EmployerID = :employerId", { employerId })
    .getRawMany();
  
  return RESULT;
}
