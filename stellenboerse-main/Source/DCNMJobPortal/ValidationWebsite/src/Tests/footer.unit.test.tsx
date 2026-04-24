import * as React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../Components/footer";
import "@testing-library/jest-dom";

test("Footer", function () {
  render(<Footer />);
  expect(screen.getByText(/um änderungen an den informationen/i)).toBeInTheDocument();
});
