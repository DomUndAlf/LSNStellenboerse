import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function ShowContact({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleShowContactChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        showContact: event.target.checked,
      };
    });
  }
  return (
    <div className="flex items-center">
      <h1 className="font-semibold text-xl pl-2 mb-2 mr-4">Kontakt anzeigen:</h1>
      <input type="checkbox" checked={employer.showContact} onChange={handleShowContactChange} />
    </div>
  );
}
