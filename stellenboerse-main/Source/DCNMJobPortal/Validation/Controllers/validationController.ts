import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { sendValidationEmail } from "../Services/validationEmail";
import axios, { isAxiosError } from "axios";
import * as rand from "random-key";

export async function postEmail(req: Request, res: Response) {
  try {
    const { jobid: JOB_ID } = req.params;
    const NEW_VALIDATION_KEY: string = rand.generate(24);

    if (isNaN(Number(JOB_ID))) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: "Invalid job ID. Please provide a valid numeric jobid.",
      });
    }

    await axios.put(
      `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/validation/${JOB_ID}`,
      {
        validationkey: NEW_VALIDATION_KEY,
      },
    );
    await sendValidationEmail(Number(JOB_ID), NEW_VALIDATION_KEY);

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    console.error(error);
    if (isAxiosError(error)) {
      if (error.response && error.response.status == httpStatus.NOT_FOUND) {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }
    }
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error!",
    });
  }
}
