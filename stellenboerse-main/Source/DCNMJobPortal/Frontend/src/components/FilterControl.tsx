import * as React from "react";
import FilterEmployer from "./FilterElements/FilterEmployer";
import FilterLanguage from "./FilterElements/FilterLanguage";
import FilterSpecialty from "./FilterElements/FilterSpecialty";
import { IFilterDataProps } from "../Interfaces/props";

export default function FilterControl({
  filterData,
  setFilterData,
}: IFilterDataProps): React.ReactElement {
  return (
    <>
      <div className="flex flex-col flex-wrap space-x-4 gap-4 mb-4">
        <FilterEmployer filterData={filterData} setFilterData={setFilterData} />
        <FilterLanguage filterData={filterData} setFilterData={setFilterData} />
        <FilterSpecialty filterData={filterData} setFilterData={setFilterData} />
      </div>
    </>
  );
}
