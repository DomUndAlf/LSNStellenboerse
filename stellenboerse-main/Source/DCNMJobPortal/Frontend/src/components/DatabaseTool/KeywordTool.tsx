import * as React from "react";
import { IEmployer, ILocation } from "../../Interfaces/types";
import ShowEmployers from "./KeywordToolElements/ShowEmployers";
import ShowLocations from "./KeywordToolElements/ShowLocations";
import { createNewKeyword } from "../../apiReceive/receiveEmployer";

export default function KeywordTool() {
  const [SELECTED_LOCATION, SET_SELECTED_LOCATION]: [
    ILocation,
    React.Dispatch<React.SetStateAction<ILocation>>,
  ] = React.useState();
  const [SELECTED_EMPLOYER, SET_SELECTED_EMPLOYER]: [
    IEmployer,
    React.Dispatch<React.SetStateAction<IEmployer>>,
  ] = React.useState();
  const [NEW_KEYWORD, SET_NEW_KEYWORD]: [string, React.Dispatch<React.SetStateAction<string>>] =
    React.useState("");

  const [SUBMITTED, SET_SUBMITTED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState(false);
  async function handleSaveButton() {
    if (!SELECTED_LOCATION || !SELECTED_EMPLOYER) {
      alert("Wählen Sie bitte den Arbeitgeber und Standort");
      return;
    }
    if (!NEW_KEYWORD.trim()) {
      alert("Geben Sie bitte den Keyword");
      return;
    }
    await createNewKeyword(NEW_KEYWORD, SELECTED_EMPLOYER.EmployerID, SELECTED_LOCATION.LocationID);
    SET_SUBMITTED(true);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    SET_NEW_KEYWORD(event.target.value);
  }

  return (
    <div className="flex flex-col pb-4 border border-gray-400 shadow rounded-xl p-2">
      <h3 className="font-semibold text-3xl text-center">Keyword</h3>

      <div className="flex justify-center items-center gap-4 p-2 mt-4">
        <input
          type="text"
          value={NEW_KEYWORD}
          onChange={handleChange}
          placeholder="Geben Sie bitte den Keyword hier"
          className="w-4/5 h-8 border p-4 border-gray-400 rounded-l"
        />
        <div className="flex justify-center">
          <button
            className="py-2 px-4 bg-blue-300 rounded-full hover:bg-blue-400"
            onClick={handleSaveButton}
          >
            Save
          </button>
        </div>
      </div>
      {SUBMITTED && (
        <div className="text-center">
          <h1 className="mb-2">Erfolgreich gespeichert</h1>
        </div>
      )}

      <div className="flex mt-4">
        <ShowEmployers
          selectedEmployer={SELECTED_EMPLOYER}
          setSelectedEmployer={SET_SELECTED_EMPLOYER}
        />
        <div className="border border-gray-400 mx-3 "></div>
        <ShowLocations
          selectedLocation={SELECTED_LOCATION}
          setSelectedLocation={SET_SELECTED_LOCATION}
        />
      </div>
    </div>
  );
}
