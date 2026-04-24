import * as React from "react";
import { t } from "i18next";
import { IFilterChangeProps } from "../../Interfaces/props";
import { IFilterData } from "../../Interfaces/types";

export default function FilterSpecialty({ filterData, setFilterData }: IFilterChangeProps): React.ReactElement {
  function handleFilterSpecialty(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userSpecialty: e.target.value,
        userPage: 0,
      };
    });
  }

  return (
    <div>
      <label className="block mb-2 font-medium text-dunkelblau">{t("searchBar.specialty")}</label>
      <select
        value={filterData.userSpecialty}
        onChange={handleFilterSpecialty}
        className="w-full p-2 border rounded-lg focus:outline-none focus:border-dunkelblau"
      >
        <option value="">{t("searchBar.pick")}</option>
        <option value="socialScience">{t("searchBar.socialScience")}</option>
        <option value="engineering">{t("searchBar.engineering")}</option>
        <option value="culture">{t("searchBar.culture")}</option>
        <option value="health">{t("searchBar.health")}</option>
        <option value="mint">{t("searchBar.mint")}</option>
        <option value="law">{t("searchBar.law")}</option>
        <option value="economics">{t("searchBar.economics")}</option>
        <option value="nonAcademic">{t("searchBar.nonAcademic")}</option>
      </select>
    </div>
  );
}
