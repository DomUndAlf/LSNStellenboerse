import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import TitleSearch from "../../src/components/TitleSearch";
import { IFilterData } from "../../src/Interfaces/types";

jest.mock("i18next", function () {
  return {
    t: function (key: string): string {
      return key;
    },
  };
});

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

test("Search Input Test", function () {
  // Arrange
  render(<TitleSearch filterData={mockFilterData} setFilterData={mockSetFilter} />);

  // Act
  const INPUT: HTMLInputElement = screen.getByRole("textbox");

  fireEvent.change(INPUT, { target: { value: "mock input" } });
  fireEvent.keyDown(INPUT, { key: "Enter", code: "Enter", charCode: 13 });
  // Assert

  expect(INPUT).toBeInTheDocument();
  expect(mockSetFilter).toHaveBeenCalled();
});
