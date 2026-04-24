import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { serialStart, parallelStart, scrapeAllEmployers } from "../Services/crawlerManager";

export async function postSerialStart(req: Request, res: Response) {
  console.log("Webmonitor - Serial Mode");
  try {
    const { empid: EMP_ID } = req.params;

    if (isNaN(Number(EMP_ID))) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: "Invalid employee ID. Please provide a valid numeric empid.",
      });
    }

    await serialStart(Number(EMP_ID));

    return res.status(httpStatus.OK).json({
      message: "WebAgent started in serial mode successfully",
      empid: Number(EMP_ID),
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

export async function postParallelStart(req: Request, res: Response) {
  console.log("Webmonitor - Parallel Mode");
  try {
    const { empid: EMP_ID } = req.params;

    if (isNaN(Number(EMP_ID))) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: "Invalid employee ID. Please provide a valid numeric empid.",
      });
    }

    await parallelStart(Number(EMP_ID));

    return res.status(httpStatus.OK).json({
      message: "WebAgent started in parallel mode successfully",
      empid: Number(EMP_ID),
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

export async function postScrapeAllEmployers(_req: Request, res: Response) {
  console.log("Crawler Controller has started for all employers!");
  try {
    await scrapeAllEmployers();
    console.log("Scraping process completed for all employers.");
    return res.status(httpStatus.OK).json({
      message: "Scraping for all employers started successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}

export async function postScrapeAllActiveEmployers(_req: Request, res: Response) {
  console.log("Crawler Controller has started for all active employers!");
  try {
    await scrapeAllEmployers(false, true);
    console.log("Scraping process completed for all active employers.");
    return res.status(httpStatus.OK).json({
      message: "Scraping for all active employers started successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}
