import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import { Repository } from "typeorm";
import { EmployerKeywordLocation } from "../Models/Entities/EmployerKeywordLocation";
import { readEmployer } from "./employerService";
import { readLocation } from "./locationService";
import { Employer } from "../Models/Entities/Employer";
import { Location } from "../Models/Entities/Location";

/**
 * Retrieves all Keywords and LocationIDs for a given EmployerID from the Database.
 * @param employerid
 * @returns an array of EmployerKeywordLocation objects.
 * @throws Error
 */
export async function readKeyWordsForEmployer(
  employerid: number,
): Promise<EmployerKeywordLocation[]> {
  const KEYWORD_REP: Repository<EmployerKeywordLocation> =
    DATA_SOURCE.getRepository(EmployerKeywordLocation);
  return await KEYWORD_REP.find({
    where: {
      Employer: { EmployerID: employerid },
    },
    relations: ["Employer", "Location"],
  });
}
/**
 * Retrieves all Keywords and LocationIDs for a given EmployerID from the Database.
 * @param employerid
 * @returns an array of EmployerKeywordLocation objects.
 * @throws Error
 */
export async function createKeywordsForEmplyoer(
  employerid: number,
  locationid: number,
  keyword: string,
) {
  const KEYWORD_REP: Repository<EmployerKeywordLocation> =
    DATA_SOURCE.getRepository(EmployerKeywordLocation);
  let relatedEmployer: Employer = await readEmployer(employerid);
  let relatedLocation: Location = await readLocation(locationid);
  let newKeyword: EmployerKeywordLocation = KEYWORD_REP.create({
    Employer: relatedEmployer,
    Location: relatedLocation,
    Keyword: keyword,
  });

  await KEYWORD_REP.save(newKeyword);
}
