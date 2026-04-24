import * as React from "react";
import { FunnelIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import { IFilterButtonProps } from "../../Interfaces/props";

export default function FilterButton({
  setIsFilterOpen,
  isOpen,
}: IFilterButtonProps): React.ReactElement {
  function handleOnClick() {
    setIsFilterOpen(!isOpen);
  }
  return (
    <button
      onClick={handleOnClick}
      aria-label="filter button"
      className={`flex justify-center w-44 items-center gap-2 px-4 py-3 rounded-xl 
                whitespace-nowrap transition-colors duration-200 ${
                  isOpen
                    ? "bg-orange text-white hover:bg-orange/90"
                    : "bg-dunkelblau text-white hover:bg-opacity-90"
                }`}
    >
      <FunnelIcon className="h-5 w-5" />
      {t("searchBar.filter")} {isOpen ? t("searchBar.close") : t("searchBar.open")}
    </button>
  );
}
