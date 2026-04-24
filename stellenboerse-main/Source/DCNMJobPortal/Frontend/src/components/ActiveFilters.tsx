import * as React from "react";
import ShowLanguage from "./ActiveFilterElements/ShowLanguage";
import ShowSpecialty from "./ActiveFilterElements/ShowSpecialty";
import ShowEmployerNames from "./ActiveFilterElements/ShowEmployerNames";
import { IFilterData } from "../Interfaces/types";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import { IFilterDataProps } from "../Interfaces/props";
import ShowSearchterm from "./ActiveFilterElements/ShowSearchterm";

export default function ActiveFilters({
  filterData,
  setFilterData,
}: IFilterDataProps): React.ReactElement {
  function handleResetAll() {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userEmployernames: [],
        userLanguage: "",
        userSpecialty: "",
        userSearchterms: [],
        userPage: 0,
      };
    });
  }

  return (
    <>
      {hasActiveFilter(filterData) && (
        <div className="w-full p-3 bg-hellblau/5 mt-4 rounded-xl border border-hellblau/20">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-dunkelblau/60" />
              <span className="text-scale-md text-dunkelblau/80 font-medium">
                {t("searchBar.actFilter")}
              </span>
            </div>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow"
              aria-label={t("filterEmployer.resetAll")}
              title={t("filterEmployer.resetAll")}
            >
              <XMarkIcon className="h-4 w-4" />
              {t("filterEmployer.resetAll")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <ShowLanguage filterData={filterData} setFilterData={setFilterData} />
            <ShowSpecialty filterData={filterData} setFilterData={setFilterData} />
            <ShowEmployerNames filterData={filterData} setFilterData={setFilterData} />
            <ShowSearchterm filterData={filterData} setFilterData={setFilterData} />
          </div>
        </div>
      )}
    </>
  );
}

function hasActiveFilter(filterData: IFilterData): boolean {
  if (filterData.userEmployernames.length > 0) {
    return true;
  }

  if (filterData.userLanguage) {
    return true;
  }

  if (filterData.userSpecialty) {
    return true;
  }

  if (filterData.userSearchterms.length > 0) {
    return true;
  }

  return false;
}
