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
    };
    return translations[key] || key;
  },
}));

describe("FilterEmployer Component - Display All Employers", () => {
  const mockSetFilterData = jest.fn();
  const mockFilterData = {
    userEmployernames: [],
    userPage: 0,
    userSearchterm: "",
    userLang: "",
    userSpecialty: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display all employers including those without jobs", async () => {
    // Mock employers list that includes employers without jobs
    (receiveEmployerModule.getEmployers as jest.Mock).mockResolvedValue([
      {FullName: "Company With Many Jobs", ShortName: "CWMJ"},
      {FullName: "Company Without Jobs", ShortName: "CWOJ"}, // This employer has no jobs
      {FullName: "Another Company With Jobs", ShortName: "ACWJ"},
      {FullName: "Startup Without Jobs", ShortName: "SWOJ"}, // This employer also has no jobs
      {FullName: "Enterprise Company", ShortName: "EC"},
    ]);

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    // Wait for employers to load
    await waitFor(() => {
      expect(screen.getByText("Company With Many Jobs")).toBeInTheDocument();
    });

    // Verify that ALL employers are displayed, including those without jobs
    expect(screen.getByText("Company With Many Jobs")).toBeInTheDocument();
    expect(screen.getByText("Company Without Jobs")).toBeInTheDocument();
    expect(screen.getByText("Another Company With Jobs")).toBeInTheDocument();
    expect(screen.getByText("Startup Without Jobs")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Company")).toBeInTheDocument();
  });

  it("should allow filtering employers without jobs", async () => {
    (receiveEmployerModule.getEmployers as jest.Mock).mockResolvedValue([
      {FullName: "Microsoft", ShortName: "MS"},
      {FullName: "Google", ShortName: "GOOG"},
      {FullName: "Amazon", ShortName: "AMZN"},
      {FullName: "NewStartup", ShortName: "NS"}, // Has no jobs
      {FullName: "Apple", ShortName: "AAPL"},
    ]);

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Microsoft")).toBeInTheDocument();
    });

    // Filter by "NewStartup" (which has no jobs)
    const searchInput = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(searchInput, { target: { value: "NewStartup" } });

    // Should still display the employer without jobs
    await waitFor(() => {
      expect(screen.getByText("NewStartup")).toBeInTheDocument();
      expect(screen.queryByText("Microsoft")).not.toBeInTheDocument();
      expect(screen.queryByText("Google")).not.toBeInTheDocument();
    });
  });

  it("should allow selecting employers without jobs", async () => {
    (receiveEmployerModule.getEmployers as jest.Mock).mockResolvedValue([
      {FullName: "Company With Jobs", ShortName: "CWJ"},
      {FullName: "Company Without Jobs", ShortName: "CWOJ"},
    ]);

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Company Without Jobs")).toBeInTheDocument();
    });

    // Click on the checkbox for the employer without jobs
    const checkbox = screen.getByLabelText("Company Without Jobs checkbox");
    fireEvent.click(checkbox);

    // Verify that setFilterData was called with the employer name
    await waitFor(() => {
      expect(mockSetFilterData).toHaveBeenCalledWith(expect.any(Function));
    });

    // Call the function that was passed to setFilterData
    const updateFunction = mockSetFilterData.mock.calls[0][0];
    const newFilterData = updateFunction(mockFilterData);

    // Verify that the employer without jobs is now in the filter
    expect(newFilterData.userEmployernames).toContain("Company Without Jobs");
  });

  it("should display employers in alphabetical order", async () => {
    (receiveEmployerModule.getEmployers as jest.Mock).mockResolvedValue([
      {FullName: "Zebra Company", ShortName: "ZC"},
      {FullName: "Alpha Company", ShortName: "AC"},
      {FullName: "Beta Company", ShortName: "BC"},
      {FullName: "Gamma Company Without Jobs", ShortName: "GCWJ"},
    ]);

    render(
      <FilterEmployer filterData={mockFilterData as any} setFilterData={mockSetFilterData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Zebra Company")).toBeInTheDocument();
    });

    // Get all employer labels
    const employerElements = screen.getAllByText(/Company/);

    // The order should be as returned by the backend (which should be alphabetically sorted)
    expect(employerElements[0]).toHaveTextContent("Zebra Company");
    expect(employerElements[1]).toHaveTextContent("Alpha Company");
    expect(employerElements[2]).toHaveTextContent("Beta Company");
    expect(employerElements[3]).toHaveTextContent("Gamma Company Without Jobs");
  });
});
