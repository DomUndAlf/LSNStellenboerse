import { Job } from "../../../DatabaseHandler/Models/Entities/Job";
import { Website } from "../../Models/Entities/Website";
import { Employer } from "../../Models/Entities/Employer";
import { Location } from "../../Models/Entities/Location";
import { expect, test, describe, jest, afterEach } from "@jest/globals";
import { DATA_SOURCE } from "../../Config/data-source";
import { Repository, DeleteResult } from "typeorm";
import * as jobService from "../../Services/jobService";
import * as locationService from "../../Services/locationService";
import * as websiteService from "../../Services/websiteService";
import * as employerService from "../../Services/employerService";

jest.mock("../../Services/employerService");
jest.mock("../../Services/locationService");
jest.mock("../../Services/websiteService");
let jobRepo: Repository<Job> = DATA_SOURCE.getRepository(Job);
let spyEmpFind: jest.SpiedFunction<typeof employerService.readEmployer> = jest.spyOn(
  employerService,
  "readEmployer",
);
let spyLocFind: jest.SpiedFunction<typeof locationService.readLocation> = jest.spyOn(
  locationService,
  "readLocation",
);
let spyWebFind: jest.SpiedFunction<typeof websiteService.readWebsite> = jest.spyOn(
  websiteService,
  "readWebsite",
);

export const MOCKED_LOCATION: Location = {
  LocationID: 1,
  Street: "mock street",
  HouseNumber: "1",
  PostalCode: "00001",
  City: "mocked city",
  created_at: new Date("2024-01-01"),
  Jobs: [],
  EmployerKeywordLocations: [],
};
export const MOCKED_EMP: Employer = {
  EmployerID: 1,
  LocationID: 1,
  Emails: ["mock@yahoo.com"],
  ShortName: "mockShortName",
  FullName: "mockFullName",
  created_at: new Date("2024-01-01"),
  Jobs: [],
  Website: "",
  Blacklist: [],
  Whitelist: [],
  toValidate: false,
  EmployerKeywordLocations: [],
  isEmbedded: false,
  isActive: false,
  ContactPerson: null,
  showContact: false,
};

export const MOCKED_WEBSITE: Website = {
  WebsiteID: 1,
  JobURL: "mockurl.com",
  ETag: "mocktag",
  Hash: "mockhash",
  LastModified: "mock",
  Jobs: [],
};

const MOCKED_JOB: Job = {
  Title: "Mock Title",
  Description: "Mock Description",
  JobID: 1,
  EmployerID: 1,
  LocationID: 1,
  WebsiteID: 1,
  ApplicationDeadline: new Date("2024-01-01"),
  Language: "mockLanguage",
  Specialty: ["mockSpecialty"],
  created_at: new Date("2024-01-01"),
  Employer: MOCKED_EMP,
  Location: MOCKED_LOCATION,
  Website: MOCKED_WEBSITE,
  isValid: true,
} as Job;

jest.spyOn(jobRepo, "create").mockReturnValue(MOCKED_JOB);

