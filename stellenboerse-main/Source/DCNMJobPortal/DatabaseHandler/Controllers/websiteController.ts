import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { Website } from "../Models/Entities/Website";
import * as websiteService from "../Services/websiteService";

/**
 * Creates a Website sends the Status as Response
 */
export async function postWebsite(req: Request, res: Response) {
  try {
    const { joburl: JOB_URL, etag: E_TAG, hash: HASH, lastmodified: LAST_MODIFIED } = req.body;
    const RESULT: number = await websiteService.createWebsite(
      String(JOB_URL),
      String(E_TAG),
      String(HASH),
      String(LAST_MODIFIED),
    );
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves all Website sends them as JSON
 */
export async function getAllWebsite(_req: Request, res: Response) {
  try {
    const RESULT: Website[] = await websiteService.readAllWebsite();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves one Website with specific ID and sends it as JSON
 */
export async function getWebsite(req: Request, res: Response) {
  try {
    const { websiteid: WEBSITE_ID } = req.params;
    const RESULT: Website | null = await websiteService.readWebsite(Number(WEBSITE_ID));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Retrieves a Website by JobUrl sends it as JSON
 */
export async function getWebsiteByJobUrl(req: Request, res: Response) {
  try {
    const { joburl: JOB_URL } = req.body;
    const RESULT: Website | null = await websiteService.readWebsiteByJobUrl(String(JOB_URL));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Updates a Website and sends the Status as Response
 */
export async function putWebsite(req: Request, res: Response) {
  try {
    const { websiteid: WEBSITE_ID } = req.params;
    const {
      new_joburl: NEW_JOBURL,
      new_etag: NEW_E_TAG,
      new_hash: NEW_HASH,
      new_lastmodified: NEW_LAST_MODIFIED,
    } = req.body;
    const RESULT: boolean = await websiteService.updateWebsite(
      Number(WEBSITE_ID),
      String(NEW_JOBURL),
      String(NEW_E_TAG),
      String(NEW_HASH),
      String(NEW_LAST_MODIFIED),
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

export async function upsertWebsiteByJobUrl(req: Request, res: Response) {
  try {
    const { joburl: JOB_URL, etag: E_TAG, lastmodified: LAST_MODIFIED, hash: HASH } = req.body;
    const RESULT: number = await websiteService.upsertWebsiteByJobUrl(
      JOB_URL,
      E_TAG,
      LAST_MODIFIED,
      HASH,
    );
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error("Error in webste Controller, Could not upsertWebsiteByJobUrl", err instanceof Error ? err.message : String(err));
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}
