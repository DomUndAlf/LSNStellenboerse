import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../Components/header";

describe("Header Component Tests", function () {
  test("should display the correct title", function () {
    render(<Header />);

    expect(screen.getByText("Validierung der Stellenanzeige")).toBeInTheDocument();
  });

  test("should have the correct styling classes", function () {
    render(<Header />);

    const HEADER: HTMLElement = screen.getByRole("banner");
    expect(HEADER).toHaveClass("bg-dunkelblau");
    expect(HEADER).toHaveClass("text-white");
    expect(HEADER).toHaveClass("py-4");

    const TITLE: HTMLElement = screen.getByRole("heading", { level: 1 });
    expect(TITLE).toHaveClass("text-3xl");
    expect(TITLE).toHaveClass("font-bold");
    expect(TITLE).toHaveClass("text-center");
  });
});
