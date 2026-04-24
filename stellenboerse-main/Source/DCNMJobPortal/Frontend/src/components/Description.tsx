import * as React from "react";
import { IDialogProps } from "../Interfaces/props";
import { t } from "i18next";
import ExternalJobLink from "./ExternalJobLink";

function Description({ job }: IDialogProps) {
  return (
    <div className="max-w-screen-xl mx-auto bg-white">
      <div className="p-4 md:p-8">
        <h2 className="text-scale-lg font-bold text-dunkelblau mb-4">
          <ExternalJobLink
            href={job.Website.JobURL}
            className="text-dunkelblau hover:text-orange transition-colors hover:underline"
          >
            {job.Title}
          </ExternalJobLink>
        </h2>
        <p className="text-textbody">{job.Description}</p>
      </div>
      {job.Tasks.length > 0 ? (
        <div className="p-4 md:p-8 border-t border-gray-200">
          <h2 className="text-scale-lg font-bold text-dunkelblau mb-4">{t("description.tasks")}</h2>
          <ul className="text-textbody">
            {job.Tasks.map(function (task: string, index: number) {
              return (
                <li key={index} className="mb-2">
                  <span className="inline-block mr-2 rounded-full bg-hellblau text-weiss px-2 py-1 text-xs font-semibold">
                    {index + 1}
                  </span>
                  {task}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Description;
