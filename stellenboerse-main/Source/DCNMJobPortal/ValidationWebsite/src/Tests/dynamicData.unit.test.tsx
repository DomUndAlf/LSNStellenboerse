import axios, { AxiosResponse } from "axios";
import { getJob, saveNewData } from "../ClientLogic/dynamicData";
import { IJob } from "../../../Shared/interfaces";

jest.mock("axios");

let mockedJob: IJob = {
  JobID: 1,
  Title: "Test Job",
  Description: "Test Description",
  Language: "mockedLanguage",
  ApplicationDeadline: new Date("2025-01-31"),
  Tasks: ["mocked Tasks"],
} as IJob;

let mockedAxiosResponse: AxiosResponse = {
  data: mockedJob,
} as AxiosResponse;

test("Get Job", async function () {
  jest.spyOn(axios, "get").mockResolvedValue(mockedAxiosResponse);
  let result: IJob = await getJob("mockedValKey");
  expect(result).toBe(mockedJob);
});

test("Save New Data", async function () {
  jest.spyOn(axios, "post").mockResolvedValue(mockedAxiosResponse);
  let spyAxios: jest.SpiedFunction<typeof axios.put> = jest.spyOn(axios, "put");
  await saveNewData(1, "mockTitle", "mockDescription", ["mockTasks"], null, "en", [
    "mockSpecialty",
  ]);
  expect(spyAxios).toHaveBeenCalled();
});
