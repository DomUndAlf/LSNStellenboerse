import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LanguageInput from "../Components/language";

describe("LanguageInput Component Tests", function () {
  const MOCK_ON_CHANGE: jest.Mock = jest.fn();

  beforeEach(function () {
    MOCK_ON_CHANGE.mockClear();
  });

  test("should render with German selected when value is 'de'", function () {
    render(<LanguageInput value="de" isEditable={true} onChange={MOCK_ON_CHANGE} />);

    const SELECT: HTMLElement = screen.getByRole("combobox");
    expect(SELECT).toHaveValue("de");
  });

  test("should render with English selected when value is 'en'", function () {
    render(<LanguageInput value="en" isEditable={true} onChange={MOCK_ON_CHANGE} />);

    const SELECT: HTMLElement = screen.getByRole("combobox");
    expect(SELECT).toHaveValue("en");
  });

  test("should call onChange with 'de' when German is selected", function () {
    render(<LanguageInput value="en" isEditable={true} onChange={MOCK_ON_CHANGE} />);

    const SELECT: HTMLElement = screen.getByRole("combobox");
    fireEvent.change(SELECT, { target: { value: "de" } });

    expect(MOCK_ON_CHANGE).toHaveBeenCalledWith("de");
  });

  test("should call onChange with 'en' when English is selected", function () {
    render(<LanguageInput value="de" isEditable={true} onChange={MOCK_ON_CHANGE} />);

    const SELECT: HTMLElement = screen.getByRole("combobox");
    fireEvent.change(SELECT, { target: { value: "en" } });

    expect(MOCK_ON_CHANGE).toHaveBeenCalledWith("en");
  });

  test("should be disabled when isEditable is false", function () {
    render(<LanguageInput value="de" isEditable={false} onChange={MOCK_ON_CHANGE} />);

    const SELECT: HTMLElement = screen.getByRole("combobox");
    expect(SELECT).toBeDisabled();
  });

  test("should be enabled when isEditable is true", function () {
    render(<LanguageInput value="de" isEditable={true} onChange={MOCK_ON_CHANGE} />);

    const SELECT: HTMLElement = screen.getByRole("combobox");
    expect(SELECT).not.toBeDisabled();
  });

  test("should have both language options available", function () {
    render(<LanguageInput value="de" isEditable={true} onChange={MOCK_ON_CHANGE} />);

    expect(screen.getByRole("option", { name: "Deutsch" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Englisch" })).toBeInTheDocument();
  });
});
