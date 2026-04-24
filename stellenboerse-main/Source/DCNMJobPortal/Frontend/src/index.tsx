import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n";

const ROOT: ReactDOM.Root = ReactDOM.createRoot(document.getElementById("root"));

// Determine the base path for i18n resources
// Dynamically detects the React app's location for flexible deployment
const getI18nBasePath = (): string => {
  // Find the script tag that loaded this React app
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    // Look for our main.js file in the static/js folder
    if (src && src.includes('/static/js/main.')) {
      // Extract base path: everything before /static/js/
      const basePath = src.substring(0, src.indexOf('/static/js/'));
      return `${basePath}/Locales/{{lng}}/{{ns}}.json`;
    }
  }
  // Fallback: try to find any script with static/js pattern
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (src && src.includes('/static/js/')) {
      const basePath = src.substring(0, src.indexOf('/static/js/'));
      return `${basePath}/Locales/{{lng}}/{{ns}}.json`;
    }
  }
  // Final fallback: relative path (for local development)
  return "Locales/{{lng}}/{{ns}}.json";
};

i18n
  .init({
    lng: "de",
    ns: ["translation"],
    defaultNS: "translation",
    fallbackLng: "de",
    supportedLngs: ["en", "de"],
    backend: {
      loadPath: getI18nBasePath(),
    },
    returnNull: false,
  })
  .then(function () {
    ROOT.render(
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </React.StrictMode>,
    );
  });
