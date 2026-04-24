import * as React from "react";

interface ITitleInputProps {
  value: string;
  isEditable: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
}

function TitleInput(props: ITitleInputProps) {
  return (
    <textarea
      value={props.value}
      onChange={props.onChange}
      className="w-full border border-gray-300 p-2 rounded"
      placeholder="Job Title"
      disabled={!props.isEditable}
      maxLength={props.maxLength}
      rows={1}
    />
  );
}

export default TitleInput;
