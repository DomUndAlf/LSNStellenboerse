import { Request, Response } from "express";
import { httpStatus } from "../../Shared/httpStatus";
import { Location } from "../Models/Entities/Location";
import * as locationService from "../Services/locationService";

/**
 * Creates one Location sends the Status as Response
 */
export async function postLocation(req: Request, res: Response) {
  try {
    let { street, housenumber, postalcode, city } = req.body;
    const RESULT: number = await locationService.createLocation(
      street,
      housenumber,
      postalcode,
      city,
    );
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error(err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Retrieves one Location sends it as JSON
 */
export async function getLocation(req: Request, res: Response) {
  try {
    let { locationid } = req.params;
    const RESULT: Location | null = await locationService.readLocation(Number(locationid));
    if (!RESULT) {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      res.status(httpStatus.OK).json(RESULT);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Retrieves all Location sends it as JSON
 */
export async function getAllLocation(_req: Request, res: Response) {
  try {
    const RESULT: Location[] = await locationService.readAllLocation();
    res.status(httpStatus.OK).json(RESULT);
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error!" });
  }
}

/**
 * Updates Location sends the Status as Response
 */
export async function putLocation(req: Request, res: Response) {
  try {
    let { locationid } = req.params;
    let { new_street, new_housenumber, new_postalcode, new_city } = req.body;
    const RESULT: boolean = await locationService.updateLocation(
      Number(locationid),
      String(new_street),
      String(new_housenumber),
      String(new_postalcode),
      String(new_city),
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
 * Deletes a Location sends the Status as Response
 */
export async function deleteLocation(req: Request, res: Response) {
  try {
    const { locationid: LOCATION_ID } = req.params;
    const RESULT: boolean = await locationService.deleteLocation(Number(LOCATION_ID));
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
