import * as apiReceive from "../../src/apiReceive/receiveJob";
import { IFilterData, IJob, IFilterResponse } from "../../src/Interfaces/types";
import axios, { AxiosResponse } from "axios";

jest.mock("axios");

let mockedJob: IJob = {
  JobID: 1,
  Title: "mockedTitle",
  Description: "mockedDescription",
} as IJob;

let mockedJobs: IJob[] = [mockedJob, mockedJob, mockedJob];

let mockedFilterResponse: IFilterResponse = {
  jobs: mockedJobs,
  count: mockedJobs.length,
};

let mockedResponse: AxiosResponse = {
  data: mockedFilterResponse,
} as AxiosResponse;

let mockFilterData: IFilterData = {
  userEmployernames: ["name"],
  userSpecialty: "",
  userLanguage: "",
  userSearchterms: [],
  userSortMode: "created_at",
  userSortOrder: "DESC",
  userPage: 0,
};

test("Fetch Jobs", async function () {
  jest.spyOn(axios, "post").mockResolvedValue(mockedResponse);
  let result: IFilterResponse = await apiReceive.fetchJobs(mockFilterData);
  expect(result.jobs).toBe(mockedJobs);
});
