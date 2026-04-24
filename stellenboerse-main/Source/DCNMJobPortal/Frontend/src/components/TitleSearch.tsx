import * as React from "react";
import { ChangeEvent } from "react";
import { t } from "i18next";
import { IFilterData } from "../Interfaces/types";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

interface ITitleSearchProps {
  filterData: IFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<IFilterData>>;
}

function TitleSearch({ filterData, setFilterData }: ITitleSearchProps): React.ReactElement {
  const [SEARCH_TERM, SET_SEARCH_TERM]: [string, React.Dispatch<React.SetStateAction<string>>] =
    React.useState("");

  function handleSearch() {
    const TRIMMED_TERM: string = SEARCH_TERM.trim();
    if (!TRIMMED_TERM || filterData.userSearchterms.includes(TRIMMED_TERM)) {
      return;
    }
    setFilterData(function (prev: IFilterData) {
      return {
        ...prev,
        userSearchterms: [...prev.userSearchterms, TRIMMED_TERM],
        userPage: 0,
      };
    });
    SET_SEARCH_TERM("");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    SET_SEARCH_TERM(event.target.value);
  }

  return (
    <>
      <input
        type="text"
        value={SEARCH_TERM}
        onChange={handleChange}
        placeholder={t("searchBar.buzzword")}
        className="flex-grow min-w-[320px] p-3 pl-4 border-2 border-hellblau rounded-xl"
        onKeyDown={function (e: React.KeyboardEvent<HTMLInputElement>) {
          if (e.key !== "Enter") {
            return;
          }
          handleSearch();
        }}
      />
      <button
        className="px-6 bg-dunkelblau text-white rounded-xl hover:bg-opacity-90 transition-colors duration-200 flex items-center gap-2"
        onClick={handleSearch}
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
        <span className="text-white">{t("searchBar.search")}</span>
      </button>
    </>
  );
}

export default TitleSearch;
