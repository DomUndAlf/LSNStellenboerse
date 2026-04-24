import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { scheduleScraper } from "../Services/scraperScheduler";

export async function startScraperSchedule(_req: Request, res: Response): Promise<Response> {
  try {
    scheduleScraper();
    return res.status(httpStatus.OK).json({ message: "Scheduler started" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Error starting the scheduler", details: error.message });
  }
}
