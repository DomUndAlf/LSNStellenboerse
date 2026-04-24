import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function ToValidate({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleToValidate(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        toValidate: event.target.checked,
      };
    });
  }
  return (
    <div className="flex">
      <h1 className="font-semibold text-xl pl-2 mb-2 mr-4">Muss Validiert werden:</h1>
      <input type="checkbox" checked={employer.toValidate} onChange={handleToValidate} />
    </div>
  );
}
