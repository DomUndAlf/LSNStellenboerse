import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { EmployerKeywordLocation } from "../Models/Entities/EmployerKeywordLocation";
import * as keywordService from "../Services/keywordService";

/**
 * Retrieves the KeyWords for an Employer
 */
export async function getKeyWords(req: Request, res: Response) {
  try {
    const { employerid: EMPLOYER_ID } = req.params;
    const RESULT: EmployerKeywordLocation[] = await keywordService.readKeyWordsForEmployer(
      Number(EMPLOYER_ID),
    );
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error(err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function postKeyword(req: Request, res: Response) {
  try {
    let { employerid, locationid, keyword } = req.body;
    await keywordService.createKeywordsForEmplyoer(employerid, locationid, keyword);
    res.sendStatus(httpStatus.OK);
  } catch (err) {
    console.error(err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
