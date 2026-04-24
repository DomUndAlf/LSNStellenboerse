import * as React from "react";
import { IFilterData } from "../Interfaces/types";
import { ArrowLongRightIcon, ArrowLongLeftIcon } from "@heroicons/react/20/solid";

interface IPageBarProps {
  filterData: IFilterData;
  setFilterData: React.Dispatch<React.SetStateAction<IFilterData>>;
  totalCount: number;
}

export default function PageBar({ filterData, setFilterData, totalCount }: IPageBarProps) {
  const [CURRENT_INDEX, SET_CURRENT_INDEX]: [number, React.Dispatch<React.SetStateAction<number>>] =
    React.useState(0);
  let totalPages: number = Math.ceil(totalCount / 20) - 1;
  let visiblePages: number = 3;

  function renderPages(): React.JSX.Element {
    if (isNaN(totalPages)) {
      return;
    }
    if (CURRENT_INDEX > totalPages) {
      SET_CURRENT_INDEX(totalPages);
    }

    let pageNumbers: number[] = [];
    let upperBound: number = CURRENT_INDEX + visiblePages;
    let lowerBound: number = CURRENT_INDEX - visiblePages;

    if (upperBound >= totalPages) {
      upperBound = totalPages;
    }

    if (lowerBound <= 0) {
      lowerBound = 0;
    } else {
      pageNumbers.push(0);
      if (lowerBound - 1 > 0) {
        pageNumbers.push(-1);
      }
    }

    for (let i: number = lowerBound; i <= upperBound; i++) {
      pageNumbers.push(i);
    }

    if (upperBound < totalPages) {
      if (upperBound + 1 < totalPages) {
        pageNumbers.push(-1);
      }
      pageNumbers.push(totalPages);
    }

    return (
      <>
        {pageNumbers.map(function (index: number) {
          return index >= 0 ? (
            <button
              key={index}
              className={`w-10 h-10 rounded-full ${index === filterData.userPage ? "bg-blue-200" : "hover:bg-blue-100"}`}
              onClick={function () {
                handlePageButton(index);
              }}
            >
              {index + 1}
            </button>
          ) : (
            <div key={index} className="flex justify center items-center mx-4">
              <p>...</p>
            </div>
          );
        })}
      </>
    );
  }

  function handlePageButton(index: number) {
    if (filterData.userPage !== index) {
      setFilterData(function (prev: IFilterData) {
        return {
          ...prev,
          userPage: Number(index),
        };
      });
      SET_CURRENT_INDEX(index);
    }
  }

  function handleNext() {
    if (CURRENT_INDEX + visiblePages < totalPages) {
      SET_CURRENT_INDEX(function (prev: number) {
        return prev + visiblePages;
      });
    }
  }

  function handlePrev() {
    if (CURRENT_INDEX - visiblePages >= 0) {
      SET_CURRENT_INDEX(function (prev: number) {
        return prev - visiblePages;
      });
    }
  }
  return (
    <div className="w-full flex justify-center items-center mt-8">
      {CURRENT_INDEX - visiblePages - 1 > 0 && (
        <button key={"left"} onClick={handlePrev} className="w-10 h-10 mr-2">
          <ArrowLongLeftIcon className="w mr-3 text-blue-800" />
        </button>
      )}
      <div className="flex gap-2">{renderPages()}</div>

      {CURRENT_INDEX + visiblePages + 1 < totalPages && (
        <button key={"right"} onClick={handleNext} className="w-10 h-10 ml-2">
          <ArrowLongRightIcon className="w-visiblePages h-visiblePages ml-3 text-blue-800" />
        </button>
      )}
    </div>
  );
}
