import * as React from "react";

interface ILanguageInputProps {
  value: string;
  isEditable: boolean;
  onChange: (value: string) => void;
}

function LanguageInput(props: ILanguageInputProps) {
  function GET_DISPLAY_VALUE(code: string): string {
    return code === "de" ? "Deutsch" : "Englisch";
  }

  function HANDLE_CHANGE(e: React.ChangeEvent<HTMLSelectElement>): void {
    const SELECTED_VALUE: string = e.target.value;
    props.onChange(SELECTED_VALUE);
  }

  return (
    <select
      value={props.value}
      onChange={HANDLE_CHANGE}
      className="w-full border border-gray-300 p-2 mb-4 rounded cursor-pointer"
      disabled={!props.isEditable}
    >
      <option value="de">{GET_DISPLAY_VALUE("de")}</option>
      <option value="en">{GET_DISPLAY_VALUE("en")}</option>
    </select>
  );
}

export default LanguageInput;
