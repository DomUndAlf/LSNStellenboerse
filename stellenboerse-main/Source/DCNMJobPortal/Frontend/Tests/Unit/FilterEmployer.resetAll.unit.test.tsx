import React from "react";
import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterEmployer from "../../src/components/FilterElements/FilterEmployer";
import * as receiveEmployerModule from "../../src/apiReceive/receiveEmployer";

// Mock the API function
jest.mock("../../src/apiReceive/receiveEmployer", () => ({
  getEmployers: jest.fn(),
}));

// Mock i18next
jest.mock("i18next", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "searchBar.employer": "Arbeitgeber",
      "searchBar.search": "Suchen...",
      "filterEmployer.resetSelection": "Auswahl zurücksetzen",
    };
    return translations[key] || key;
  },
}));

describe("FilterEmployer Component - Reset All Filters", () => {
  const mockSetFilterData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (receiveEmployerModule.getEmployers as jest.Mock).mockResolvedValue([
      { FullName: "Microsoft", ShortName: "MS" },
      { FullName: "Google", ShortName: "GOOG" },
      { FullName: "Amazon", ShortName: "AMZN" },
    ]);
  });

  it("should display 'Auswahl zurücksetzen' button instead of X icon", async () => {
    const mockFilterData = {
      userEmployernames: [],
      userLanguage: "",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Microsoft")).toBeInTheDocument();
    });

    // Verify the button text is displayed
    expect(screen.getByText("Auswahl zurücksetzen")).toBeInTheDocument();

    // Verify the button has correct aria-label
    const resetButton = screen.getByLabelText("clear employer selection button");
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveAttribute("title", "Auswahl zurücksetzen");
  });

  it("should reset employers, language and specialty when 'Auswahl zurücksetzen' is clicked", async () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft", "Google"],
      userLanguage: "de",
      userSpecialty: "IT",
      userSearchterms: ["developer", "engineer"],
      userPage: 2,
      userSortMode: "date",
      userSortOrder: "desc",
    };

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Microsoft")).toBeInTheDocument();
    });

    // Click the reset button
    const resetButton = screen.getByText("Auswahl zurücksetzen");
    fireEvent.click(resetButton);

    // Verify setFilterData was called
    expect(mockSetFilterData).toHaveBeenCalledWith(expect.any(Function));

    // Call the function that was passed to setFilterData
    const updateFunction = mockSetFilterData.mock.calls[0][0];
    const newFilterData = updateFunction(mockFilterData);

    // Verify employers, language and specialty are reset
    expect(newFilterData.userEmployernames).toEqual([]);
    expect(newFilterData.userLanguage).toBe("");
    expect(newFilterData.userSpecialty).toBe("");
    expect(newFilterData.userPage).toBe(0);

    // Verify searchterms are NOT reset
    expect(newFilterData.userSearchterms).toEqual(["developer", "engineer"]);

    // Verify other properties are preserved
    expect(newFilterData.userSortMode).toBe("date");
    expect(newFilterData.userSortOrder).toBe("desc");
  });

  it("should reset employers, language and specialty even when no employers are selected", async () => {
    const mockFilterData = {
      userEmployernames: [],
      userLanguage: "en",
      userSpecialty: "Marketing",
      userSearchterms: ["manager"],
      userPage: 1,
    };

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Microsoft")).toBeInTheDocument();
    });

    // Click the reset button
    const resetButton = screen.getByText("Auswahl zurücksetzen");
    fireEvent.click(resetButton);

    // Verify setFilterData was called
    expect(mockSetFilterData).toHaveBeenCalledWith(expect.any(Function));

    // Call the function that was passed to setFilterData
    const updateFunction = mockSetFilterData.mock.calls[0][0];
    const newFilterData = updateFunction(mockFilterData);

    // Verify employers, language and specialty are reset
    expect(newFilterData.userEmployernames).toEqual([]);
    expect(newFilterData.userLanguage).toBe("");
    expect(newFilterData.userSpecialty).toBe("");
    expect(newFilterData.userPage).toBe(0);

    // Verify searchterms are NOT reset
    expect(newFilterData.userSearchterms).toEqual(["manager"]);
  });

  it("should reset filters multiple times", async () => {
    const mockFilterData = {
      userEmployernames: ["Amazon"],
      userLanguage: "de",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Microsoft")).toBeInTheDocument();
    });

    const resetButton = screen.getByText("Auswahl zurücksetzen");

    // First reset
    fireEvent.click(resetButton);
    expect(mockSetFilterData).toHaveBeenCalledTimes(1);

    // Second reset
    fireEvent.click(resetButton);
    expect(mockSetFilterData).toHaveBeenCalledTimes(2);

    // Verify both calls reset employers, language and specialty
    for (let i = 0; i < 2; i++) {
      const updateFunction = mockSetFilterData.mock.calls[i][0];
      const newFilterData = updateFunction(mockFilterData);

      expect(newFilterData.userEmployernames).toEqual([]);
      expect(newFilterData.userLanguage).toBe("");
      expect(newFilterData.userSpecialty).toBe("");
      expect(newFilterData.userPage).toBe(0);
    }
  });
});
