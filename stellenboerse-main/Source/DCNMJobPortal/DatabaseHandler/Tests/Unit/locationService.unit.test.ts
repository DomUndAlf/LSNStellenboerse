import { expect, test, describe, jest, afterEach } from "@jest/globals";
import { DeleteResult, Repository } from "typeorm";
import * as locationService from "../../Services/locationService";
import { Location } from "../../../DatabaseHandler/Models/Entities/Location";
import { DATA_SOURCE } from "../../../DatabaseHandler/Config/data-source";

let locationRepo: Repository<Location> = DATA_SOURCE.getRepository(Location);

let spyLocFind: jest.SpiedFunction<typeof locationRepo.findOneBy> = jest.spyOn(
  locationRepo,
  "findOneBy",
);

let MOCKED_LOCATION: Location = {
  LocationID: 1,
  Street: "mock street",
  HouseNumber: "1",
  PostalCode: "00001",
  City: "mocked city",
  created_at: new Date("2024-01-01"),
} as Location;

describe("Location Services", function () {
  afterEach(function () {
    spyLocFind.mockClear();
  });

  test("Create Location", async function () {
    jest.spyOn(locationRepo, "create").mockReturnValue(MOCKED_LOCATION);
    jest.spyOn(locationRepo, "save").mockResolvedValue(MOCKED_LOCATION);
    await locationService.createLocation("mock", "1", "mock", "mock");
    expect(locationRepo.save).toHaveBeenCalled();
  });

  test("Create Location Error", async function () {
    jest.spyOn(locationRepo, "create").mockReturnValue(MOCKED_LOCATION);
    jest.spyOn(locationRepo, "save").mockRejectedValue(new Error());
    await expect(locationService.createLocation("mock", "1", "mock", "mock")).rejects.toThrow();
    expect(locationRepo.save).toHaveBeenCalled();
  });

  test("Read Location", async function () {
    spyLocFind.mockResolvedValue(MOCKED_LOCATION);
    const RESULT: Location | null = await locationService.readLocation(1);
    expect(RESULT?.City).toBe("mocked city");
  });

  test("Read Location with Error", async function () {
    spyLocFind.mockRejectedValue(new Error());
    await expect(locationService.readLocation(1)).rejects.toThrow();
  });

  test("Read All Location", async function () {
    let spyAllLocationFind: jest.SpiedFunction<typeof locationRepo.find> = jest.spyOn(
      locationRepo,
      "find",
    );
    spyAllLocationFind.mockResolvedValue([MOCKED_LOCATION]);
    const RESULT: Location[] = await locationService.readAllLocation();
    spyAllLocationFind.mockRejectedValue(new Error());
    expect(RESULT.length).toBe(1);
    await expect(locationService.readAllLocation).rejects.toThrow();
  });

  test("Read All Location, with Error", async function () {
    let spyAllLocationFind: jest.SpiedFunction<typeof locationRepo.find> = jest.spyOn(
      locationRepo,
      "find",
    );
    spyAllLocationFind.mockRejectedValue(new Error());
    await expect(locationService.readAllLocation).rejects.toThrow();
  });

  test("Update Location", async function () {
    spyLocFind.mockResolvedValue(MOCKED_LOCATION);
    jest.spyOn(locationRepo, "save").mockResolvedValue(MOCKED_LOCATION);
    const RESULT: boolean = await locationService.updateLocation(1, "mock", "1", "mock", "mock");
    expect(RESULT).toBe(true);
  });

  test("Update Location, Not Found", async function () {
    jest.spyOn(locationRepo, "save").mockResolvedValue(MOCKED_LOCATION);
    spyLocFind.mockResolvedValue(null);
    const NOTFOUND: boolean = await locationService.updateLocation(1, "mock", "1", "mock", "mock");
    expect(NOTFOUND).toBe(false);
  });

  test("Update Location with Error", async function () {
    spyLocFind.mockRejectedValue(new Error());
    await expect(locationService.updateLocation(1, "mock", "1", "mock", "mock")).rejects.toThrow();
  });

  test("Delete Location", async function () {
    let mockDelteResult: DeleteResult = {
      raw: "mock",
      affected: 1,
    };
    jest.spyOn(locationRepo, "delete").mockResolvedValue(mockDelteResult);
    const RESULT: boolean = await locationService.deleteLocation(1);
    expect(RESULT).toBe(true);
  });

  test("Delete Location, Not Found", async function () {
    let mockDelteResult: DeleteResult = {
      raw: "mock",
      affected: 0,
    };
    jest.spyOn(locationRepo, "delete").mockResolvedValue(mockDelteResult);
    const RESULT: boolean = await locationService.deleteLocation(1);
    expect(RESULT).toBe(false);
  });

  test("Delete Location, Error", async function () {
    jest.spyOn(locationRepo, "delete").mockRejectedValue(new Error());
    await expect(locationService.deleteLocation(1)).rejects.toThrow();
  });
});
