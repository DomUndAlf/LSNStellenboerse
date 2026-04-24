import React from "react";
import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import JobList, { IJobList } from "../../src/components/DatabaseTool/JobList";
import * as receiveJobModule from "../../src/apiReceive/receiveJob";

// Mock the API functions
jest.mock("../../src/apiReceive/receiveJob", () => ({
  fetchJosForUser: jest.fn(),
  deleteJobById: jest.fn(),
  deleteJobsByIds: jest.fn(),
}));

// Mock window.open
global.open = jest.fn();

// Mock window.confirm and window.alert
global.confirm = jest.fn(() => true);
global.alert = jest.fn();

describe("JobList Component - Select All with Filtering", () => {
  const mockJobs: IJobList[] = [
    {
      JobID: 1,
      Title: "Software Developer at Microsoft",
      ValidationKey: "key1",
      EmployerID: 1,
      EmployerShortname: "Microsoft",
    },
    {
      JobID: 2,
      Title: "Product Manager at Google",
      ValidationKey: "key2",
      EmployerID: 2,
      EmployerShortname: "Google",
    },
    {
      JobID: 3,
      Title: "Data Scientist at Microsoft",
      ValidationKey: "key3",
      EmployerID: 1,
      EmployerShortname: "Microsoft",
    },
    {
      JobID: 4,
      Title: "Frontend Developer at Amazon",
      ValidationKey: "key4",
      EmployerID: 3,
      EmployerShortname: "Amazon",
    },
    {
      JobID: 5,
      Title: "Backend Developer at Microsoft",
      ValidationKey: "key5",
      EmployerID: 1,
      EmployerShortname: "Microsoft",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (receiveJobModule.fetchJosForUser as jest.Mock).mockResolvedValue(
      mockJobs.map((job) => ({
        ...job,
        Employer: { ShortName: job.EmployerShortname },
      }))
    );
    (receiveJobModule.deleteJobsByIds as jest.Mock).mockResolvedValue(
      mockJobs.map((job) => ({ id: job.JobID, success: true }))
    );
  });

  it("should select only filtered jobs when 'Select All' is checked with active filter", async () => {
    render(<JobList />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("Software Developer at Microsoft")).toBeInTheDocument();
    });

    // Filter by "Microsoft"
    const searchInput = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(searchInput, { target: { value: "Microsoft" } });

    // Wait for filter to apply
    await waitFor(() => {
      expect(screen.getByText("Software Developer at Microsoft")).toBeInTheDocument();
      expect(screen.getByText("Data Scientist at Microsoft")).toBeInTheDocument();
      expect(screen.getByText("Backend Developer at Microsoft")).toBeInTheDocument();
      // These should not be visible
      expect(screen.queryByText("Product Manager at Google")).not.toBeInTheDocument();
      expect(screen.queryByText("Frontend Developer at Amazon")).not.toBeInTheDocument();
    });

    // Click "Select All"
    const selectAllCheckbox = screen.getByLabelText("Alles auswählen");
    fireEvent.click(selectAllCheckbox);

    // Verify that the "Delete Selected" button is enabled
    const deleteButton = screen.getByText("Lösche ausgewählte");
    expect(deleteButton).not.toBeDisabled();

    // Click delete
    fireEvent.click(deleteButton);

    // Verify confirm was called
    expect(global.confirm).toHaveBeenCalledWith(
      "Sind Sie sicher, dass Sie 3 Job(s) löschen möchten?"
    );

    // Verify deleteJobsByIds was called with only the 3 Microsoft jobs (IDs: 1, 3, 5)
    await waitFor(() => {
      expect(receiveJobModule.deleteJobsByIds).toHaveBeenCalledWith([1, 3, 5]);
    });

    // Verify it was NOT called with all 5 jobs
    expect(receiveJobModule.deleteJobsByIds).not.toHaveBeenCalledWith([1, 2, 3, 4, 5]);
  });

  it("should select all jobs when 'Select All' is checked without filter", async () => {
    render(<JobList />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("Software Developer at Microsoft")).toBeInTheDocument();
    });

    // Click "Select All" without any filter
    const selectAllCheckbox = screen.getByLabelText("Alles auswählen");
    fireEvent.click(selectAllCheckbox);

    // Click delete
    const deleteButton = screen.getByText("Lösche ausgewählte");
    fireEvent.click(deleteButton);

    // Verify deleteJobsByIds was called with all 5 jobs
    await waitFor(() => {
      expect(receiveJobModule.deleteJobsByIds).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    });
  });

  it("should update selection when filter changes after selecting all", async () => {
    render(<JobList />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("Software Developer at Microsoft")).toBeInTheDocument();
    });

    // Select all without filter
    const selectAllCheckbox = screen.getByLabelText("Alles auswählen");
    fireEvent.click(selectAllCheckbox);

    // Now apply a filter
    const searchInput = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(searchInput, { target: { value: "Google" } });

    // Wait for filter to apply
    await waitFor(() => {
      expect(screen.getByText("Product Manager at Google")).toBeInTheDocument();
      expect(screen.queryByText("Software Developer at Microsoft")).not.toBeInTheDocument();
    });

    // Note: The checkbox should still show checked, but when clicking "Select All" again
    // it should now select only the filtered job
    fireEvent.click(selectAllCheckbox); // Uncheck
    fireEvent.click(selectAllCheckbox); // Check again

    // Click delete
    const deleteButton = screen.getByText("Lösche ausgewählte");
    fireEvent.click(deleteButton);

    // Verify deleteJobsByIds was called with only the Google job (ID: 2)
    await waitFor(() => {
      expect(receiveJobModule.deleteJobsByIds).toHaveBeenCalledWith([2]);
    });
  });

  it("should filter by JobID", async () => {
    render(<JobList />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("Software Developer at Microsoft")).toBeInTheDocument();
    });

    // Filter by JobID "3"
    const searchInput = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(searchInput, { target: { value: "3" } });

    // Wait for filter to apply
    await waitFor(() => {
      expect(screen.getByText("Data Scientist at Microsoft")).toBeInTheDocument();
      expect(screen.queryByText("Software Developer at Microsoft")).not.toBeInTheDocument();
    });

    // Select all
    const selectAllCheckbox = screen.getByLabelText("Alles auswählen");
    fireEvent.click(selectAllCheckbox);

    // Click delete
    const deleteButton = screen.getByText("Lösche ausgewählte");
    fireEvent.click(deleteButton);

    // Verify deleteJobsByIds was called with only JobID 3
    await waitFor(() => {
      expect(receiveJobModule.deleteJobsByIds).toHaveBeenCalledWith([3]);
    });
  });
});
