export enum ExtractionAttributs {
  Titel = "jobTitle",
  Description = "jobDescription",
  Tasks = "jobTasks",
  TasksPDF = "jobTasks",
  ApplicationDeadline = "applicationDeadline",
  Language = "language",
  Specialty = "specialty",
}

export function createResponseFormat<T extends string>(name: T) {
  return {
    type: "json_schema",
    json_schema: {
      name,
      schema: {
        type: "object",
        properties: {
          [name]: { type: "string" },
        },
        required: [name],
        additionalProperties: false,
      },
      strict: true,
    },
  } as const;
}

export function createResponseFormatArray<T extends string>(name: T) {
  return {
    type: "json_schema",
    json_schema: {
      name: "Job",
      schema: {
        type: "object",
        properties: {
          [name]: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [name],
        additionalProperties: false,
      },
      strict: true,
    },
  } as const;
}

export type ParsedResponseType<T extends string> = { [K in T]: string };

export type ExpectedResult = {
  jobTitle?: string;
  jobDescription?: string;
  jobTasks?: string[];
  applicationDeadline?: string;
  language?: string;
  specialty?: string[];
};

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const DATE_PARTS: string[] = dateString.split("-");
  const [YEAR, MONTH, DAY]: number[] = DATE_PARTS.map(function (value: string): number {
    return Number(value);
  });
  return new Date(Date.UTC(YEAR, MONTH - 1, DAY));
}

export const SPECIALTIES: string[] = [
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

export function validateSpecialties(specialties: string[]): boolean {
  return specialties.every(function (specialty: string) {
    return SPECIALTIES.includes(specialty);
  });
}
