import React from "react";
import { render, screen } from "@testing-library/react";
import Disclaimer from "../../src/components/Disclaimer";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { IJob } from "../../src/Interfaces/types";

const I18N_CONFIG: {
  lng: string;
  resources: {
    de: {
      translation: {
        disclaimer: {
          title: string;
          aiContent: string;
          originalAd: string;
          liability: string;
        };
      };
    };
  };
} = {
  lng: "de",
  resources: {
    de: {
      translation: {
        disclaimer: {
          title: "Hinweis",
          aiContent:
            "KI-aufbereiteter Inhalt. Rechtlich bindend ist nur die",
          originalAd: "Original-Stellenanzeige",
          liability: "Keine Gewähr für die Richtigkeit der Angaben.",
        },
      },
    },
  },
};

i18next.init(I18N_CONFIG);

const MOCK_JOB: IJob = {
  JobID: 1,
  Title: "Test Job",
  Description: "Test",
  Website: { WebsiteID: 1, JobURL: "https://example.com", ETag: "", Hash: "", LastModified: "" },
  Location: { LocationID: 1, Street: null, HouseNumber: null, PostalCode: null, City: "Berlin" },
  Employer: {
    EmployerID: 1, LocationID: 1, ShortName: "Test", FullName: "Test GmbH",
    Website: "https://example.com", Emails: [], created_at: new Date(),
    toValidate: false, isEmbedded: false, isActive: true, ContactPerson: "", showContact: false,
    sendValidationEmails: true,
  },
  Language: "de",
  Tasks: [],
  created_at: new Date(),
  Specialty: [],
};

describe("Disclaimer", function (): void {
  it("zeigt den deutschen Disclaimer an", function (): void {
    render(
      <I18nextProvider i18n={i18next}>
        <Disclaimer job={MOCK_JOB} />
      </I18nextProvider>,
    );

    // Act
    const DISCLAIMER_TITLE: HTMLElement = screen.getByText(
      I18N_CONFIG.resources.de.translation.disclaimer.title,
      { exact: false },
    );
    const DISCLAIMER_AI_CONTENT: HTMLElement = screen.getByText(
      I18N_CONFIG.resources.de.translation.disclaimer.aiContent,
      { exact: false },
    );
    const DISCLAIMER_ORIGINAL_AD: HTMLElement = screen.getByText(
      I18N_CONFIG.resources.de.translation.disclaimer.originalAd,
    );
    const DISCLAIMER_LIABILITY: HTMLElement = screen.getByText(
      I18N_CONFIG.resources.de.translation.disclaimer.liability,
    );
    const WARNING_ICON: Element | null = document.querySelector(
      '[data-testid="exclamation-triangle-icon"]',
    );

    // Assert
    expect(DISCLAIMER_TITLE).toBeInTheDocument();
    expect(DISCLAIMER_AI_CONTENT).toBeInTheDocument();
    expect(DISCLAIMER_ORIGINAL_AD).toBeInTheDocument();
    expect(DISCLAIMER_LIABILITY).toBeInTheDocument();
    expect(WARNING_ICON).toBeInTheDocument();
  });
});
