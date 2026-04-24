import * as React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import { IDialogProps } from "../Interfaces/props";
import ExternalJobLink from "./ExternalJobLink";

function Disclaimer({ job }: IDialogProps): React.ReactElement {
  return (
    <div className="w-full pt-4 pr-4 pl-4 sm:pt-6 sm:pr-6 sm:pl-6 lg:pt-8 lg:pr-8 lg:pl-8">
      <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-orange flex-shrink-0 mt-0.5"
            data-testid="exclamation-triangle-icon"
          />
          <div className="space-y-3">
            <p className="text-textbody">
              <span className="font-bold text-dunkelblau">{t("disclaimer.title")}: </span>
              <span>{t("disclaimer.aiContent")} </span>
              <ExternalJobLink
                href={job.Website.JobURL}
                className="font-bold text-dunkelblau hover:text-orange transition-colors hover:underline"
              >
                {t("disclaimer.originalAd")}
              </ExternalJobLink>
              <span>. </span>
              <span>{t("disclaimer.liability")}</span>
            </p>
            <p className="text-sm text-textbody">{t("disclaimer.externalLinkNotice")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;
