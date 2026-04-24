import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";
import validator from "validator";

export default function Website({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleWebsite(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        Website: event.target.value,
      };
    });
  }
  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">Website</h1>
      <input
        type="text"
        value={employer.Website}
        onChange={handleWebsite}
        className={`w-full h-8 border border-gray-500 focus:outline-none pl-2 ${validator.isURL(employer.Website) ? "bg-green-50" : "bg-red-50"}`}
      />
    </div>
  );
}
