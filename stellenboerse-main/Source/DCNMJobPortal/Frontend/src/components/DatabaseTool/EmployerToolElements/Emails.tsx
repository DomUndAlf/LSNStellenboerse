import * as React from "react";
import { IEmployer } from "../../../Interfaces/types";
import { IEmployerElementProps } from "../EmployerTool";
import validator from "validator";

export default function Emails({
  employer,
  setEmployer,
}: IEmployerElementProps): React.ReactElement {
  function handleEmail(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const UPDATED_EMAILS: string[] = employer.Emails.map(function (email: string, i: number) {
      return i === index ? event.target.value : email;
    });

    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        Emails: UPDATED_EMAILS,
      };
    });
  }

  function addEmail() {
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        Emails: [...prev.Emails, ""],
      };
    });
  }

  function removeEmail(i: number) {
    let updatedEmails: string[] = employer.Emails.filter(function (_email: string, index: number) {
      return i !== index;
    });
    setEmployer(function (prev: IEmployer) {
      return {
        ...prev,
        Emails: updatedEmails,
      };
    });
  }

  return (
    <>
      <h1 className="font-semibold text-xl pl-2">Emails</h1>
      {employer.Emails.map(function (email: string, index: number) {
        return (
          <div key={index} className="w-full">
            <div className="w-full flex flex-col space-y-2">
              <div className="w-full flex flex-grow justify-center items-center">
                <h1 className="mx-2">{index + 1}</h1>
                <input
                  type="text"
                  value={email}
                  onChange={function (event: React.ChangeEvent<HTMLInputElement>) {
                    handleEmail(index, event);
                  }}
                  className={`flex flex-grow h-8 focus:outline-none border border-gray-500 pl-2 ${validator.isEmail(email) ? "bg-green-50" : "bg-red-50"}`}
                />
                <button
                  className="mx-2"
                  onClick={function () {
                    removeEmail(index);
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <div>
        <button
          className="ml-6 bg-blue-50 px-2 py-1 border border-gray-500 rounded-xl text-center"
          onClick={addEmail}
        >
          Weitere E-Mail hinzufügen
        </button>
      </div>
    </>
  );
}
