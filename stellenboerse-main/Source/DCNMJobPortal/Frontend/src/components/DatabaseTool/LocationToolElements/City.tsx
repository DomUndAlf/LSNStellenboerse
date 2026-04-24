import * as React from "react";
import { ILocation } from "../../../Interfaces/types";
import { ILocationToolProps } from "../LocationTool";

export default function City({ location, setLocation }: ILocationToolProps): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLocation(function (prev: ILocation) {
      return {
        ...prev,
        City: event.target.value,
      };
    });
  }

  return (
    <div className="w-full">
      <h1 className="font-semibold text-xl pl-2 mb-2">City</h1>
      <input
        type="text"
        value={location.City}
        onChange={handleChange}
        className="w-full h-8 border  pl-2"
      />
    </div>
  );
}
