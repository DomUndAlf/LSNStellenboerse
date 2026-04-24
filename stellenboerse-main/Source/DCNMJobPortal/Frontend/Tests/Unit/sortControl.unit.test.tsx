import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import SortControl from "../../src/components/SortControl";
import { IFilterData } from "../../src/Interfaces/types";

let mockFilterData: IFilterData = {
  userSearchterms: [],
  userSpecialty: "",
  userLanguage: "",
  userEmployernames: [],
  userSortMode: "created_at",
  userSortOrder: "DESC",
  userPage: 0,
};

let mockSetFilter: jest.Mock = jest.fn();

afterEach(function () {
  mockSetFilter.mockClear();
});

test("Sort by Created Date", function () {
  render(<SortControl filterData={mockFilterData} setFilterData={mockSetFilter} />);
  let select: HTMLSelectElement = screen.getByRole("combobox");
  fireEvent.change(select, { target: { value: "created_at" } });
  expect(mockSetFilter).toHaveBeenCalled();
});

test("Sort by Deadline", function () {
  render(<SortControl filterData={mockFilterData} setFilterData={mockSetFilter} />);
  let select: HTMLSelectElement = screen.getByRole("combobox");
  fireEvent.change(select, { target: { value: "ApplicationDeadline" } });
  expect(mockSetFilter).toHaveBeenCalled();
});

test("Sort by Created Date", function () {
  render(<SortControl filterData={mockFilterData} setFilterData={mockSetFilter} />);
  let select: HTMLSelectElement = screen.getByRole("combobox");
  fireEvent.change(select, { target: { value: "created_at" } });
  expect(mockSetFilter).toHaveBeenCalled();
});

test("Sort by Title", function () {
  render(<SortControl filterData={mockFilterData} setFilterData={mockSetFilter} />);
  let select: HTMLSelectElement = screen.getByRole("combobox");
  fireEvent.change(select, { target: { value: "A-Z" } });
  expect(mockSetFilter).toHaveBeenCalled();
});

test("Toggle Order Button", async function () {
  render(<SortControl filterData={mockFilterData} setFilterData={mockSetFilter} />);
  let select: HTMLSelectElement = screen.getByRole("combobox");
  let button: HTMLButtonElement = screen.getByRole("button");
  fireEvent.change(select, { target: { value: "A-Z" } });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(mockSetFilter).toHaveBeenCalledTimes(3);
});
