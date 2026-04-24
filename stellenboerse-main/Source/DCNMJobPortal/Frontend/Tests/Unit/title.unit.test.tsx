import { render, screen } from "@testing-library/react";
import React from "react";
import Title from "../../src/components/Title";
import { IJob, IWebsite, ILocation, IEmployer } from "../../src/Interfaces/types";

let mockedWebsite: IWebsite = {
  JobURL: "mockedUrl",
} as IWebsite;

let mockedLocation: ILocation = {
  City: "mockedCity",
} as ILocation;

let mockedEmployer: IEmployer = {
  EmployerID: 1,
  ShortName: "mockedShortName",
  FullName: "mockedFullName",
  Emails: ["mockedEmail@mail.com"],
  Website: "mockedWebsite.com",
} as IEmployer;

let mockedJob: IJob = {
  Title: "mockedTitle",
  Description: "mockedDescription",
  ApplicationDeadline: new Date("11-11-2024"),
  Website: mockedWebsite,
  Location: mockedLocation,
  Specialty: ["mockedSpecialty"],
  Employer: mockedEmployer,
} as IJob;

let mockedJobEnglish: IJob = {
  Title: "mockedTitle",
  Description: "mockedDescription",
  Website: mockedWebsite,
  Location: mockedLocation,
  Language: "en",
  Specialty: ["mockedSpecialty"],
  Employer: mockedEmployer,
} as IJob;

test("Renders Title, City, and Deadline of German Job", async function () {
  render(<Title job={mockedJob} />);
  let linkElement: HTMLAnchorElement = screen.getByRole("link", { name: mockedJob.Title });
  let city: HTMLParagraphElement = screen.getByText(mockedJob.Location.City);
  let deadline: HTMLParagraphElement = screen.getByText(/11.11.2024/);
  expect(linkElement).toBeInTheDocument();
  expect(city).toBeInTheDocument();
  expect(deadline).toBeInTheDocument();
});

test("Renders Title, City, and Deadline of English Job", async function () {
  render(<Title job={mockedJobEnglish} />);
  let language: HTMLParagraphElement = screen.getByText(/English/);
  expect(language).toBeInTheDocument();
});
