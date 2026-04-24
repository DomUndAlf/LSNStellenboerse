import { IFilterData, IJob } from "./types";
import React from "react";

export interface IFrameProps {
  isOpen: boolean;
  job: IJob | null;
  onClose: () => void;
}

export interface IDialogProps {
  job: IJob;
}

export interface IJobListItemsProps {
  job: IJob;
  onClick: () => void;
}

export interface ISearchBarProps {
  onSort: (order: string) => Promise<void>;
  setFilterData: React.Dispatch<React.SetStateAction<IFilterData>>;
  onSearch: (searchTerm: string) => void;
}

export interface IFilterButtonProps {
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export interface IFilterDataProps {
  filterData: IFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<IFilterData>>;
}

export interface IFilterChangeProps {
  filterData: IFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<IFilterData>>;
}
