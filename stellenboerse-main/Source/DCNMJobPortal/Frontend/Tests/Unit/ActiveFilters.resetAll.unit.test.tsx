import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActiveFilters from "../../src/components/ActiveFilters";

// Mock i18next
jest.mock("i18next", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "searchBar.actFilter": "Aktive Filter",
      "filterEmployer.resetAll": "Alle zurücksetzen",
    };
    return translations[key] || key;
  },
}));

// Mock child components
jest.mock("../../src/components/ActiveFilterElements/ShowLanguage", () => {
  return function ShowLanguageMock() {
    return <div data-testid="show-language">Language Filter</div>;
  };
});

jest.mock("../../src/components/ActiveFilterElements/ShowSpecialty", () => {
  return function ShowSpecialtyMock() {
    return <div data-testid="show-specialty">Specialty Filter</div>;
  };
});

jest.mock("../../src/components/ActiveFilterElements/ShowEmployerNames", () => {
  return function ShowEmployerNamesMock() {
    return <div data-testid="show-employers">Employer Filter</div>;
  };
});

jest.mock("../../src/components/ActiveFilterElements/ShowSearchterm", () => {
  return function ShowSearchtermMock() {
    return <div data-testid="show-searchterm">Searchterm Filter</div>;
  };
});

describe("ActiveFilters Component - Reset All Button", () => {
  const mockSetFilterData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display 'Alle zurücksetzen' button when filters are active", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft"],
      userLanguage: "de",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    // Verify the reset button is displayed
    expect(screen.getByText("Alle zurücksetzen")).toBeInTheDocument();
    expect(screen.getByLabelText("Alle zurücksetzen")).toBeInTheDocument();
  });

  it("should not display active filters section when no filters are active", () => {
    const mockFilterData = {
      userEmployernames: [],
      userLanguage: "",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    // Verify the active filters section is not rendered
    expect(screen.queryByText("Aktive Filter")).not.toBeInTheDocument();
    expect(screen.queryByText("Alle zurücksetzen")).not.toBeInTheDocument();
  });

  it("should reset all filters when 'Alle zurücksetzen' is clicked", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft", "Google"],
      userLanguage: "en",
      userSpecialty: "IT",
      userSearchterms: ["developer", "engineer"],
      userPage: 3,
      userSortMode: "date",
      userSortOrder: "asc",
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    // Click the reset button
    const resetButton = screen.getByText("Alle zurücksetzen");
    fireEvent.click(resetButton);

    // Verify setFilterData was called
    expect(mockSetFilterData).toHaveBeenCalledWith(expect.any(Function));

    // Call the function that was passed to setFilterData
    const updateFunction = mockSetFilterData.mock.calls[0][0];
    const newFilterData = updateFunction(mockFilterData);

    // Verify ALL filters are reset
    expect(newFilterData.userEmployernames).toEqual([]);
    expect(newFilterData.userLanguage).toBe("");
    expect(newFilterData.userSpecialty).toBe("");
    expect(newFilterData.userSearchterms).toEqual([]);
    expect(newFilterData.userPage).toBe(0);

    // Verify other properties are preserved
    expect(newFilterData.userSortMode).toBe("date");
    expect(newFilterData.userSortOrder).toBe("asc");
  });

  it("should call setFilterData when reset button is clicked", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft", "Google"],
      userLanguage: "en",
      userSpecialty: "IT",
      userSearchterms: ["developer"],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    // Click the reset button
    const resetButton = screen.getByText("Alle zurücksetzen");
    fireEvent.click(resetButton);

    // Verify setFilterData was called
    expect(mockSetFilterData).toHaveBeenCalledTimes(1);
  });

  it("should work correctly with a single active filter", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft"],
      userLanguage: "",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    // Click the reset button
    const resetButton = screen.getByText("Alle zurücksetzen");
    fireEvent.click(resetButton);

    // Verify setFilterData was called
    expect(mockSetFilterData).toHaveBeenCalledTimes(1);
  });

  it("should have correct styling for reset button", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft"],
      userLanguage: "",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    const resetButton = screen.getByText("Alle zurücksetzen");

    // Check classes for red button styling
    expect(resetButton).toHaveClass("bg-red-500");
    expect(resetButton).toHaveClass("hover:bg-red-600");
    expect(resetButton).toHaveClass("text-white");
  });

  it("should display active filters section with employer filter", () => {
    const mockFilterData = {
      userEmployernames: [],
      userLanguage: "de",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    expect(screen.getByText("Aktive Filter")).toBeInTheDocument();
    expect(screen.getByTestId("show-language")).toBeInTheDocument();
  });

  it("should display active filters section with specialty filter", () => {
    const mockFilterData = {
      userEmployernames: [],
      userLanguage: "",
      userSpecialty: "Marketing",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    expect(screen.getByText("Aktive Filter")).toBeInTheDocument();
    expect(screen.getByTestId("show-specialty")).toBeInTheDocument();
  });

  it("should display active filters section with searchterm filter", () => {
    const mockFilterData = {
      userEmployernames: [],
      userLanguage: "",
      userSpecialty: "",
      userSearchterms: ["developer"],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    expect(screen.getByText("Aktive Filter")).toBeInTheDocument();
    expect(screen.getByTestId("show-searchterm")).toBeInTheDocument();
  });

  it("should display active filters section with multiple filters active", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft", "Google"],
      userLanguage: "en",
      userSpecialty: "IT",
      userSearchterms: ["developer", "manager"],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    expect(screen.getByText("Aktive Filter")).toBeInTheDocument();
    expect(screen.getByTestId("show-employers")).toBeInTheDocument();
    expect(screen.getByTestId("show-language")).toBeInTheDocument();
    expect(screen.getByTestId("show-specialty")).toBeInTheDocument();
    expect(screen.getByTestId("show-searchterm")).toBeInTheDocument();
  });

  it("should have correct styling and icon for reset button", () => {
    const mockFilterData = {
      userEmployernames: ["Microsoft"],
      userLanguage: "",
      userSpecialty: "",
      userSearchterms: [],
      userPage: 0,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    const resetButton = screen.getByText("Alle zurücksetzen");

    // Check classes for red button styling
    expect(resetButton).toHaveClass("bg-red-500");
    expect(resetButton).toHaveClass("hover:bg-red-600");
    expect(resetButton).toHaveClass("text-white");
  });

  it("should reset filters when clicked multiple times", () => {
    const mockFilterData = {
      userEmployernames: ["Amazon"],
      userLanguage: "de",
      userSpecialty: "IT",
      userSearchterms: ["test"],
      userPage: 1,
    };

    render(<ActiveFilters filterData={mockFilterData as any} setFilterData={mockSetFilterData} />);

    const resetButton = screen.getByText("Alle zurücksetzen");

    // First click
    fireEvent.click(resetButton);
    expect(mockSetFilterData).toHaveBeenCalledTimes(1);

    // Second click
    fireEvent.click(resetButton);
    expect(mockSetFilterData).toHaveBeenCalledTimes(2);

    // Verify both calls reset all filters
    for (let i = 0; i < 2; i++) {
      const updateFunction = mockSetFilterData.mock.calls[i][0];
      const newFilterData = updateFunction(mockFilterData);

      expect(newFilterData.userEmployernames).toEqual([]);
      expect(newFilterData.userLanguage).toBe("");
      expect(newFilterData.userSpecialty).toBe("");
      expect(newFilterData.userSearchterms).toEqual([]);
      expect(newFilterData.userPage).toBe(0);
    }
  });
});
