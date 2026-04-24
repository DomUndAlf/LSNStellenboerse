import { expect, test } from "@jest/globals";
import * as clientLogic from "../../Services/clientLogic";
import { Job } from "../../Models/Entities/Job";

let mockedJob1: Job = {
  Title: "Dev Ops",
  ApplicationDeadline: new Date("12-12-2024"),
  created_at: new Date("12-12-2024"),
} as Job;

let mockedJob2: Job = {
  Title: "backend developer (junior)",
  ApplicationDeadline: null,
  created_at: new Date("11-11-2023"),
  // eslint-disable-next-line @typescript-eslint/ban-types
} as unknown as Job;

let mockedJob3: Job = {
  Title: "Graphic Designer",
  ApplicationDeadline: null,
  created_at: new Date("11-11-2021"),
  // eslint-disable-next-line @typescript-eslint/ban-types
} as unknown as Job;

let mockedJob4: Job = {
  Title: "Artificial Intelligence Engineer",
  ApplicationDeadline: new Date("12-12-2023"),
  created_at: new Date("11-11-2022"),
} as Job;

let mockedJobs: Job[] = [mockedJob1, mockedJob2, mockedJob3, mockedJob4];

let expectedAscendingOrder: Job[] = [mockedJob4, mockedJob2, mockedJob1, mockedJob3];
let expectedDescendingOrder: Job[] = [mockedJob3, mockedJob1, mockedJob2, mockedJob4];

test("Sort by Title", async function () {
  // ACT
  let sortedJobsDescending: Job[] = clientLogic.sort(mockedJobs, "Title", "DESC");
  let sortedJobsAscending: Job[] = clientLogic.sort(mockedJobs, "Title", "ASC");

  expect(sortedJobsAscending).toEqual(expectedAscendingOrder);
  expect(sortedJobsDescending).toEqual(expectedDescendingOrder);
});

test("Sort by Deadline", async function () {
  // ACT
  let sortedJobsAscending: Job[] = clientLogic.sort(mockedJobs, "ApplicationDeadline", "ASC");
  let sortedJobsDescending: Job[] = clientLogic.sort(mockedJobs, "ApplicationDeadline", "DESC");

  expect(sortedJobsAscending).toEqual([mockedJob4, mockedJob1, mockedJob2, mockedJob3]);
  expect(sortedJobsDescending).toEqual([mockedJob1, mockedJob4, mockedJob2, mockedJob3]);
});

test("Sort by Created Date", async function () {
  // ACT
  let sortedJobsAscending: Job[] = clientLogic.sort(mockedJobs, "created_at", "ASC");
  let sortedJobsDescending: Job[] = clientLogic.sort(mockedJobs, "created_at", "DESC");

  expect(sortedJobsAscending).toEqual([mockedJob3, mockedJob4, mockedJob2, mockedJob1]);
  expect(sortedJobsDescending).toEqual([mockedJob1, mockedJob2, mockedJob4, mockedJob3]);
});

test("Sort, Invalid Mode", async function () {
  // ACT
  let sortedJobs: Job[] = clientLogic.sort(mockedJobs, "invalid", "ASC");

  expect(sortedJobs).toEqual([]);
});

test("Paginate Jobs", async function () {
  // ACT
  let jobs: Job[] = [];

  for (let i: number = 0; i < 30; i++) {
    jobs.push(mockedJob1);
  }

  let result: Job[] = clientLogic.paginate(jobs, 0);
  expect(result.length).toBe(20);
});
