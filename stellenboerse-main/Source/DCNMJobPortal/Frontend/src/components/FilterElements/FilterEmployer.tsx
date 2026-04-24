import * as React from "react";
import { useState, useEffect } from "react";
import { getEmployers } from "../../apiReceive/receiveEmployer";
import { IFilterDataProps } from "../../Interfaces/props";
import { t } from "i18next";
import { IFilterData } from "../../Interfaces/types";

function FilterEmployer({ filterData, setFilterData }: IFilterDataProps): React.ReactElement {
  const [EMPLOYERS, SET_EMPLOYERS]: [{FullName: string, ShortName: string}[], React.Dispatch<React.SetStateAction<{FullName: string, ShortName: string}[]>>] =
    useState<{FullName: string, ShortName: string}[]>([]);
  const [SEARCH_TERM, SET_SEARCH_TERM]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");

  useEffect(function () {
    let isMounted = true;
    
    async function fetchEmployers() {
      try {
        const EMPLOYERS_DATA: {FullName: string, ShortName: string}[] = await getEmployers();
        if (isMounted) {
          SET_EMPLOYERS(EMPLOYERS_DATA);
        }
      } catch {}
    }
    
    fetchEmployers();
    
    return function() {
      isMounted = false;
    };
  }, []);

  function dropEmployerFromList(list: string[], employer: string) {
    return list.filter(function (element: string) {
      return element !== employer;
    });
  }
  function updateSelectedItems(prevSelectedItems: string[], employerName: string): string[] {
    if (prevSelectedItems.includes(employerName)) {
      return dropEmployerFromList(prevSelectedItems, employerName);
    } else {
      return [...prevSelectedItems, employerName];
    }
  }

  function handleCheckboxChange(employerName: string): void {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userEmployernames: updateSelectedItems(prev.userEmployernames, employerName),
        userPage: 0,
      };
    });
  }

  function handleClear() {
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userEmployernames: [],
        userLanguage: "",
        userSpecialty: "",
        userPage: 0,
      };
    });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    SET_SEARCH_TERM(e.target.value);
  }

  return (
    <div className="px-2 bg-white rounded-xl">
      <div className="flex justify-between items-center py-2">
        <h2 className="font-medium text-dunkelblau pl-2">{t("searchBar.employer")}</h2>
        <button
          className="px-3 py-1 text-scale-sm text-white rounded bg-gray-400 hover:bg-dunkelblau transition-colors"
          onClick={handleClear}
          aria-label="clear employer selection button"
          title={t("filterEmployer.resetSelection")}
        >
          {t("filterEmployer.resetSelection")}
        </button>
      </div>
      <input
        className="ml-2 mb-1 w-full border rounded-lg pl-3 py-2"
        value={SEARCH_TERM}
        placeholder={t("searchBar.search")}
        onChange={handleSearchChange}
      />

      <div className="max-h-48 overflow-y-auto space-y-2 mt-2 px-3">
        {EMPLOYERS.map(function (employer: {FullName: string, ShortName: string}) {
          const searchLower = SEARCH_TERM.toLowerCase();
          const matchesSearch = employer.FullName.toLowerCase().includes(searchLower) || 
                                employer.ShortName.toLowerCase().includes(searchLower);
          return (
            matchesSearch && (
              <div key={employer.FullName} className="flex items-center">
                <input
                  type="checkbox"
                  aria-label={`${employer.FullName} checkbox`}
                  checked={filterData.userEmployernames.includes(employer.FullName)}
                  onChange={function () {
                    handleCheckboxChange(employer.FullName);
                  }}
                  className="w-5 h-5 text-dunkelblau focus:ring-dunkelblau border-gray-300 rounded"
                />
                <span className="ml-2 text-textbody">
                  {employer.FullName}
                  {employer.ShortName && employer.ShortName !== employer.FullName && (
                    <span className="text-xs text-gray-500 ml-1">({employer.ShortName})</span>
                  )}
                </span>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}

export default FilterEmployer;