describe("Job Services", function () {
  afterEach(function () {
    spyEmpFind.mockClear();
    spyLocFind.mockClear();
    spyWebFind.mockClear();
  });

  test("Read Job", async function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MOCK_QUERY_BUILDER: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(MOCKED_JOB as never),
    };
    jest.spyOn(jobRepo, "createQueryBuilder").mockReturnValue(MOCK_QUERY_BUILDER);
    const RESULT: Job | null = await jobService.readJob(1);
    expect(RESULT).toBe(MOCKED_JOB);
  });

  test("Read Job with Error", async function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MOCK_QUERY_BUILDER: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockRejectedValue(new Error() as never),
    };
    jest.spyOn(jobRepo, "createQueryBuilder").mockReturnValue(MOCK_QUERY_BUILDER);
    await expect(jobService.readJob(1)).rejects.toThrow();
  });

  test("Read All Job", async function () {
    let spyJobFindRelation: jest.SpiedFunction<typeof jobRepo.find> = jest.spyOn(jobRepo, "find");
    spyJobFindRelation.mockResolvedValue([MOCKED_JOB]);
    const RESULT: Job[] = await jobService.readAllJob();
    expect(RESULT).toStrictEqual([MOCKED_JOB]);
  });

  test("Read All Job with Error", async function () {
    jest.spyOn(jobRepo, "find").mockRejectedValue(new Error());
    await expect(jobService.readAllJob()).rejects.toThrow();
  });

  test("Get JobID by URL", async function () {
    let websiteRepo: Repository<Website> = DATA_SOURCE.getRepository(Website);
    jest.spyOn(websiteRepo, "findOne").mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    const RESULT: number | null = await jobService.getJobIDByUrl("mockurl.com");
    expect(RESULT).toBe(MOCKED_JOB.JobID);
  });

  test("Get JobID by URL with null Website", async function () {
    let websiteRepo: Repository<Website> = DATA_SOURCE.getRepository(Website);
    jest.spyOn(websiteRepo, "findOne").mockResolvedValue(null);
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    await expect(jobService.getJobIDByUrl("mockurl.com")).rejects.toThrowError();
  });

  test("Get JobID by URL with null Job", async function () {
    let websiteRepo: Repository<Website> = DATA_SOURCE.getRepository(Website);
    jest.spyOn(websiteRepo, "findOne").mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(null);
    await expect(jobService.getJobIDByUrl("mockurl.com")).rejects.toThrow();
  });

  test("Save or Update Job, Update", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    spyEmpFind.mockResolvedValue(MOCKED_EMP);
    spyLocFind.mockResolvedValue(MOCKED_LOCATION);
    spyWebFind.mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    expect(
      await jobService.saveOrUpdateJob(
        1,
        1,
        "mock",
        "mock",
        [],
        new Date("2024-01-01"),
        1,
        "mockLanguage",
        ["mockSpecialty"],
      ),
    ).toBe(MOCKED_JOB.JobID);
  });

  test("Save or Update Job, Save", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(null);
    jest.spyOn(jobRepo, "count").mockResolvedValue(0);
    spyEmpFind.mockResolvedValue(MOCKED_EMP);
    spyLocFind.mockResolvedValue(MOCKED_LOCATION);
    spyWebFind.mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(jobRepo, "create").mockReturnValue(MOCKED_JOB);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    expect(
      await jobService.saveOrUpdateJob(
        1,
        1,
        "mock",
        "mock",
        [],
        new Date("2024-01-01"),
        1,
        "mockLanguage",
        ["mockSpecialty"],
      ),
    ).toBe(MOCKED_JOB.JobID);
  });

  test("Save or Update Job with null Employer", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    spyEmpFind.mockResolvedValue(null);
    spyLocFind.mockResolvedValue(MOCKED_LOCATION);
    spyWebFind.mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    await expect(
      jobService.saveOrUpdateJob(
        1,
        1,
        "mock",
        "mock",
        [],
        new Date("2024-01-01"),
        1,
        "mockLanguage",
        ["mockSpecialty"],
      ),
    ).rejects.toThrow();
  });

  test("Save or Update Job with null Location", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    spyEmpFind.mockResolvedValue(MOCKED_EMP);
    spyLocFind.mockResolvedValue(null);
    spyWebFind.mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    await expect(
      jobService.saveOrUpdateJob(
        1,
        1,
        "mock",
        "mock",
        [],
        new Date("2024-01-01"),
        1,
        "mockLanguage",
        ["mockSpecialty"],
      ),
    ).rejects.toThrow();
  });

  test("Save or Update Job with null Website", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    spyEmpFind.mockResolvedValue(MOCKED_EMP);
    spyLocFind.mockResolvedValue(MOCKED_LOCATION);
    spyWebFind.mockResolvedValue(null);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    await expect(
      jobService.saveOrUpdateJob(
        1,
        1,
        "mock",
        "mock",
        [],
        new Date("2024-01-01"),
        1,
        "mockLanguage",
        ["mockSpecialty"],
      ),
    ).rejects.toThrow();
  });

  test("Save or Update Job with invalid Title", async function () {
    await expect(
      jobService.saveOrUpdateJob(1, 1, "", "mock", [], new Date("2024-01-01"), 1, "mockLanguage", [
        "mockSpecialty",
      ]),
    ).rejects.toThrow();
  });

  test("Save or Update Job with invalid Description", async function () {
    await expect(
      jobService.saveOrUpdateJob(1, 1, "mock", "", [], new Date("2024-01-01"), 1, "mockLanguage", [
        "mockSpecialty",
      ]),
    ).rejects.toThrow();
  });

  test("Delete Job", async function () {
    let websiteRepo: Repository<Website> = DATA_SOURCE.getRepository(Website);
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    jest.spyOn(employerService, "deleteFromWhitelist").mockResolvedValue();
    let spyDelete: jest.SpiedFunction<typeof jobRepo.delete> = jest.spyOn(jobRepo, "delete");
    let mockDelteResult: DeleteResult = {
      raw: "mock",
      affected: 1,
    };
    spyDelete.mockResolvedValue(mockDelteResult);
    jest.spyOn(websiteRepo, "delete").mockResolvedValue(mockDelteResult);
    const RESULT: boolean = await jobService.deleteJob(1);
    expect(RESULT).toBe(true);
  });

  test("Delete Job, Not Found", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(null);
    const RESULT: boolean = await jobService.deleteJob(1);
    expect(RESULT).toBe(false);
  });

  test("Delete Job with Error", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    jest.spyOn(employerService, "deleteFromWhitelist").mockResolvedValue();
    jest.spyOn(jobRepo, "delete").mockRejectedValue(new Error());
    await expect(jobService.deleteJob(1)).rejects.toThrow();
  });

  test("Set Validation Key", async function () {
    jest.spyOn(jobRepo, "findOneBy").mockResolvedValue(MOCKED_JOB);
    const RESULT: boolean = await jobService.setValidationKey(1, "mockValidationKey");
    expect(RESULT).toBe(true);
  });

  test("Set Validation Key", async function () {
    jest.spyOn(jobRepo, "findOneBy").mockResolvedValue(null);
    const RESULT: boolean = await jobService.setValidationKey(1, "mockValidationKey");
    expect(RESULT).toBe(false);
  });

  test("Set Validation Key, Fail", async function () {
    jest.spyOn(jobRepo, "findOneBy").mockResolvedValue(MOCKED_JOB);
    jest.spyOn(jobRepo, "save").mockRejectedValue(new Error());
    await expect(jobService.setValidationKey(1, "mockKey")).rejects.toThrow();
  });

  test("Validate Job", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(MOCKED_JOB);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    const RESULT: boolean = await jobService.validateJob(
      1,
      "mock",
      "mock",
      [],
      new Date("2024-01-01"),
      "de",
      ["mockSpecialty"],
    );
    expect(RESULT).toBe(true);
  });

  test("Validate Job, Not Found", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(null);
    jest.spyOn(jobRepo, "save").mockResolvedValue(MOCKED_JOB);
    const RESULT: boolean = await jobService.validateJob(
      1,
      "mock",
      "mock",
      [],
      new Date("2024-01-01"),
      "de",
      ["mockSpecialty"],
    );
    expect(RESULT).toBe(false);
  });

  test("Read Job by Validation Key", async function () {
    const MOCKED_JOB_WITH_URL: Job & { JobURL: string | null } = {
      ...MOCKED_JOB,
      JobURL: "https://example.com/job",
    };

    jest.spyOn(jobService, "readJobByValidationKey").mockResolvedValueOnce(MOCKED_JOB_WITH_URL);

    const RESULT: (Job & { JobURL: string | null }) | null =
      await jobService.readJobByValidationKey("mockkey");
    expect(RESULT).toEqual(MOCKED_JOB_WITH_URL);
  });

  test("Read Job by Validation Key, Not Found", async function () {
    jest.spyOn(jobRepo, "findOne").mockResolvedValue(null);
    const RESULT: (Job & { JobURL: string | null }) | null =
      await jobService.readJobByValidationKey("mockkey");
    expect(RESULT).toBe(null);
  });
});

