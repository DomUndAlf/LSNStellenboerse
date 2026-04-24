import React from "react";
import { screen, render, waitFor } from "@testing-library/react";
import { IEmployer, IFilterResponse, IJob, ILocation } from "../../src/Interfaces/types";
import * as fetchJobsModule from "../../src/apiReceive/receiveJob";
import JobListFrame from "../../src/components/JobListFrame";

function mockReactRouterDom() {
  return {
    useNavigate: function () {
      return jest.fn();
    },
    useLocation: function () {
      return { pathname: "" };
    },
  };
}

jest.mock("react-router-dom", mockReactRouterDom);
jest.mock("../../src/components/FilterElements/FilterButton");
jest.mock("../../src/components/FilterControl");
jest.mock("../../src/components/SortControl");
jest.mock("../../src/components/ActiveFilters");
jest.mock("../../src/components/TitleSearch");

let mockedEmployer: IEmployer = {
  FullName: "mocked FullName",
  ShortName: "mocked ShortName",
} as IEmployer;

let mockedLocation: ILocation = {
  City: "mocked City",
} as ILocation;

let mockedJob: IJob = {
  JobID: 1,
  Title: "mockedTitle",
  Description: "mockedDescription",
  Language: "de",
  Employer: mockedEmployer,
  Location: mockedLocation,
} as IJob;

let mockedJobEnglish: IJob = {
  JobID: 2,
  Title: "mockedTitleEnglish",
  Description: "mockedDescriptionEnglish",
  Language: "en",
  Employer: mockedEmployer,
  Location: mockedLocation,
} as IJob;

let mockedJobs: IJob[] = [mockedJob, mockedJobEnglish];

let mockedResponse: IFilterResponse = {
  jobs: mockedJobs,
  count: mockedJobs.length,
};

test("Renders the JobListFrame", async function () {
  jest.spyOn(fetchJobsModule, "fetchJobs").mockResolvedValue(mockedResponse);
  render(<JobListFrame />);

  await waitFor(function () {
    screen.getByText(mockedJob.Title);
  });

  let jobList: HTMLElement = screen.getByText(mockedJob.Title);
  expect(jobList).toBeInTheDocument();
});
