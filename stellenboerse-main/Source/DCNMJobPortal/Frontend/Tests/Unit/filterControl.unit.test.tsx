import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React, { act } from "react";
import { IFilterData } from "../../src/Interfaces/types";
import FilterControl from "../../src/components/FilterControl";
import { getEmployers } from "../../src/apiReceive/receiveEmployer";
import FilterButton from "../../src/components/FilterElements/FilterButton";

jest.mock("../../src/apiReceive/receiveEmployer");

jest.mock("i18next", function () {
  return {
    t: function (key: string) {
      return key;
    },
  };
});

jest.mock("react-i18next", function () {
  return {
    useTranslation: jest.fn(function () {
      return {
        t: function (key: string) {
          return key;
        },
        ready: true,
      };
    }),
  };
});

(getEmployers as jest.Mock).mockResolvedValue([
  {FullName: "firstName", ShortName: "FN"},
  {FullName: "secondName", ShortName: "SN"}
]);

let filterData: IFilterData = {
  userEmployernames: ["firstName"],
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

test("Filter Control Employer Test", async function () {
  render(<FilterControl filterData={filterData} setFilterData={setFilterData} />);

  let nameInput: HTMLInputElement = screen.getByPlaceholderText("searchBar.search");
  fireEvent.change(nameInput, { target: { value: "first" } });

  let searchingEmployer: HTMLElement;
  await waitFor(function () {
    searchingEmployer = screen.getByLabelText(/firstname checkbox/i);
  });

  fireEvent.click(searchingEmployer);
  expect(setFilterData).toHaveBeenCalled();
});

test("Filter Control Employer Test", async function () {
  render(<FilterControl filterData={filterData} setFilterData={setFilterData} />);

  let searchingEmployer: HTMLElement;
  await waitFor(function () {
    searchingEmployer = screen.getByLabelText(/secondname checkbox/i);
  });

  fireEvent.click(searchingEmployer);
  expect(setFilterData).toHaveBeenCalled();
});

test("Filter Control, Clear Button Test", async function () {
  render(<FilterControl filterData={filterData} setFilterData={setFilterData} />);

  let clearButton: HTMLButtonElement = screen.getByLabelText(/clear employer selection button/i);

  await act(async function () {
    fireEvent.click(clearButton);
  });
  expect(setFilterData).toHaveBeenCalled();
});

test("Filter Control, Language Test", async function () {
  render(<FilterControl filterData={filterData} setFilterData={setFilterData} />);

  let languageSelect: HTMLSelectElement = screen.getByText("searchBar.de").closest("select");
  await act(async function () {
    fireEvent.change(languageSelect, { target: { value: "de" } });
  });
  expect(setFilterData).toHaveBeenCalled();
});

test("Filter Control, Specialty Test", async function () {
  render(<FilterControl filterData={filterData} setFilterData={setFilterData} />);

  let specialtySelect: HTMLSelectElement = screen
    .getByText("searchBar.engineering")
    .closest("select");
  await act(async function () {
    fireEvent.change(specialtySelect, { target: { value: "construction" } });
  });
  expect(setFilterData).toHaveBeenCalled();
});

test("Filter Button", async function () {
  let mockFunction: jest.Mock = jest.fn();
  render(<FilterButton setIsFilterOpen={mockFunction} isOpen={true} />);

  let filterButton: HTMLButtonElement = screen.getByRole("button");

  fireEvent.click(filterButton);
  expect(mockFunction).toHaveBeenCalled();
});
