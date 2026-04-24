import { Employer } from "../../../DatabaseHandler/Models/Entities/Employer";
import { Location } from "../../../DatabaseHandler/Models/Entities/Location";
import { expect, test, describe, jest, beforeEach } from "@jest/globals";
import { DeleteResult, Repository } from "typeorm";
import { DATA_SOURCE } from "../../../DatabaseHandler/Config/data-source";
import * as employerService from "../../Services/employerService";

export const MOCKED_LOCATION: Location = {
  LocationID: 1,
  Street: "mock street",
  HouseNumber: "1",
  PostalCode: "00001",
  created_at: new Date("2024-01-01"),
  Jobs: [],
  City: "mocked city",
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
  sendValidationEmails: true,
};

let empRepo: Repository<Employer> = DATA_SOURCE.getRepository<Employer>(Employer);
jest.spyOn(empRepo, "create").mockReturnValue(MOCKED_EMP);

describe("Employer Services", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  test("Create Employer", async function () {
    jest.spyOn(empRepo, "save").mockResolvedValue(MOCKED_EMP);
    const RESULT: number = await employerService.createEmployer("mock", "mock", "mock", 1, [
      "mock",
    ]);
    expect(RESULT).toBe(MOCKED_EMP.EmployerID);
  });

  test("Create Employer, Error", async function () {
    jest.spyOn(empRepo, "save").mockRejectedValue(new Error());
    await expect(
      employerService.createEmployer("mock", "mock", "mock", 1, ["mock"]),
    ).rejects.toThrow();
  });

  test("Read Employer", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(MOCKED_EMP);
    const RESULT: Employer | null = await employerService.readEmployer(MOCKED_EMP.EmployerID);
    expect(RESULT).toBe(MOCKED_EMP);
  });

  test("Read Employer, Error", async function () {
    jest.spyOn(empRepo, "findOneBy").mockRejectedValue(new Error());
    await expect(employerService.readEmployer(MOCKED_EMP.EmployerID)).rejects.toThrow();
  });

  test("Read All Employer", async function () {
    jest.spyOn(empRepo, "find").mockResolvedValue([MOCKED_EMP]);
    const RESULT: Employer[] = await employerService.readAllEmployer();
    expect(RESULT).toStrictEqual([MOCKED_EMP]);
  });

  test("Read All Employer, Error", async function () {
    jest.spyOn(empRepo, "find").mockRejectedValue(new Error());
    await expect(employerService.readAllEmployer()).rejects.toThrow();
  });

  test("Read All Distinct Employer Names - includes employers without jobs", async function () {
    const mockGetRawMany = jest.fn() as any;
    mockGetRawMany.mockResolvedValue([
      { employer_FullName: "Company With Jobs", employer_ShortName: "CWJ" },
      { employer_FullName: "Company Without Jobs", employer_ShortName: "CWOJ" },
      { employer_FullName: "Another Company", employer_ShortName: "AC" },
    ]);

    const mockQueryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: mockGetRawMany,
    };

    jest.spyOn(empRepo, "createQueryBuilder").mockReturnValue(mockQueryBuilder);

    const RESULT: {employer_FullName: string, employer_ShortName: string}[] = await employerService.readAllDistinctEmployerName();

    expect(mockQueryBuilder.select).toHaveBeenCalledWith("employer.FullName", "employer_FullName");
    expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith("employer.ShortName", "employer_ShortName");
    expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith("employer.Jobs", "job");
    expect(mockQueryBuilder.where).toHaveBeenCalledWith("employer.toValidate = 0");
    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("job.isValid = :isValid", {
      isValid: 1,
    });
    expect(mockQueryBuilder.distinct).toHaveBeenCalledWith(true);
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("employer.FullName", "ASC");
    expect(RESULT).toHaveLength(3);
  });

  test("Read All Distinct Employer Names - Error", async function () {
    const mockGetRawMany = jest.fn() as any;
    mockGetRawMany.mockRejectedValue(new Error("Database error"));

    const mockQueryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: mockGetRawMany,
    };

    jest.spyOn(empRepo, "createQueryBuilder").mockReturnValue(mockQueryBuilder);

    await expect(employerService.readAllDistinctEmployerName()).rejects.toThrow("Database error");
  });

  test("Read Employer with undefined Blacklist and Whitelist", async function () {
    const EMP_WITH_UNDEFINED_LISTS: Partial<Employer> = {
      ...MOCKED_EMP,
      Blacklist: undefined,
      Whitelist: undefined,
    };

    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(EMP_WITH_UNDEFINED_LISTS as Employer);

    const RESULT: Employer | null = await employerService.readEmployer(MOCKED_EMP.EmployerID);

    expect(RESULT).toBeTruthy();
    expect(RESULT?.Blacklist).toStrictEqual([]);
    expect(RESULT?.Whitelist).toStrictEqual([]);
  });

  test("Update Employer", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(MOCKED_EMP);
    jest.spyOn(empRepo, "save").mockResolvedValue(MOCKED_EMP);
    const RESULT: boolean = await employerService.updateEmployer(
      1,
      "mock",
      "mock",
      "mock",
      ["mock"],
      true,
      false,
      true,
      null,
      false,
      true,
    );
    expect(RESULT).toBe(true);
  });

  test("Update Employer, Error", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(MOCKED_EMP);
    jest.spyOn(empRepo, "save").mockRejectedValue(new Error());
    await expect(
      employerService.updateEmployer(1, "mock", "mock", "mock", ["mock"], true, false, true, null, false, true),
    ).rejects.toThrow();
  });

  test("Update Employer, Not Found", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(null);
    const RESULT: boolean = await employerService.updateEmployer(
      1,
      "mock",
      "mock",
      "mock",
      ["mock"],
      true,
      false,
      true,
      null,
      false,
      true,
    );
    expect(RESULT).toBe(false);
  });

  test("Delete Employer", async function () {
    let mockedDeleteResult: DeleteResult = {
      raw: "mock",
      affected: 1,
    };
    jest.spyOn(empRepo, "delete").mockResolvedValue(mockedDeleteResult);
    const RESULT: boolean = await employerService.deleteEmployer(1);
    expect(RESULT).toBe(true);
  });

  test("Update Blacklist", async function () {
    const UPDATED_EMP: Employer = { ...MOCKED_EMP, Blacklist: ["http://example.com"] };
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(MOCKED_EMP);
    jest.spyOn(empRepo, "save").mockResolvedValue(UPDATED_EMP);
    await expect(employerService.updateBlacklist(1, ["http://example.com"])).resolves.not.toThrow();
    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).toHaveBeenCalledWith({
      ...MOCKED_EMP,
      Blacklist: ["http://example.com"],
    });
  });

  test("Update Blacklist, No New URLs", async function () {
    const CURRENT_BLACKLIST: string[] = ["http://example.com"];
    const EMP_WITH_BLACKLIST: Employer = { ...MOCKED_EMP, Blacklist: CURRENT_BLACKLIST };
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(EMP_WITH_BLACKLIST);
    await employerService.updateBlacklist(1, ["http://example.com"]);
    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).not.toHaveBeenCalled();
  });

  test("Update Blacklist, Employer Not Found", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(null);
    await expect(employerService.updateBlacklist(1, ["http://example.com"])).rejects.toThrow(
      "Employer with ID 1 not found",
    );
    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).not.toHaveBeenCalled();
  });

  test("Update Blacklist, Error", async function () {
    jest.spyOn(empRepo, "save").mockImplementation(function () {
      throw new Error();
    });
    await expect(employerService.updateBlacklist(1, ["http://example.com"])).rejects.toBeDefined();
  });

  test("Update Whitelist", async function () {
    const UPDATED_EMP: Employer = { ...MOCKED_EMP, Whitelist: ["http://example.com"] };
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(MOCKED_EMP);
    jest.spyOn(empRepo, "save").mockResolvedValue(UPDATED_EMP);
    await expect(employerService.updateWhitelist(1, ["http://example.com"])).resolves.not.toThrow();
    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).toHaveBeenCalledWith({
      ...MOCKED_EMP,
      Whitelist: ["http://example.com"],
    });
  });

  test("Update Whitelist, No New URLs", async function () {
    const CURRENT_WHITELIST: string[] = ["http://example.com"];
    const EMP_WITH_WHITELIST: Employer = { ...MOCKED_EMP, Whitelist: CURRENT_WHITELIST };
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(EMP_WITH_WHITELIST);
    await employerService.updateWhitelist(1, ["http://example.com"]);
    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).not.toHaveBeenCalled();
  });

  test("Update Whitelist, Employer Not Found", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(null);
    await expect(employerService.updateWhitelist(1, ["http://example.com"])).rejects.toThrow(
      "Employer with ID 1 not found",
    );
    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).not.toHaveBeenCalled();
  });

  test("Update Whitelist, Error", async function () {
    jest.spyOn(empRepo, "save").mockImplementation(function () {
      throw new Error();
    });
    await expect(employerService.updateWhitelist(1, ["http://example.com"])).rejects.toBeDefined();
  });

  test("Delete from Whitelist", async function () {
    const INITIAL_WHITELIST: string[] = ["http://example.com", "http://test.com"];
    const UPDATED_EMP: Employer = { ...MOCKED_EMP, Whitelist: ["http://test.com"] };
    jest
      .spyOn(empRepo, "findOneBy")
      .mockResolvedValue({ ...MOCKED_EMP, Whitelist: INITIAL_WHITELIST });
    jest.spyOn(empRepo, "save").mockResolvedValue(UPDATED_EMP);

    await expect(
      employerService.deleteFromWhitelist(1, "http://example.com"),
    ).resolves.not.toThrow();

    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).toHaveBeenCalledWith({
      ...MOCKED_EMP,
      Whitelist: ["http://test.com"],
    });
  });

  test("Delete from Whitelist, URL Not Found", async function () {
    const CURRENT_WHITELIST: string[] = ["http://example.com"];
    const EMP_WITH_WHITELIST: Employer = { ...MOCKED_EMP, Whitelist: CURRENT_WHITELIST };
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(EMP_WITH_WHITELIST);

    await employerService.deleteFromWhitelist(1, "http://nonexistent.com");

    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).not.toHaveBeenCalled();
  });

  test("Delete from Whitelist, Employer Not Found", async function () {
    jest.spyOn(empRepo, "findOneBy").mockResolvedValue(null);

    await expect(employerService.deleteFromWhitelist(1, "http://example.com")).rejects.toThrow(
      "Employer with ID 1 not found",
    );

    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).not.toHaveBeenCalled();
  });

  test("Delete from Whitelist, Error", async function () {
    const INITIAL_WHITELIST: string[] = ["http://example.com"];
    jest
      .spyOn(empRepo, "findOneBy")
      .mockResolvedValue({ ...MOCKED_EMP, Whitelist: INITIAL_WHITELIST });
    jest.spyOn(empRepo, "save").mockImplementation(function () {
      throw new Error();
    });

    await expect(
      employerService.deleteFromWhitelist(1, "http://example.com"),
    ).rejects.toBeDefined();

    expect(empRepo.findOneBy).toHaveBeenCalledWith({ EmployerID: 1 });
    expect(empRepo.save).toHaveBeenCalled();
  });

  test("Delete Employer, Not Found", async function () {
    let mockedDeleteResult: DeleteResult = {
      raw: "mock",
      affected: 0,
    };
    jest.spyOn(empRepo, "delete").mockResolvedValue(mockedDeleteResult);
    const RESULT: boolean = await employerService.deleteEmployer(1);
    expect(RESULT).toBe(false);
  });

  test("Delete Employer, Error", async function () {
    jest.spyOn(empRepo, "delete").mockRejectedValue(new Error());
    await expect(employerService.deleteEmployer(1)).rejects.toThrow();
  });
});
