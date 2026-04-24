import * as React from "react";
import { ReactElement } from "react";
import Street from "./LocationToolElements/Street";
import HouseNumber from "./LocationToolElements/HouseNumber";
import PostalCode from "./LocationToolElements/PostalCode";
import City from "./LocationToolElements/City";
import { saveLocation } from "../../apiReceive/receiveEmployer";
import { ILocation } from "../../Interfaces/types";

export interface ILocationToolProps {
  location: ILocation;
  setLocation: React.Dispatch<React.SetStateAction<ILocation>>;
}

export default function LocationTool({ location, setLocation }: ILocationToolProps): ReactElement {
  const [LOADING, SET_LOADING]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState<boolean>(false);
  const [SUBMITTED, SET_SUBMITTED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState(false);

  async function handleSaveButton() {
    try {
      SET_LOADING(true);
      await saveLocation(location);
      SET_SUBMITTED(true);
    } catch {
      console.log("Internal server error");
    } finally {
      SET_LOADING(false);
    }
  }
  return (
    <div className="flex flex-col pb-4 border border-gray-400 shadow rounded-xl p-2">
      <h3 className="font-semibold text-3xl text-center">Standort</h3>
      <div className="flex flex-col gap-2">
        {!LOADING ? (
          <>
            <Street location={location} setLocation={setLocation} />
            <HouseNumber location={location} setLocation={setLocation} />
            <PostalCode location={location} setLocation={setLocation} />
            <City location={location} setLocation={setLocation} />
          </>
        ) : (
          <p className="text-center p-6 text-xl">Loading...</p>
        )}
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
