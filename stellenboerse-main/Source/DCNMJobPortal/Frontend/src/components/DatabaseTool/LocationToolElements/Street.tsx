import * as React from "react";
import { ILocation } from "../../../Interfaces/types";
import { ILocationToolProps } from "../LocationTool";

export default function Street({ location, setLocation }: ILocationToolProps): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLocation(function (prev: ILocation) {
      return {
        ...prev,
        Street: event.target.value,
      };
    });
  }

  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">Street</h1>
      <input
        type="text"
        value={location.Street ?? ""}
        onChange={handleChange}
        className="w-full h-8 border  pl-2"
      />
    </div>
  );
}
