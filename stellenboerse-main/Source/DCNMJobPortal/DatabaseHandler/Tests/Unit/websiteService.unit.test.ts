import { Website } from "../../../DatabaseHandler/Models/Entities/Website";
import { expect, test, describe, jest } from "@jest/globals";
import { Repository } from "typeorm";
import * as websiteService from "../../Services/websiteService";
import { DATA_SOURCE } from "../../../DatabaseHandler/Config/data-source";

export const MOCKED_WEBSITE: Website = {
  WebsiteID: 1,
  JobURL: "mockurl.com",
  ETag: "mocktag",
  Hash: "mockhash",
  LastModified: "mock",
  Jobs: [],
};

let websiteRepo: Repository<Website> = DATA_SOURCE.getRepository(Website);
jest.spyOn(websiteRepo, "create").mockReturnValue(MOCKED_WEBSITE);

describe("Website Services", function () {
  test("Create Website", async function () {
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: number = await websiteService.createWebsite("mock", "mock", "mock", "mock");
    expect(RESULT).toBe(MOCKED_WEBSITE.WebsiteID);
  });

  test("Create Website, with Error", async function () {
    jest.spyOn(websiteRepo, "save").mockRejectedValue(new Error());
    await expect(websiteService.createWebsite("mock", "mock", "mock", "mock")).rejects.toThrow();
  });

  test("Read All Website", async function () {
    jest.spyOn(websiteRepo, "find").mockResolvedValue([MOCKED_WEBSITE]);
    const RESULT: Website[] = await websiteService.readAllWebsite();
    expect(RESULT).toStrictEqual([MOCKED_WEBSITE]);
  });

  test("Read All Website with Error", async function () {
    jest.spyOn(websiteRepo, "find").mockRejectedValue(new Error());
    await expect(websiteService.readAllWebsite()).rejects.toThrow();
  });

  test("Read Website by JobURL", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: Website | null = await websiteService.readWebsiteByJobUrl("mock");
    expect(RESULT).toBe(MOCKED_WEBSITE);
  });

  test("Read Website by JobURL with Error", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockRejectedValue(new Error());
    await expect(websiteService.readWebsiteByJobUrl("mock")).rejects.toThrow();
  });

  test("Update Website", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: boolean = await websiteService.updateWebsite(1, "mock", "mock", "mock", "mock");
    expect(RESULT).toBe(true);
  });

  test("Update Website, Not Found", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(null);
    const NOT_FOUND_RESULT: boolean = await websiteService.updateWebsite(
      1,
      "mock",
      "mock",
      "mock",
      "mock",
    );
    expect(NOT_FOUND_RESULT).toBe(false);
  });

  test("Update Website with Fail", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockRejectedValue(new Error());
    await expect(websiteService.updateWebsite(1, "mock", "mock", "mock", "mock")).rejects.toThrow();
  });

  test("Upsert Website, Update", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: number = await websiteService.upsertWebsiteByJobUrl(
      "mock",
      "mock",
      "mock",
      "mock",
    );
    expect(RESULT).toBe(MOCKED_WEBSITE.WebsiteID);
  });

  test("Upsert Website, Create", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(null);
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: number = await websiteService.upsertWebsiteByJobUrl(
      "mock",
      "mock",
      "mock",
      "mock",
    );
    expect(RESULT).toBe(MOCKED_WEBSITE.WebsiteID);
  });

  test("Upsert Website, Fail", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockRejectedValue(new Error());
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    await expect(
      websiteService.upsertWebsiteByJobUrl("mock", "mock", "mock", "mock"),
    ).rejects.toThrowError();
  });

  test("Upsert Website, Update with incomplete Argument", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(MOCKED_WEBSITE);
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: number = await websiteService.upsertWebsiteByJobUrl("", "", "", "");
    expect(RESULT).toBe(MOCKED_WEBSITE.WebsiteID);
  });

  test("Upsert Website, Create with incomplete Argument", async function () {
    jest.spyOn(websiteRepo, "findOneBy").mockResolvedValue(null);
    jest.spyOn(websiteRepo, "save").mockResolvedValue(MOCKED_WEBSITE);
    const RESULT: number = await websiteService.upsertWebsiteByJobUrl("", "", "", "");
    expect(RESULT).toBe(MOCKED_WEBSITE.WebsiteID);
  });
});
