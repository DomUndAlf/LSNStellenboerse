import { Request, Response } from "express";
import * as privilegeService from "../Services/privilegeService";
import { httpStatus } from "../../Shared/httpStatus";

export async function existsPrivilege(req: Request, res: Response) {
  try {
    let { key } = req.params;
    let exists: boolean = await privilegeService.hasPrivilege(key);
    if (exists) {
      res.sendStatus(httpStatus.OK);
    } else {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
