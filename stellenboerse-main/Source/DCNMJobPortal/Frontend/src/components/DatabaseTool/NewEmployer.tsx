import * as React from "react";
import { IEmployer, ILocation } from "../../Interfaces/types";
import ShortName from "./EmployerToolElements/ShortName";
import FullName from "./EmployerToolElements/FullName";
import Website from "./EmployerToolElements/Website";
import Emails from "./EmployerToolElements/Emails";
import LocationList from "./LocationList";
import { createEmployer } from "../../apiReceive/receiveEmployer";
import SendValidationEmails from "./EmployerToolElements/SendValidationEmails";

export default function NewEmployer() {
  const [CREATED_EMPLOYER, SET_CREATED_EMPLOYER]: [
    IEmployer,
    React.Dispatch<React.SetStateAction<IEmployer>>,
  ] = React.useState<IEmployer>({
    ShortName: "",
    FullName: "",
    Website: "",
    Emails: [""],
    sendValidationEmails: true,
  } as IEmployer);
  const [SELECTED_LOCATION, SET_SELECTED_LOCATION]: [
    ILocation,
    React.Dispatch<React.SetStateAction<ILocation>>,
  ] = React.useState();
  const [SUBMITTED, SET_SUBMITTED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState(false);

  async function handleSaveButton() {
    if (!SELECTED_LOCATION) {
      alert("Bitte wählen Sie ein Location");
      return;
    }

    if (!CREATED_EMPLOYER.ShortName.trim()) {
      alert("Bitte geben Sie den ShortName ein");
      return;
    }

    if (!CREATED_EMPLOYER.FullName.trim()) {
      alert("Bitte geben Sie den FullName ein");
      return;
    }

    if (!CREATED_EMPLOYER.Website.trim()) {
      alert("Bitte geben Sie den URL von Website ein");
      return;
    }

    if (CREATED_EMPLOYER.Emails.length == 0) {
      alert("Bitte geben Sie mindestens ein Email ein");
      return;
    }

    try {
      await createEmployer(CREATED_EMPLOYER);
      SET_SUBMITTED(true);
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(
    function () {
      if (SELECTED_LOCATION) {
        SET_CREATED_EMPLOYER(function (prev: IEmployer) {
          return {
            ...prev,
            LocationID: SELECTED_LOCATION.LocationID,
          };
        });
      }
    },
    [SELECTED_LOCATION],
  );

  return (
    <div>
      <div className="flex flex-col pb-4 border border-gray-400 shadow rounded-xl p-2 mb-8">
        <h3 className="font-semibold text-3xl text-center">Neuer Arbeitgeber</h3>
        <div className="flex flex-col gap-2">
          <ShortName employer={CREATED_EMPLOYER} setEmployer={SET_CREATED_EMPLOYER} />
          <FullName employer={CREATED_EMPLOYER} setEmployer={SET_CREATED_EMPLOYER} />
          <Website employer={CREATED_EMPLOYER} setEmployer={SET_CREATED_EMPLOYER} />
          <Emails employer={CREATED_EMPLOYER} setEmployer={SET_CREATED_EMPLOYER} />
          <SendValidationEmails employer={CREATED_EMPLOYER} setEmployer={SET_CREATED_EMPLOYER} />
        </div>
        <div className="flex flex-col justify-center items-center mt-4">
          {SUBMITTED && <h1 className="mb-2">Erfolgreich gespeichert</h1>}
          <button
            className="p-2 bg-blue-300 rounded-xl hover:bg-blue-400"
            onClick={handleSaveButton}
          >
            Save
          </button>
        </div>
      </div>
      <LocationList
        selectedLocation={SELECTED_LOCATION}
        setSelectedLocation={SET_SELECTED_LOCATION}
      />
    </div>
  );
}
