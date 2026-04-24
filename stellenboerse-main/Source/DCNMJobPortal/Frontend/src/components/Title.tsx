import * as React from "react";
import {
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
} from "@heroicons/react/20/solid";
import { IDialogProps } from "../Interfaces/props";
import { t } from "i18next";
import ExternalJobLink from "./ExternalJobLink";

function Title({ job }: IDialogProps) {
  let deadlineString: string;
  if (job.ApplicationDeadline) {
    const DEADLINE_DATE: Date = new Date(job.ApplicationDeadline);
    if (!isNaN(DEADLINE_DATE.getTime())) {
      deadlineString = DEADLINE_DATE.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  }

  let language: string;
  if (job.Language === "en") {
    language = "English";
  } else language = "Deutsch";

  return (
    <div className="text-center">
      <p className="text-scale-detail font-bold text-dunkelblau mb-4 w-11/12 mx-auto">
        <ExternalJobLink
          href={job.Website.JobURL}
          className="font-bold text-dunkelblau hover:text-orange transition-colors hover:underline"
        >
          {job.Title}
        </ExternalJobLink>
      </p>
      <div className="flex flex-wrap justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-dunkelblau" title={t("title.location")} />
          <p className="text-dunkelblau">{job.Location.City}</p>
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5 text-dunkelblau" title={t("title.employer")} />
          <p className="text-dunkelblau">{job.Employer.FullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <AcademicCapIcon className="h-5 w-5 text-dunkelblau" title={t("title.specialty")} />
          <span className="text-dunkelblau">
            {(job.Specialty || [])
              .map(function (specialty: string) {
                return t(`specialtys.${specialty}`);
              })
              .join(", ")}
          </span>
          {/* <p className="text-dunkelblau">{(job.Specialty || [""]).join(", ")}</p> */}
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-dunkelblau" title={t("title.deadline")} />
          <p className="text-dunkelblau">{deadlineString || ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="h-5 w-5 text-dunkelblau" title={t("title.language")} />
          <p className="text-dunkelblau">{language}</p>
        </div>
      </div>
      <hr className="border-t-2 border-dunkelblau " />
    </div>
  );
}

export default Title;
