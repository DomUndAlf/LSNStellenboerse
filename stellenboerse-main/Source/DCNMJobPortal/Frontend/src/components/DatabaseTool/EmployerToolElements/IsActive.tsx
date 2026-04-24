import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function IsActive({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleIsActiveChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        isActive: event.target.checked,
      };
    });
  }
  return (
    <div className="flex items-center">
      <h1 className="font-semibold text-xl pl-2 mb-2 mr-4">Is Active:</h1>
      <input type="checkbox" checked={employer.isActive} onChange={handleIsActiveChange} />
    </div>
  );
}
