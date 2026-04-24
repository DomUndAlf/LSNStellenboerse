import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";

export default function SendValidationEmails({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleSendValidationEmails(event: React.ChangeEvent<HTMLInputElement>) {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        sendValidationEmails: event.target.checked,
      };
    });
  }

  return (
    <div className="flex items-center">
      <h1 className="font-semibold text-xl pl-2 mb-2 mr-4">Validierungsmails senden:</h1>
      <input
        type="checkbox"
        checked={employer.sendValidationEmails}
        onChange={handleSendValidationEmails}
      />
    </div>
  );
}