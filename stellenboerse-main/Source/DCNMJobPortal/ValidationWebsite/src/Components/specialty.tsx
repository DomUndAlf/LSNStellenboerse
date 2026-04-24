import * as React from "react";

const SPECIALTIES: string[] = [
  "Geistes- und Sozialwissenschaften",
  "Ingenieurwissenschaften",
  "Kultur, Kunst, Musik",
  "Medizin, Gesundheit, Psychologie",
  "MINT",
  "Rechtswissenschaften",
  "Wirtschaftswissenschaften",
  "Nicht-wissenschaftliche Berufe",
  "Andere",
];

interface ISpecialtyInputProps {
  value: string[];
  isEditable: boolean;
  onChange: (selected: string[]) => void;
}

function SpecialtyInput({ value, isEditable, onChange }: ISpecialtyInputProps) {
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const SELECTEDSPECIALTY: string = e.target.value;
    let updatedSpecialties: string[];

    if (e.target.checked) {
      updatedSpecialties = [...value, SELECTEDSPECIALTY];
    } else {
      updatedSpecialties = value.filter(function (item: string) {
        return item !== SELECTEDSPECIALTY;
      });
    }

    onChange(updatedSpecialties);
  }

  return (
    <div>
      <ul className="space-y-2">
        {SPECIALTIES.map(function (specialty: string): React.ReactElement {
          return (
            <li key={specialty} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={specialty}
                checked={value.includes(specialty)}
                onChange={handleCheckboxChange}
                disabled={!isEditable}
                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-gray-800">{specialty}</label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SpecialtyInput;
