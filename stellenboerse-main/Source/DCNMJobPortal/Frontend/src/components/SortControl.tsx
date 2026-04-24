import * as React from "react";
import { t } from "i18next";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { IFilterData } from "../Interfaces/types";

interface ISortControlProps {
  filterData: IFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<IFilterData>>;
}

export default function SortControl({
  filterData,
  setFilterData,
}: ISortControlProps): React.ReactElement {
  function handleToggle() {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userSortOrder: prev.userSortOrder == "DESC" ? "ASC" : "DESC",
      };
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userSortMode: e.target.value,
      };
    });
  }

  return (
    <div className="flex flex-col flex-wrap pb-4">
      <div className="flex justify-between">
        <label className="block mb-2 font-medium text-dunkelblau">{t("searchBar.sort")}</label>
        <button
          onClick={handleToggle}
          className="w-6 h-6 bg-gray-400 text-white rounded hover:bg-dunkelblau focus:outline-none flex items-center justify-center"
        >
          {filterData.userSortOrder === "ASC" ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="flex gap-2">
        <select
          className="w-full p-2 border rounded-lg focus:outline-none focus:border-dunkelblau"
          onChange={handleChange}
          value={filterData.userSortMode}
        >
          <option value="ApplicationDeadline">{t("searchBar.deadline")}</option>
          <option value="Title">A-Z</option>
          <option value="created_at">{t("searchBar.createdDate")}</option>
        </select>
      </div>
    </div>
  );
}
