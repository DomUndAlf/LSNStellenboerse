import * as React from "react";

interface IDescriptionInputProps {
  value: string;
  isEditable: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function DescriptionInput(props: IDescriptionInputProps) {
  return (
    <textarea
      value={props.value}
      onChange={props.onChange}
      className="w-full border border-gray-300 p-2 rounded"
      placeholder="Job Beschreibung"
      rows={5}
      disabled={!props.isEditable}
    />
  );
}

export default DescriptionInput;
