import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ActiveFilters from "../../src/components/ActiveFilters";
import { IFilterData } from "../../src/Interfaces/types";

let filterData: IFilterData = {
  userEmployernames: ["first"],
  userLanguage: "de",
  userSpecialty: "it",
  userSearchterms: [],
  userSortMode: "created_at",
  userSortOrder: "DESC",
  userPage: 0,
};

let setFilterData: jest.Mock = jest.fn().mockImplementation(function (
  callback: (prev: IFilterData) => void,
) {
  callback(filterData);
});

afterEach(function () {
  setFilterData.mockClear();
});

test("Renders active Filters, all Active", function () {
  render(<ActiveFilters filterData={filterData} setFilterData={setFilterData} />);
  let allFilterButtons: HTMLButtonElement[] = screen.getAllByRole("button");
  for (let button of allFilterButtons) {
    fireEvent.click(button);
  }
  expect(allFilterButtons.length).toBe(4);
  expect(setFilterData).toHaveBeenCalledTimes(4);
});

test("Renders active Filters, only Employer Names", function () {
  filterData.userEmployernames = ["first"];
  filterData.userLanguage = "";
  filterData.userSpecialty = "";
  render(<ActiveFilters filterData={filterData} setFilterData={setFilterData} />);
  let allFilterButtons: HTMLButtonElement[] = screen.getAllByRole("button");
  for (let button of allFilterButtons) {
    fireEvent.click(button);
  }
  expect(allFilterButtons.length).toBe(2);
  expect(setFilterData).toHaveBeenCalledTimes(2);
});

test("Renders active Filters, only Language Names", function () {
  filterData.userEmployernames = [];
  filterData.userLanguage = "de";
  filterData.userSpecialty = "";
  render(<ActiveFilters filterData={filterData} setFilterData={setFilterData} />);
  let allFilterButtons: HTMLButtonElement[] = screen.getAllByRole("button");
  for (let button of allFilterButtons) {
    fireEvent.click(button);
  }
  expect(allFilterButtons.length).toBe(2);
  expect(setFilterData).toHaveBeenCalledTimes(2);
});

test("Renders active Filters, only Specialty", function () {
  filterData.userEmployernames = [];
  filterData.userLanguage = "";
  filterData.userSpecialty = "it";
  render(<ActiveFilters filterData={filterData} setFilterData={setFilterData} />);
  let allFilterButtons: HTMLButtonElement[] = screen.getAllByRole("button");
  for (let button of allFilterButtons) {
    fireEvent.click(button);
  }
  expect(allFilterButtons.length).toBe(2);
  expect(setFilterData).toHaveBeenCalledTimes(2);
});

test("Renders active Filters, Empty FilterData", function () {
  filterData.userLanguage = "";
  filterData.userSpecialty = "";
  filterData.userEmployernames = [];
  render(<ActiveFilters filterData={filterData} setFilterData={setFilterData} />);
  expect(screen.queryByText(/actFilter/i)).toBeNull();
});
