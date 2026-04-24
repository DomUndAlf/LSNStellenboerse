import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function ContactPerson({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleContactPerson(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        ContactPerson: event.target.value,
      };
    });
  }
  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">Ansprechperson</h1>
      <input
        type="text"
        value={employer.ContactPerson || ""}
        onChange={handleContactPerson}
        className="w-full h-8 border pl-2"
      />
    </div>
  );
}
