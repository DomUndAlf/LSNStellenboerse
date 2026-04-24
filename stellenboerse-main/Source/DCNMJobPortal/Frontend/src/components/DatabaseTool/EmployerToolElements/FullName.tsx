import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function FullName({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleFullName(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        FullName: event.target.value,
      };
    });
  }
  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">Full Name</h1>
      <input
        type="text"
        value={employer.FullName}
        onChange={handleFullName}
        className="w-full h-8 border  pl-2"
      />
    </div>
  );
}
