import * as React from "react";
import ShortName from "./EmployerToolElements/ShortName";
import FullName from "./EmployerToolElements/FullName";
import Website from "./EmployerToolElements/Website";
import Emails from "./EmployerToolElements/Emails";
import {
  deleteEmployer,
  getOneEmployer,
  getOneLocation,
  saveEmployer,
} from "../../apiReceive/receiveEmployer";
import { IEmployer, ILocation } from "../../Interfaces/types";
import LocationTool from "./LocationTool";
import { useParams } from "react-router-dom";
import ToValidate from "./EmployerToolElements/ToValidate";
import IsActive from "./EmployerToolElements/IsActive";
import ShowContact from "./EmployerToolElements/ShowContact";
import ContactPerson from "./EmployerToolElements/ContactPerson";
import SendValidationEmails from "./EmployerToolElements/SendValidationEmails";

export interface IEmployerElementProps {
  employer: IEmployer;
  setEmployer: React.Dispatch<React.SetStateAction<IEmployer>>;
}

export default function EmployerTool(): React.ReactElement {
  const [EMPLOYER, SET_EMPLOYER]: [IEmployer, React.Dispatch<React.SetStateAction<IEmployer>>] =
    React.useState<IEmployer>();
  const [RELATED_LOCATION, SET_RELATED_LOCATION]: [
    ILocation,
    React.Dispatch<React.SetStateAction<ILocation>>,
  ] = React.useState<ILocation>();
  const { ID } = useParams<{ ID: string }>();
  const [SUBMITTED, SET_SUBMITTED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState(false);
  const [DELETED, SET_DELETED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState(false);

  React.useEffect(
    function () {
      async function fetchData() {
        try {
          SET_EMPLOYER(await getOneEmployer(Number(ID)));
        } catch (error) {
          console.log(error);
        }
      }
      fetchData();
    },
    [ID],
  );

  React.useEffect(
    function () {
      async function fetchLocation() {
        try {
          if (EMPLOYER) {
            SET_RELATED_LOCATION(await getOneLocation(EMPLOYER.LocationID));
          }
        } catch (error) {
          console.log(error);
        }
      }
      fetchLocation();
    },
    [EMPLOYER],
  );

  async function handleSaveButton() {
    if (!EMPLOYER.ShortName.trim()) {
      alert("Bitte geben Sie den ShortName ein");
      return;
    }

    if (!EMPLOYER.FullName.trim()) {
      alert("Bitte geben Sie den FullName ein");
      return;
    }

    if (!EMPLOYER.Website.trim()) {
      alert("Bitte geben Sie den URL von Website ein");
      return;
    }

    if (EMPLOYER.Emails.length == 0) {
      alert("Bitte geben Sie mindestens ein Email ein");
      return;
    }
    try {
      await saveEmployer(EMPLOYER);
      SET_SUBMITTED(true);
    } catch {
      console.log("Internal Server Error");
    }
  }
  async function handleDelete() {
    try {
      await deleteEmployer(EMPLOYER.EmployerID);
      SET_DELETED(true);
    } catch {
      console.log("Internal Server Error");
    }
  }
  return (
    <>
      {EMPLOYER && (
        <div className="space-y-8">
          <div className="flex flex-col pb-4 border border-gray-400 shadow rounded-xl p-2">
            <h3 className="font-semibold text-3xl text-center">Employer</h3>
            {DELETED ? (
              <div className="flex justify-center items-center my-4">
                <p className="text-lg">Erfolgreich gelöscht</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <ShortName employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <FullName employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <Website employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <Emails employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <ContactPerson employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <ToValidate employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <IsActive employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <SendValidationEmails employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                  <ShowContact employer={EMPLOYER} setEmployer={SET_EMPLOYER} />
                </div>
                <div className="flex flex-col justify-center items-center mt-4">
                  {SUBMITTED && <h1 className="mb-2">Erfolgreich gespeichert</h1>}
                  <div className="flex gap-4">
                    <button
                      className="p-2 bg-blue-300 rounded-xl hover:bg-blue-400"
                      onClick={handleSaveButton}
                    >
                      Save
                    </button>
                    <button
                      className="p-2 bg-blue-300 rounded-xl hover:bg-blue-400"
                      onClick={handleDelete}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {RELATED_LOCATION && (
            <LocationTool location={RELATED_LOCATION} setLocation={SET_RELATED_LOCATION} />
          )}
        </div>
      )}
    </>
  );
}
