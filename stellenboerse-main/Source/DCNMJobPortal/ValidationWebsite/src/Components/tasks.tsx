import * as React from "react";

interface ITasksInputProps {
  value: string[];
  isEditable: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function TasksInput(props: ITasksInputProps) {
  return (
    <textarea
      value={props.value.join("\n")}
      onChange={props.onChange}
      className="w-full border border-gray-300 p-2 rounded"
      placeholder="Job Aufgaben"
      rows={5}
      disabled={!props.isEditable}
    />
  );
}

export default TasksInput;
