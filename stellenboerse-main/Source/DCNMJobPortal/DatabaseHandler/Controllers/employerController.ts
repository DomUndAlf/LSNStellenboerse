import { Request, Response } from "express";
import { Employer } from "../Models/Entities/Employer";
import { httpStatus } from "../../Shared/httpStatus";
import * as employerService from "../Services/employerService";

/**
 * Helper function to log errors without full stacktrace
 */
function logError(context: string, err: unknown): void {
  console.error(`${context}:`, err instanceof Error ? err.message : String(err));
}

/**
 * Creates new Employer,
 * Sends 200 for SUCCESS and 500 for Internal Error
 */
export async function postEmployer(req: Request, res: Response) {
  try {
    let {
      shortname,
      fullname,
      website,
      emails,
      locationid,
      isEmbedded,
      contactPerson,
      showContact,
      sendValidationEmails,
    } = req.body;
    await employerService.createEmployer(
      shortname,
      fullname,
      website,
      Number(locationid),
      emails,
      Boolean(isEmbedded),
      contactPerson || null,
      Boolean(showContact),
      sendValidationEmails === undefined ? true : Boolean(sendValidationEmails),
    );
    res.sendStatus(httpStatus.OK);
  } catch (err) {
    logError("employerController", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves all Employer and sends it as JSON
 */
export async function getAllEmployer(_req: Request, res: Response) {
  try {
    const RESULT: Employer[] = await employerService.readAllEmployer();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    logError("employerController", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves all active Employer and sends it as JSON
 */
export async function getAllActiveEmployers(_req: Request, res: Response) {
  try {
    const RESULT: Employer[] = await employerService.readAllActiveEmployers();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    logError("employerController", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

export async function getAllEmployerForUser(_req: Request, res: Response) {
  try {
    const RESULT: Employer[] = await employerService.readAllEmployerForUser();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    logError("employerController", err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getAllDistinctEmployerName(_req: Request, res: Response) {
  try {
    const RESULT: {employer_FullName: string, employer_ShortName: string}[] = await employerService.readAllDistinctEmployerName();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    logError("employerController", err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Retrieves one Employer and sends it as JSON
 */
export async function getEmployer(req: Request, res: Response) {
  try {
    const { empid: EMPLOYER_ID } = req.params;
    const RESULT: Employer | null = await employerService.readEmployer(Number(EMPLOYER_ID));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    logError("employerController", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves the blacklist for a specific employer.
 */
export async function getBlacklist(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);

  if (isNaN(EMPLOYER_ID)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid employer ID" });
    return;
  }

  try {
    const EMPLOYER: Employer | null = await employerService.readEmployer(EMPLOYER_ID);
    const BLACKLIST: string[] = EMPLOYER?.Blacklist || [];
    res.status(httpStatus.OK).json(BLACKLIST);
  } catch (error) {
    logError("getBlacklist", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Retrieves the whitelist for a specific employer.
 */
export async function getWhitelist(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);

  if (isNaN(EMPLOYER_ID)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid employer ID" });
    return;
  }

  try {
    const EMPLOYER: Employer | null = await employerService.readEmployer(EMPLOYER_ID);
    const WHITELIST: string[] = EMPLOYER?.Whitelist || [];
    res.status(httpStatus.OK).json(WHITELIST);
  } catch (error) {
    logError("getWhitelist", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Updates one Employer and sends it Status as Response
 */
export async function putEmployer(req: Request, res: Response) {
  try {
    let { empid } = req.params;
    let {
      new_shortname,
      new_fullname,
      new_website,
      new_emails,
      new_tovalidate,
      new_isEmbedded,
      new_isactive,
      new_contactPerson,
      new_showContact,
      new_sendValidationEmails,
    } = req.body;

    // Fetch current employer to preserve unchanged fields
    const CURRENT_EMPLOYER = await employerService.readEmployer(Number(empid));
    if (!CURRENT_EMPLOYER) {
      res.sendStatus(httpStatus.NOT_FOUND);
      return;
    }

    const RESULT: boolean = await employerService.updateEmployer(
      Number(empid),
      new_shortname !== undefined ? String(new_shortname) : CURRENT_EMPLOYER.ShortName,
      new_fullname !== undefined ? String(new_fullname) : CURRENT_EMPLOYER.FullName,
      new_website !== undefined ? String(new_website) : CURRENT_EMPLOYER.Website,
      new_emails !== undefined ? new_emails : CURRENT_EMPLOYER.Emails,
      new_tovalidate !== undefined ? new_tovalidate : CURRENT_EMPLOYER.toValidate,
      new_isEmbedded !== undefined ? Boolean(new_isEmbedded) : CURRENT_EMPLOYER.isEmbedded,
      new_isactive !== undefined ? Boolean(new_isactive) : CURRENT_EMPLOYER.isActive,
      new_contactPerson !== undefined ? new_contactPerson : CURRENT_EMPLOYER.ContactPerson,
      new_showContact !== undefined ? Boolean(new_showContact) : CURRENT_EMPLOYER.showContact,
      new_sendValidationEmails !== undefined
        ? Boolean(new_sendValidationEmails)
        : CURRENT_EMPLOYER.sendValidationEmails,
    );
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.sendStatus(httpStatus.OK);
    }
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Updates an employer's blacklist.
 */
export async function putBlacklist(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);
  const URLS: string[] = req.body.urls;

  if (isNaN(EMPLOYER_ID) || !Array.isArray(URLS)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid input data" });
    return;
  }

  try {
    await employerService.updateBlacklist(EMPLOYER_ID, URLS);
    res.status(httpStatus.OK).json({ message: "Blacklist updated successfully" });
  } catch (error) {
    logError("putBlacklist", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Replaces an employer's entire blacklist.
 */
export async function replaceBlacklist(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);
  const URLS: string[] = req.body.urls;

  if (isNaN(EMPLOYER_ID) || !Array.isArray(URLS)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid input data" });
    return;
  }

  try {
    await employerService.setBlacklist(EMPLOYER_ID, URLS);
    res.status(httpStatus.OK).json({ message: "Blacklist replaced successfully" });
  } catch (error) {
    logError("replaceBlacklist", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Updates an employer's whitelist.
 */
export async function putWhitelist(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);
  const URLS: string[] = req.body.urls;

  if (isNaN(EMPLOYER_ID) || !Array.isArray(URLS)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid input data" });
    return;
  }

  try {
    await employerService.updateWhitelist(EMPLOYER_ID, URLS);
    res.status(httpStatus.OK).json({ message: "Whitelist updated successfully" });
  } catch (error) {
    logError("putWhitelist", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Deletes a URL from an employer's whitelist.
 */
export async function deleteWhitelistUrl(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);
  const URL_TO_DELETE: string = req.body.url;

  if (isNaN(EMPLOYER_ID) || !URL_TO_DELETE) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid input data" });
    return;
  }

  try {
    await employerService.deleteFromWhitelist(EMPLOYER_ID, URL_TO_DELETE);
    res.status(httpStatus.OK).json({ message: "URL deleted from whitelist successfully" });
  } catch (error) {
    logError("deleteWhitelistUrl", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Deletes a URL from an employer's blacklist.
 */
export async function deleteBlacklistUrl(req: Request, res: Response): Promise<void> {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);
  const URL_TO_DELETE: string = req.body.url;

  if (isNaN(EMPLOYER_ID) || !URL_TO_DELETE) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid input data" });
    return;
  }

  try {
    await employerService.deleteFromBlacklist(EMPLOYER_ID, URL_TO_DELETE);
    res.status(httpStatus.OK).json({ message: "URL deleted from blacklist successfully" });
  } catch (error) {
    logError("deleteBlacklistUrl", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

/**
 * Deletes one Employer and sends it Status as Response
 */
export async function deleteEmployer(req: Request, res: Response) {
  const { empid: EMPLOYER_ID } = req.params;
  try {
    const RESULT: boolean = await employerService.deleteEmployer(Number(EMPLOYER_ID));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.sendStatus(httpStatus.OK);
    }
  } catch (err) {
    logError("employerController", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves the toValidate status of an Employer.
 */
export async function getEmployerValidationStatus(req: Request, res: Response) {
  const EMPLOYER_ID: number = parseInt(req.params.empid, 10);

  if (isNaN(EMPLOYER_ID)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid employer ID" });
    return;
  }

  try {
    const EMPLOYER: Employer | null = await employerService.readEmployer(EMPLOYER_ID);
    if (!EMPLOYER) {
      res.status(httpStatus.NOT_FOUND).json({ error: "Employer not found" });
    } else {
      const TO_VALIDATE: boolean = EMPLOYER.toValidate;
      res.status(httpStatus.OK).json({ TO_VALIDATE });
    }
  } catch (error) {
    logError("getEmployerValidationStatus", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

export async function deleteEmployerForUser(req: Request, res: Response) {
  let { empid } = req.params;
  try {
    const RESULT: boolean = await employerService.deleteEmployer(Number(empid));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.sendStatus(httpStatus.OK);
    }
  } catch (err) {
    logError("employerController", err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Retrieves all job URLs for a specific employer
 * Returns array of objects with JobURL property
 */
export async function getJobUrlsByEmployer(req: Request, res: Response) {
  const { empid } = req.params;
  const EMPLOYER_ID: number = Number(empid);

  if (isNaN(EMPLOYER_ID)) {
    res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid employer ID" });
    return;
  }

  try {
    const JOB_URLS: Array<{ JobURL: string }> = await employerService.getJobUrlsByEmployer(EMPLOYER_ID);
    res.status(httpStatus.OK).json(JOB_URLS);
  } catch (error) {
    logError("getJobUrlsByEmployer", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}
