import * as React from "react";
import { useNavigate } from "react-router-dom";
import { IMenuProps } from "./DatabaseToolFrame";

export default function Menu({ privilege }: IMenuProps) {
  const NAVIGATE: ReturnType<typeof useNavigate> = useNavigate();

  function goToEmployerList() {
    NAVIGATE(`/tool/${privilege}/employers`);
  }

  function goToNewLocation() {
    NAVIGATE(`/tool/${privilege}/addlocation`);
  }

  function goToKeyword() {
    NAVIGATE(`/tool/${privilege}/keyword`);
  }

  function goToJob() {
    NAVIGATE(`/tool/${privilege}/jobs`);
  }

  return (
    <div className="flex justify-center gap-8">
      <button
        className="bg-white hover:bg-gray-50 p-4 border border-gray-400 rounded-xl"
        onClick={goToEmployerList}
      >
        Arbeitgeber Bearbeiten
      </button>
      <button
        className="bg-white hover:bg-gray-50 p-4 border border-gray-400 rounded-xl"
        onClick={goToNewLocation}
      >
        Standort hinzufügen
      </button>
      <button
        className="bg-white hover:bg-gray-50 p-4 border border-gray-400 rounded-xl"
        onClick={goToKeyword}
      >
        Keyword Bearbeiten
      </button>
      <button
        className="bg-white hover:bg-gray-50 p-4 border border-gray-400 rounded-xl"
        onClick={goToJob}
      >
        Job Bearbeiten
      </button>
    </div>
  );
}
