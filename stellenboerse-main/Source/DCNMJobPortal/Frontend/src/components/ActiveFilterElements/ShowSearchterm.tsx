import * as React from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import { IFilterData } from "../../Interfaces/types";
import { IFilterDataProps } from "../../Interfaces/props";

export default function ShowSearchterm({
  filterData,
  setFilterData,
}: IFilterDataProps): React.ReactElement {
  function removeSearchterm(termToRemove: string) {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userSearchterms: prev.userSearchterms.filter((term) => term !== termToRemove),
        userPage: 0,
      };
    });
  }

  return (
    <>
      {filterData.userSearchterms.map((searchterm: string, index: number) => (
        <span
          key={index}
          className="group inline-flex items-center gap-2 px-3 py-1.5 
                     bg-white hover:bg-hellblau/5 
                     border border-hellblau/30 hover:border-hellblau
                     text-textbody rounded-lg
                     transition-all duration-200 shadow-sm"
        >
          <span className="font-medium opacity-80 text-textbody">{t("searchBar.search")}</span>
          <span>{searchterm}</span>
          <button
            className="opacity-60 hover:opacity-100 hover:text-orange 
                       transition-all duration-200 rounded-full
                       hover:bg-orange/10 p-1 -mr-1"
            onClick={() => removeSearchterm(searchterm)}
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </>
  );
}
