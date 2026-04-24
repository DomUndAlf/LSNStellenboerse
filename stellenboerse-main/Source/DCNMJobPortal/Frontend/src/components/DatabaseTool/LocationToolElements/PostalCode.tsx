import * as React from "react";
import { ILocation } from "../../../Interfaces/types";
import { ILocationToolProps } from "../LocationTool";

export default function PostalCode({
  location,
  setLocation,
}: ILocationToolProps): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLocation(function (prev: ILocation) {
      return {
        ...prev,
        PostalCode: event.target.value,
      };
    });
  }

  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">PostalCode</h1>
      <input
        type="text"
        value={location.PostalCode ?? ""}
        onChange={handleChange}
        maxLength={5}
        className={`w-full h-8 border border-gray-500 pl-2 ${isValidPostCode(location.PostalCode ?? "") ? "bg-green-50" : "bg-red-50"}`}
      />
    </div>
  );
}

function isValidPostCode(input: string) {
  if (input === "") {
    return true;
  }
  let postCodeRegEx: RegExp = /^\d{5}$/;
  if (postCodeRegEx.test(input)) {
    return true;
  }
  return false;
}
