import * as React from "react";
import { ILocation } from "../../Interfaces/types";
import { getAllLocations } from "../../apiReceive/receiveEmployer";

interface ILocationListProps {
  selectedLocation: ILocation;
  setSelectedLocation: React.Dispatch<React.SetStateAction<ILocation>>;
}

function formatLocationLabel(location: ILocation): string {
  const STREET_PART: string = [location.Street, location.HouseNumber]
    .filter(Boolean)
    .join(" ");
  const CITY_PART: string = [location.PostalCode, location.City]
    .filter(Boolean)
    .join(" ");
  if (STREET_PART && CITY_PART) {
    return `${STREET_PART}, ${CITY_PART}`;
  }
  return CITY_PART || STREET_PART;
}

export default function LocationList({
  selectedLocation,
  setSelectedLocation,
}: ILocationListProps): React.ReactElement {
  const [SEARCH_TERM, SET_SEARCH_TERM]: [string, React.Dispatch<React.SetStateAction<string>>] =
    React.useState("");
  const [LOCATIONS, SET_LOCATIONS]: [
    ILocation[],
    React.Dispatch<React.SetStateAction<ILocation[]>>,
  ] = React.useState([]);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    SET_SEARCH_TERM(event.target.value);
  }

  React.useEffect(function () {
    async function fetchLocations() {
      try {
        SET_LOCATIONS(await getAllLocations());
      } catch (error) {
        console.log(error);
      }
    }
    fetchLocations();
  }, []);

  return (
    <>
      {!selectedLocation ? (
        <>
          <h3 className="font-semibold text-2xl text-center mb-2">Standort</h3>
          <div className="w-full flex justify-center">
            <input
              className="w-4/5 p-2 border border-gray-300 mb-6 rounded-md shadow"
              placeholder="Suchen..."
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {LOCATIONS.map(function (location: ILocation) {
              return (
                (location.City.toLowerCase().includes(SEARCH_TERM.toLowerCase()) ||
                  (location.Street && location.Street.toLowerCase().includes(SEARCH_TERM.toLowerCase()))) && (
                  <button
                    key={location.LocationID}
                    onClick={function () {
                      setSelectedLocation(location);
                    }}
                    className="flex flex-col hover:bg-sky-200 w-64 h-28 justify-center border border-gray-400 shadow rounded-xl p-2"
                  >
                    <h1 className="font-semibold text-l text-center">
                      {formatLocationLabel(location)}
                    </h1>
                  </button>
                )
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <div className="flex flex-col text-center bg-white w-64 h-28 justify-center border border-gray-400 shadow rounded-xl p-2">
            <p>
              {formatLocationLabel(selectedLocation)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
