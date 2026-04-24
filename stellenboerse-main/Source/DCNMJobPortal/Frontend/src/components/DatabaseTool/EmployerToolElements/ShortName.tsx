import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function ShortName({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleShortName(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        ShortName: event.target.value,
      };
    });
  }
  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">Short Name</h1>
      <input
        type="text"
        value={employer.ShortName}
        onChange={handleShortName}
        className="w-full h-8 border  pl-2"
      />
    </div>
  );
}
