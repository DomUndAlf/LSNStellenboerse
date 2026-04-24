import * as React from "react";

interface IDeadlineInputProps {
  value: string;
  isEditable: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function DeadlineInput(props: IDeadlineInputProps) {
  return (
    <textarea
      value={props.value}
      onChange={props.onChange}
      className="w-full border border-gray-300 p-2 mb-4 rounded"
      placeholder="Keine Bewerbungsfrist vorhanden"
      disabled={!props.isEditable}
      rows={1}
    />
  );
}

export default DeadlineInput;