test("Delete Job by URL", async function () {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const SPYDELETEJOB: jest.SpiedFunction<typeof JOB_REPO.delete> = jest.spyOn(JOB_REPO, "delete");
  const SPY_DELETE_WEBSITE: jest.SpiedFunction<typeof WEBSITE_REPO.delete> = jest.spyOn(
    WEBSITE_REPO,
    "delete",
  );

  const MOCH_DELETE_RESULT: DeleteResult = { raw: "mock", affected: 1 };
  jest.spyOn(WEBSITE_REPO, "findOne").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(JOB_REPO, "findOne").mockResolvedValue(MOCKED_JOB);
  SPYDELETEJOB.mockResolvedValue(MOCH_DELETE_RESULT);
  SPY_DELETE_WEBSITE.mockResolvedValue(MOCH_DELETE_RESULT);
  jest.spyOn(employerService, "deleteFromWhitelist").mockResolvedValue();

  const RESULT: boolean = await jobService.deleteJobByUrl("mock", 1);
  expect(RESULT).toBe(true);
  expect(WEBSITE_REPO.findOne).toHaveBeenCalledWith({ where: { JobURL: "mock" } });
  expect(JOB_REPO.findOne).toHaveBeenCalledWith({
    where: { Website: { WebsiteID: MOCKED_WEBSITE.WebsiteID } },
  });
  expect(SPYDELETEJOB).toHaveBeenCalledWith(MOCKED_JOB.JobID);
  expect(SPY_DELETE_WEBSITE).toHaveBeenCalledWith(MOCKED_WEBSITE.WebsiteID);
  expect(employerService.deleteFromWhitelist).toHaveBeenCalledWith(MOCKED_JOB.EmployerID, "mock");
});

