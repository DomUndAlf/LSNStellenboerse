import * as React from "react";
import { IJobListItemsProps } from "../Interfaces/props";
import {
  ChevronRightIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  GlobeAltIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/20/solid";
import { ReactElement } from "react";
import { t } from "i18next";

function JobListItems({ job, onClick }: IJobListItemsProps): ReactElement {
  const APPLICATION_DEADLINE: string = job.ApplicationDeadline
    ? new Date(job.ApplicationDeadline).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "Keine Frist";

  let language: string;
  if (job.Language === "en") {
    language = t("searchBar.en");
  } else language = t("searchBar.de");

  return (
    <li
      onClick={onClick}
      className="group p-6 hover:bg-hellgelb/5 cursor-pointer border-b border-gray-100 transition-all duration-200 list-none"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-scale-lg font-bold text-dunkelblau group-hover:text-orange transition-colors">
              {job.Title}
            </h3>
            <p className="mt-1 text-scale-md text-textbody">{job.Employer.FullName}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-scale-md text-textbody">
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-gray-400" title={t("jobListItems.location")} />
              <span>{job.Location.City}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BriefcaseIcon className="h-4 w-4 text-gray-400" title={t("jobListItems.employer")} />
              <span>{job.Employer.ShortName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-gray-400" title={t("jobListItems.dead")} />
              <span>
                {t("jobListItems.deadline")} {APPLICATION_DEADLINE}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GlobeAltIcon className="h-4 w-4 text-gray-400" title={t("jobListItems.language")} />
              <span>{language}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AcademicCapIcon className="h-4 w-4 text-gray-400" title={t("title.specialty")} />
              <span>
                {(job.Specialty || [])
                  .map(function (specialty: string) {
                    return t(`specialtys.${specialty}`);
                  })
                  .join(", ")}
              </span>
            </div>

            {/* `searchBar.${filterData.userSpecialty}` */}
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-gray-400" title={t("jobListItems.creation")} />
              <span>
                {t("jobListItems.created")}
                {new Date(job.created_at).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <ChevronRightIcon
          className="h-6 w-6 text-gray-400 group-hover:text-orange transition-colors"
          aria-hidden="true"
        />
      </div>
    </li>
  );
}

export default JobListItems;
