import * as React from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import { IFilterData } from "../../Interfaces/types";
import { IFilterDataProps } from "../../Interfaces/props";

export default function ShowEmployerNames({
  filterData,
  setFilterData,
}: IFilterDataProps): React.ReactElement {
  return (
    <>
      {filterData.userEmployernames.length > 0 &&
        filterData.userEmployernames.map(function (name: string) {
          return (
            <span
              key={name}
              className="group inline-flex items-center gap-2 px-3 py-1.5 
                       bg-white hover:bg-hellblau/5 
                       border border-hellblau/30 hover:border-hellblau
                       text-textbody rounded-lg
                       transition-all duration-200 shadow-sm"
            >
              <span className="font-medium opacity-80 text-textbody">{t("searchBar.employer")}</span>
              <span>{name}</span>
              <button
                className="opacity-60 hover:opacity-100 hover:text-orange 
                         transition-all duration-200 rounded-full
                         hover:bg-orange/10 p-1 -mr-1"
                onClick={function () {
                  setFilterData(function (prev: IFilterData) {
                    return {
                      ...prev,
                      userEmployernames: removeNameFromList(name, prev.userEmployernames),
                      userPage: 0,
                    };
                  });
                }}
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          );
        })}
    </>
  );
}

function removeNameFromList(name: string, list: string[]): string[] {
  return list.filter(function (element: string) {
    return element !== name;
  });
}
