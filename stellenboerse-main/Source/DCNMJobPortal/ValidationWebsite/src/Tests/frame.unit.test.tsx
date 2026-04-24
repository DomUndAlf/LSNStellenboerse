import * as React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Frame from "../Components/frame";
import { getEmployer, getJob, saveNewData } from "../ClientLogic/dynamicData";
import { IEmployer, IJob, IWebsite } from "../../../Shared/interfaces";

jest.mock("axios");
jest.mock("../ClientLogic/dynamicData");

let mockedWebsite: IWebsite = {
  JobURL: "test",
} as IWebsite;

let mockedJob: IJob = {
  JobID: 1,
  Title: "Test Job",
  Description: "Test Description",
  Language: "mockedLanguage",
  ApplicationDeadline: new Date("2025-01-31"),
  Tasks: ["mocked Tasks"],
  Specialty: ["mocked Specialty"],
  Website: mockedWebsite,
} as IJob;

let mockedEmployer: IEmployer = {
  toValidate: true,
  EmployerID: 1,
  ShortName: "Test Company",
  FullName: "Test Full Company Name",
  Website: "https://example.com",
  Emails: ["contact@example.com"],
  created_at: new Date("2025-01-31"),
  Jobs: [],
  LocationID: 1,
  isEmbedded: false,
  isActive: false,
  ContactPerson: "",
  showContact: false,
  sendValidationEmails: true,
};

describe("Frame Component Tests", function () {
  beforeEach(function () {
    const MOCK_URL_SEARCH_PARAMS: { get: jest.Mock } = {
      get: jest.fn().mockReturnValue("test-key"),
    };
    Object.defineProperty(window, "URLSearchParams", {
      value: jest.fn(function () {
        return MOCK_URL_SEARCH_PARAMS;
      }),
    });

    (getJob as jest.Mock).mockResolvedValue(mockedJob);
    (getEmployer as jest.Mock).mockResolvedValue(mockedEmployer);
    (saveNewData as jest.Mock).mockResolvedValue(undefined);
  });

  test('should show an alert when "Bestätigen" is clicked while text fields are still editable', async function () {
    window.alert = jest.fn();

    render(<Frame />);

    await waitFor(function () {
      expect(screen.getByDisplayValue("Test Job")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Bearbeiten"));
    fireEvent.click(screen.getByText("Bestätigen"));

    expect(window.alert).toHaveBeenCalledWith(
      "Bitte überprüfen Sie Ihre Änderungen und speichern Sie den bearbeiteten Text zuerst, bevor Sie auf 'Bestätigen' klicken.",
    );
  });

  test("should set IS_VALID to false if VALKEY is not provided", async function () {
    const MOCK_URL_SEARCH_PARAMS: { get: jest.Mock } = {
      get: jest.fn().mockReturnValue(null),
    };
    Object.defineProperty(window, "URLSearchParams", {
      value: jest.fn(function () {
        return MOCK_URL_SEARCH_PARAMS;
      }),
    });

    render(<Frame />);

    expect(
      screen.getByText("Unter dieser URL existiert keine Stellenanzeige oder sie wurde entfernt."),
    ).toBeInTheDocument();
  });

  test("should show an alert for invalid deadline format", async function () {
    window.alert = jest.fn();

    render(<Frame />);

    await waitFor(function () {
      expect(screen.getByDisplayValue("Test Job")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Keine Bewerbungsfrist vorhanden"), {
      target: { value: "invalid-date" },
    });

    fireEvent.click(screen.getByText("Bestätigen"));

    expect(window.alert).toHaveBeenCalledWith(
      "Bitte geben Sie ein gültiges Datum im Format TT.MM.JJJJ oder YYYY-MM-DD ein.",
    );
  });

  test("should display success message after saving and confirming", async function () {
    render(<Frame />);

    await waitFor(function () {
      expect(screen.getByDisplayValue("Test Job")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Bearbeiten"));
    fireEvent.click(screen.getByText("Speichern"));
    fireEvent.click(screen.getByText("Bestätigen"));

    await waitFor(function () {
      expect(screen.getByText("Die Daten wurden gespeichert.")).toBeInTheDocument();
      expect(screen.getByText("Vielen Dank für Ihre Kooperation!")).toBeInTheDocument();
    });
  });

  test("should not allow saving if title or description are empty", async function () {
    window.alert = jest.fn();

    render(<Frame />);

    await waitFor(function () {
      expect(screen.getByDisplayValue("Test Job")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Bearbeiten"));

    const TITLE_INPUT: HTMLElement = screen.getByPlaceholderText("Job Title");
    const DESCRIPTION_INPUT: HTMLElement = screen.getByPlaceholderText("Job Beschreibung");

    fireEvent.change(TITLE_INPUT, { target: { value: "" } });
    fireEvent.change(DESCRIPTION_INPUT, { target: { value: "" } });

    fireEvent.click(screen.getByText("Speichern"));

    expect(window.alert).toHaveBeenCalledWith(
      "Bitte füllen Sie den Titel oder mindestens Beschreibung oder Arbeitsaufgaben aus, bevor Sie speichern.",
    );
  });

  test("should save the correct data using the API", async function () {
    render(<Frame />);

    await waitFor(function () {
      expect(screen.getByDisplayValue("Test Job")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Bearbeiten"));

    const TITLE_INPUT: HTMLElement = screen.getByPlaceholderText("Job Title");
    const DESCRIPTION_INPUT: HTMLElement = screen.getByPlaceholderText("Job Beschreibung");
    const DEADLINE_INPUT: HTMLElement = screen.getByPlaceholderText(
      "Keine Bewerbungsfrist vorhanden",
    );
    const LANGUAGE_INPUT: HTMLElement = screen.getByRole("combobox");
    fireEvent.change(LANGUAGE_INPUT, { target: { value: "de" } });

    fireEvent.change(TITLE_INPUT, { target: { value: "Neuer Job Titel" } });
    fireEvent.change(DESCRIPTION_INPUT, { target: { value: "Neue Job Beschreibung" } });
    fireEvent.change(DEADLINE_INPUT, { target: { value: "10.11.24" } });
    fireEvent.change(LANGUAGE_INPUT, { target: { value: "de" } });

    fireEvent.click(screen.getByText("Speichern"));
    fireEvent.click(screen.getByText("Bestätigen"));

    await waitFor(function () {
      expect(saveNewData).toHaveBeenCalledWith(
        1,
        "Neuer Job Titel",
        "Neue Job Beschreibung",
        ["mocked Tasks"],
        expect.any(Date),
        "de",
        ["mocked Specialty"],
      );
    });
  });

  test("Database Error", async function () {
    (getJob as jest.Mock).mockRejectedValue(new Error());
    window.alert = jest.fn();
    render(<Frame />);
    await waitFor(function () {
      expect(
        screen.getByText(
          "Unter dieser URL existiert keine Stellenanzeige oder sie wurde entfernt.",
        ),
      ).toBeInTheDocument();
    });
  });
});
