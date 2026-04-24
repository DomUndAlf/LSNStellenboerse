import * as React from "react";
import { IDialogProps } from "../Interfaces/props";
import type { ReactElement } from "react";
import {
  MapPinIcon,
  BuildingOfficeIcon,
  LinkIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/20/solid";
import { t } from "i18next";
import ExternalJobLink from "./ExternalJobLink";

function Contact({ job }: IDialogProps): ReactElement {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6">
          <h2 className="text-scale-lg font-bold text-dunkelblau">{t("contact.info")}</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <BuildingOfficeIcon
                className="h-5 w-5 text-dunkelblau flex-shrink-0 mt-0.5"
                title={t("contact.employer")}
              />
              <div>
                <p className="font-medium text-textbody">{job.Employer.ShortName}</p>
              </div>
            </div>

            {job.Employer.showContact && job.Employer.ContactPerson && (
              <div className="flex items-start gap-4">
                <UserIcon
                  className="h-5 w-5 text-dunkelblau flex-shrink-0 mt-0.5"
                  title={t("contact.contactPerson")}
                />
                <div>
                  <p className="font-medium text-textbody">{job.Employer.ContactPerson}</p>
                </div>
              </div>
            )}

            {job.Employer.showContact &&
              job.Employer.Emails &&
              job.Employer.Emails.length > 0 && (
                <div className="flex items-start gap-4">
                  <EnvelopeIcon
                    className="h-5 w-5 text-dunkelblau flex-shrink-0 mt-0.5"
                    title={t("contact.email")}
                  />
                  <div className="space-y-1">
                    {job.Employer.Emails.map(function (email: string) {
                      return (
                        <a
                          key={email}
                          href={"mailto:" + email}
                          className="block font-medium text-dunkelblau hover:text-orange transition-colors hover:underline"
                        >
                          {email}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            <div className="flex items-center gap-4">
              <LinkIcon
                className="h-5 w-5 text-dunkelblau flex-shrink-0"
                title={t("contact.link")}
              />
              <ExternalJobLink
                href={job.Website.JobURL}
                className="font-medium text-dunkelblau hover:text-orange transition-colors hover:underline"
              >
                {t("contact.goToAd")}
              </ExternalJobLink>
            </div>

            <div className="flex items-start gap-4">
              <MapPinIcon
                className="h-5 w-5 text-dunkelblau flex-shrink-0 mt-0.5"
                title={t("contact.location")}
              />
              <div className="text-textbody">
                {job.Location.Street || job.Location.PostalCode ? (
                  <>
                    {(job.Location.Street || job.Location.HouseNumber) && (
                      <p>
                        {job.Location.Street} {job.Location.HouseNumber}
                      </p>
                    )}
                    <p>
                      {job.Location.PostalCode} {job.Location.City}
                    </p>
                  </>
                ) : (
                  <>
                    <p>{job.Location.City}</p>
                    <p className="text-sm text-gray-500 italic">
                      {t("contact.addressTBA")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
