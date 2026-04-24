import * as React from "react";
import { IEmployer } from "../../Interfaces/types";
import { getAllEmployers } from "../../apiReceive/receiveEmployer";
import { useNavigate } from "react-router-dom";

export interface IEmployerListProps {
  privilege: string;
}

export default function EmployerList({ privilege }: IEmployerListProps): React.ReactElement {
  const [SEARCH_TERM, SET_SEARCH_TERM]: [string, React.Dispatch<React.SetStateAction<string>>] =
    React.useState("");
  const [EMPLOYERS, SET_EMPLOYERS]: [
    IEmployer[],
    React.Dispatch<React.SetStateAction<IEmployer[]>>,
  ] = React.useState([]);
  const NAVIGATE: ReturnType<typeof useNavigate> = useNavigate();

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    SET_SEARCH_TERM(event.target.value);
  }

  function goToNewEmployer() {
    NAVIGATE(`/tool/${privilege}/addemployer`);
  }

  function goToEmployerTool(employer: IEmployer) {
    NAVIGATE(`/tool/${privilege}/employers/${employer.EmployerID}`);
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
    <>
      <h3 className="font-semibold text-2xl text-center mb-4">Arbeitgeber</h3>
      <div className="w-full flex justify-center mb-8">
        <input
          className="w-4/5 p-2 border border-gray-300 rounded-md shadow"
          placeholder="Suchen..."
          onChange={handleSearchChange}
        />
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        <button
          className="flex flex-col bg-green-50 hover:bg-sky-200 w-64 h-28 justify-center border border-gray-400 shadow rounded-xl p-2"
          onClick={goToNewEmployer}
        >
          <h1 className="font-semibold text-l text-center">Neue Arbeitgeber hinzufügen</h1>
        </button>

        {EMPLOYERS.map(function (employer: IEmployer) {
          return (
            employer.FullName.toLowerCase().includes(SEARCH_TERM.toLowerCase()) && (
              <button
                key={employer.EmployerID}
                onClick={function () {
                  goToEmployerTool(employer);
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
  );
}
