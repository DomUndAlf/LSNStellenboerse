import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { getAllEmployers } from "../../../apiReceive/receiveEmployer";

interface IShowEmployersProps {
  selectedEmployer: IEmployer;
  setSelectedEmployer: React.Dispatch<React.SetStateAction<IEmployer>>;
}

export default function ShowEmployers({
  selectedEmployer,
  setSelectedEmployer,
}: IShowEmployersProps): React.ReactElement {
  const [SEARCH_TERM, SET_SEARCH_TERM]: [string, React.Dispatch<React.SetStateAction<string>>] =
    React.useState("");
  const [EMPLOYERS, SET_EMPLOYERS]: [
    IEmployer[],
    React.Dispatch<React.SetStateAction<IEmployer[]>>,
  ] = React.useState([]);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    SET_SEARCH_TERM(event.target.value);
  }

  React.useEffect(function () {
    async function fetchEmployers() {
      try {
        let employers: IEmployer[] = await getAllEmployers();
        SET_EMPLOYERS(employers);
      } catch (error) {
        console.log(error);
      }
    }
    fetchEmployers();
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center ">
      <h3 className="font-semibold text-2xl text-center mb-4">Arbeitgeber</h3>

      {!selectedEmployer ? (
        <>
          <div className="w-full flex justify-center mb-8">
            <input
              className="w-4/5 p-2 border border-gray-300 rounded-md shadow"
              placeholder="Suchen..."
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {EMPLOYERS.map(function (employer: IEmployer) {
              return (
                employer.FullName.toLowerCase().includes(SEARCH_TERM.toLowerCase()) && (
                  <button
                    key={employer.EmployerID}
                    onClick={function () {
                      setSelectedEmployer(employer);
                    }}
                    className="flex flex-col bg-white hover:bg-sky-200 w-64 h-28 justify-center border border-gray-400 shadow rounded-xl p-2"
                  >
                    <h1 className="font-semibold text-l text-center">{employer.FullName}</h1>
                  </button>
                )
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col text-center bg-white w-64 h-28 justify-center border border-gray-400 shadow rounded-xl p-2">
          {selectedEmployer.FullName}
        </div>
      )}
    </div>
  );
}