test("Delete Job by URL with null Website", async function () {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  jest.spyOn(WEBSITE_REPO, "findOne").mockResolvedValue(null);
  const DELETE_FROM_WHITELIST_MOCK: jest.SpiedFunction<typeof employerService.deleteFromWhitelist> =
    jest.spyOn(employerService, "deleteFromWhitelist").mockResolvedValue();

  await expect(jobService.deleteJobByUrl("mockurl.com", 1)).resolves.toBe(true);

  expect(WEBSITE_REPO.findOne).toHaveBeenCalledWith({ where: { JobURL: "mockurl.com" } });
  expect(DELETE_FROM_WHITELIST_MOCK).toHaveBeenCalledWith(1, "mockurl.com");
});

test("Delete Job by URL with null Job", async function () {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  jest.spyOn(WEBSITE_REPO, "findOne").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(JOB_REPO, "findOne").mockResolvedValue(null);
  jest.spyOn(WEBSITE_REPO, "delete").mockResolvedValue({ affected: 1 } as DeleteResult);
  const DELETE_FROM_WHITELIST_MOCK: jest.SpiedFunction<typeof employerService.deleteFromWhitelist> =
    jest.spyOn(employerService, "deleteFromWhitelist").mockResolvedValue();

  await expect(jobService.deleteJobByUrl("mockurl.com", 1)).resolves.toBe(true);

  expect(WEBSITE_REPO.findOne).toHaveBeenCalledWith({ where: { JobURL: "mockurl.com" } });
  expect(JOB_REPO.findOne).toHaveBeenCalledWith({
    where: { Website: { WebsiteID: MOCKED_WEBSITE.WebsiteID } },
  });
  expect(WEBSITE_REPO.delete).toHaveBeenCalledWith(MOCKED_WEBSITE.WebsiteID);
  expect(DELETE_FROM_WHITELIST_MOCK).toHaveBeenCalledWith(1, "mockurl.com");
});

test("Delete Job by URL, Not Found", async function () {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const JOB_REPO: Repository<Job> = DATA_SOURCE.getRepository(Job);
  const SPYDELETEJOB: jest.SpiedFunction<typeof JOB_REPO.delete> = jest.spyOn(JOB_REPO, "delete");
  const SPY_DELETE_WEBSITE: jest.SpiedFunction<typeof WEBSITE_REPO.delete> = jest.spyOn(
    WEBSITE_REPO,
    "delete",
  );

  const MOCH_DELETE_RESULT: DeleteResult = { raw: "mock", affected: 0 };
  jest.spyOn(WEBSITE_REPO, "findOne").mockResolvedValue(MOCKED_WEBSITE);
  jest.spyOn(JOB_REPO, "findOne").mockResolvedValue(MOCKED_JOB);
  SPYDELETEJOB.mockResolvedValue(MOCH_DELETE_RESULT);
  SPY_DELETE_WEBSITE.mockResolvedValue(MOCH_DELETE_RESULT);
  jest.spyOn(employerService, "deleteFromWhitelist").mockResolvedValue();

  const RESULT: boolean = await jobService.deleteJobByUrl("mockurl.com", 1);
  expect(RESULT).toBe(false);
  expect(WEBSITE_REPO.findOne).toHaveBeenCalledWith({ where: { JobURL: "mockurl.com" } });
  expect(JOB_REPO.findOne).toHaveBeenCalledWith({
    where: { Website: { WebsiteID: MOCKED_WEBSITE.WebsiteID } },
  });
  expect(SPYDELETEJOB).toHaveBeenCalledWith(MOCKED_JOB.JobID);
  expect(SPY_DELETE_WEBSITE).toHaveBeenCalledWith(MOCKED_WEBSITE.WebsiteID);
  expect(employerService.deleteFromWhitelist).toHaveBeenCalledWith(
    MOCKED_JOB.EmployerID,
    "mockurl.com",
  );
});
