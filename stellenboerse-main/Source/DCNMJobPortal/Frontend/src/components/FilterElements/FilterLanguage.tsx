import * as React from "react";
import { ReactElement } from "react";
import { t } from "i18next";
import { IFilterChangeProps } from "../../Interfaces/props";
import { IFilterData } from "../../Interfaces/types";

export default function FilterLanguage({ filterData, setFilterData }: IFilterChangeProps): ReactElement {
  function handleFilterLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userLanguage: e.target.value,
        userPage: 0,
      };
    });
  }

  return (
    <div>
      <label className="block mb-2 font-medium text-dunkelblau">{t("searchBar.language")}</label>
      <select
        value={filterData.userLanguage}
        onChange={handleFilterLanguage}
        className="w-full p-2 border rounded-lg focus:outline-none focus:border-dunkelblau"
      >
        <option value="">{t("searchBar.pick")}</option>
        <option value="de">{t("searchBar.de")}</option>
        <option value="en">{t("searchBar.en")}</option>
      </select>
    </div>
  );
}
