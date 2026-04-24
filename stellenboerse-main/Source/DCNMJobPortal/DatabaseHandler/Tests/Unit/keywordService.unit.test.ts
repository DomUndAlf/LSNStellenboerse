import { expect, test, jest } from "@jest/globals";
import { readKeyWordsForEmployer } from "../../Services/keywordService";
import { Repository } from "typeorm";
import { DATA_SOURCE } from "../../../DatabaseHandler/Config/data-source";
import { EmployerKeywordLocation } from "../../Models/Entities/EmployerKeywordLocation";

let keywordRepo: Repository<EmployerKeywordLocation> =
  DATA_SOURCE.getRepository<EmployerKeywordLocation>(EmployerKeywordLocation);

let mockedKeyword: EmployerKeywordLocation = {
  ID: 1,
  Keyword: "mockedKeyword",
} as EmployerKeywordLocation;

test("Read Key Words for Employer", async function () {
  jest.spyOn(keywordRepo, "find").mockResolvedValue([mockedKeyword]);
  let result: EmployerKeywordLocation[] = await readKeyWordsForEmployer(1);
  expect(result).toStrictEqual([mockedKeyword]);
});
