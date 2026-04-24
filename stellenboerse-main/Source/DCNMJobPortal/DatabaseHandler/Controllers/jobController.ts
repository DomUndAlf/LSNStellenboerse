import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { Job } from "../Models/Entities/Job";
import * as jobService from "../Services/jobService";
import { paginate, sort } from "../Services/clientLogic";

/**
 * Helper function to log errors without full stacktrace
 */
function logError(context: string, err: unknown): void {
  console.error(`${context}:`, err instanceof Error ? err.message : String(err));
}

/**
 * Retrieves all Job and sends them as JSON
 */
export async function getAllJob(_req: Request, res: Response) {
  try {
    const RESULT: Job[] = await jobService.readAllJob();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error("Error in getAllJob:", err instanceof Error ? err.message : String(err));
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves one Job and sends it as JSON
 */
export async function getJob(req: Request, res: Response) {
  try {
    const { jobid: JOB_ID } = req.params;
    const RESULT: Job | null = await jobService.readJob(Number(JOB_ID));
    if (RESULT == null) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    logError("getJob", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves one Job and sends it as JSON for Validation
 */
export async function getJobForValidation(req: Request, res: Response) {
  try {
    const { jobid: JOB_ID } = req.params;
    const RESULT: Job | null = await jobService.readJobForValidation(Number(JOB_ID));
    if (RESULT == null) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    logError("getJobForValidation", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves one Job by URL and sends it as JSON
 */
export async function getJobIDByUrl(req: Request, res: Response) {
  try {
    const { url: URL } = req.body;
    const RESULT: number = await jobService.getJobIDByUrl(String(URL));
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    logError("getJobIDByUrl", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error! " });
  }
}

export async function getJobByWebsiteId(req: Request, res: Response) {
  try {
    const { websiteid: WEBSITE_ID } = req.params;
    const JOB: Job | null = await jobService.getJobByWebsiteId(Number(WEBSITE_ID));
    if (!JOB) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(JOB);
    }
  } catch (err) {
    logError("getJobByWebsiteId", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

export async function mainFilter(req: Request, res: Response) {
  try {
    let {
      specialty,
      language,
      employernames,
      sortmode,
      sortorder,
      searchterms,
      page,
    } = req.body;

    let [jobs, count]: [Job[], number] = await jobService.mainFilter(
      specialty,
      language,
      employernames,
      searchterms || [],
    );

    jobs = sort(jobs, sortmode, sortorder);
    jobs = paginate(jobs, page);

    res.status(httpStatus.OK).json({ jobs, count });
  } catch (err) {
    logError("mainFilter", err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Saves or Updates one Job and sends the Status as Response
 */
export async function saveOrUpdateJob(req: Request, res: Response) {
  try {
    const {
      APPLICATION_DEADLINE,
      EMP_ID,
      LOCATION_ID,
      TITLE,
      DESCRIPTION,
      TASKS,
      WEBSITE_ID,
      LANGUAGE,
      SPECIALTY,
    } = req.body;

    const RESULT: number = await jobService.saveOrUpdateJob(
      Number(EMP_ID),
      Number(LOCATION_ID),
      String(TITLE),
      String(DESCRIPTION),
      Array.isArray(TASKS) ? TASKS.map(String) : [],
      APPLICATION_DEADLINE ? new Date(APPLICATION_DEADLINE) : null,
      Number(WEBSITE_ID),
      String(LANGUAGE),
      Array.isArray(SPECIALTY) ? SPECIALTY.map(String) : [],
    );

    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    logError("saveOrUpdateJob", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error! " });
  }
}

/**
 * Deletes one Job and sends status as Response
 */
export async function deleteJob(req: Request, res: Response) {
  try {
    const { jobid: JOB_ID } = req.params;
    const RESULT: boolean = await jobService.deleteJob(Number(JOB_ID));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.sendStatus(httpStatus.OK);
    }
  } catch (err) {
    logError("deleteJob", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Sets the Validation key for a specific Job.
 * Sends http-Status Code
 */
export async function setValidationKey(req: Request, res: Response) {
  try {
    const { jobid: JOB_ID } = req.params;
    const { validationkey: VALIDATION_KEY } = req.body;
    const RESPONSE: boolean = await jobService.setValidationKey(
      Number(JOB_ID),
      String(VALIDATION_KEY),
    );
    if (!RESPONSE) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.sendStatus(httpStatus.OK);
    }
  } catch (err) {
    logError("setValidationKey", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error! " });
  }
}

/**
 * Saves Validated Job
 */
export async function validateJob(req: Request, res: Response) {
  try {
    let { jobid } = req.params;
    const {
      VALID_TITLE,
      VALID_DESCRIPTION,
      VALID_TASKS,
      VALID_DEADLINE,
      VALID_LANGUAGE,
      VALID_SPECIALTY,
    } = req.body;

    const DEADLINE: Date | null = VALID_DEADLINE ? new Date(VALID_DEADLINE) : null;
    let response: boolean = await jobService.validateJob(
      Number(jobid),
      String(VALID_TITLE),
      String(VALID_DESCRIPTION),
      Array.isArray(VALID_TASKS) ? VALID_TASKS.map(String) : [],
      DEADLINE,
      String(VALID_LANGUAGE),
      Array.isArray(VALID_SPECIALTY) ? VALID_SPECIALTY.map(String) : [],
    );

    if (response) {
      res.sendStatus(httpStatus.OK);
    } else {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
  } catch (err) {
    logError("validateJob", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves one Job by Validation Key and sends it as JSON
 */
export async function getJobByValidationKey(req: Request, res: Response) {
  try {
    let { key } = req.params;
    const RESULT: Job | null = await jobService.readJobByValidationKey(String(key));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    logError("getJobByValidationKey", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

export async function deleteJobByUrl(req: Request, res: Response) {
  try {
    let { url, employerId } = req.body;
    const RESULT: boolean = await jobService.deleteJobByUrl(String(url), Number(employerId));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    logError("deleteJobByUrl", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

export async function getAllJobsForUser(_req: Request, res: Response) {
  try {
    const RESULT: Job[] = await jobService.readAllJobForUser();
    res.status(httpStatus.OK).json(RESULT);
  } catch (error) {
    logError("getAllJobsForUser", error);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
