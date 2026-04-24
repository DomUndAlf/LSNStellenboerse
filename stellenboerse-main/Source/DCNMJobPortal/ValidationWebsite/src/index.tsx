import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import "./index.css";
import App from "./app";

const ROOT_ELEMENT: HTMLElement | null = document.getElementById("root");
if (ROOT_ELEMENT) {
  const ROOT: Root = createRoot(ROOT_ELEMENT);
  ROOT.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
