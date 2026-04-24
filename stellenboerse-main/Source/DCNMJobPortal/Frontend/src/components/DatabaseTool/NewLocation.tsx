import * as React from "react";
import { ILocation } from "../../Interfaces/types";
import { createLocation } from "../../apiReceive/receiveEmployer";
import City from "./LocationToolElements/City";
import HouseNumber from "./LocationToolElements/HouseNumber";
import PostalCode from "./LocationToolElements/PostalCode";
import Street from "./LocationToolElements/Street";

export default function NewLocation() {
  const [CREATED_LOCATION, SET_SELECTED_LOCATION]: [
    ILocation,
    React.Dispatch<React.SetStateAction<ILocation>>,
  ] = React.useState({
    Street: "",
    HouseNumber: "",
    PostalCode: "",
    City: "",
  } as ILocation);
  const [SUBMITTED, SET_SUBMITTED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState(false);

  async function handleSaveButton() {
    try {
      await createLocation(CREATED_LOCATION);
      SET_SUBMITTED(true);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col pb-4 border border-gray-400 shadow rounded-xl p-2 mb-8">
      <h3 className="font-semibold text-3xl text-center">Neuer Standort</h3>
      <div className="flex flex-col gap-2">
        <Street location={CREATED_LOCATION} setLocation={SET_SELECTED_LOCATION} />
        <HouseNumber location={CREATED_LOCATION} setLocation={SET_SELECTED_LOCATION} />
        <PostalCode location={CREATED_LOCATION} setLocation={SET_SELECTED_LOCATION} />
        <City location={CREATED_LOCATION} setLocation={SET_SELECTED_LOCATION} />
      </div>
      <div className="flex flex-col justify-center items-center mt-4">
        {SUBMITTED && <h1 className="mb-2">Erfolgreich gespeichert</h1>}
        <button className="p-2 bg-blue-300 rounded-xl hover:bg-blue-400" onClick={handleSaveButton}>
          Save
        </button>
      </div>
    </div>
  );
}
