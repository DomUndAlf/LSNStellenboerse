import * as React from "react";
import { useState, useEffect } from "react";
import TitleInput from "./title";
import DescriptionInput from "./description";
import DeadlineInput from "./deadline";
import LanguageInput from "./language";
import { saveNewData, getJob } from "../ClientLogic/dynamicData";
import SpecialtyInput from "./specialty";
import { validateAndFormatDate } from "../ClientLogic/validatingInput";
import TasksInput from "./tasks";
import { IJob } from "../../../Shared/interfaces";

function Frame() {
  const [TITLE, SET_TITLE]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [URL, SET_URL]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [DESCRIPTION, SET_DESCRIPTION]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [TASKS, SET_TASKS]: [string[], React.Dispatch<React.SetStateAction<string[]>>] = useState<
    string[]
  >([]);
  const [DEADLINE, SET_DEADLINE]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [LANGUAGE, SET_LANGUAGE]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>("");
  const [SPECIALTY, SET_SPECIALTY]: [string[], React.Dispatch<React.SetStateAction<string[]>>] =
    useState<string[]>([]);
  const [ID, SET_ID]: [number | null, React.Dispatch<React.SetStateAction<number | null>>] =
    useState<number | null>(null);
  const [IS_EDITABLE, SET_IS_EDITABLE]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);
  const [IS_SUBMITTED, SET_IS_SUBMITTED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);
  const [IS_VALID, SET_IS_VALID]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(true);

  const VALKEY: string | null = new URLSearchParams(window.location.search).get("key");

  async function loadJobData() {
    if (!VALKEY) {
      SET_IS_VALID(false);
      return;
    }
    try {
      const CURRENT_JOB: IJob = await getJob(VALKEY);

      SET_TITLE(CURRENT_JOB.Title);
      SET_URL(CURRENT_JOB.Website.JobURL);
      SET_DESCRIPTION(CURRENT_JOB.Description);
      SET_TASKS(CURRENT_JOB.Tasks);
      SET_LANGUAGE(CURRENT_JOB.Language);
      SET_SPECIALTY(CURRENT_JOB.Specialty);
      SET_ID(CURRENT_JOB.JobID);

      let deadline: string = "";
      if (CURRENT_JOB.ApplicationDeadline) {
        try {
          const DEADLINE_DATE: Date = new Date(CURRENT_JOB.ApplicationDeadline);
          if (!isNaN(DEADLINE_DATE.getTime())) {
            deadline = DEADLINE_DATE.toLocaleDateString("de-DE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
          }
        } catch (error) {
          console.error("Error when processing the deadline date:", error);
        }
      }
      SET_DEADLINE(deadline);
    } catch (error) {
      console.error("Error when retrieving the job:", error);
      SET_IS_VALID(false);
    }
  }

  useEffect(
    function loadJobDataEffect() {
      loadJobData();
    },
    [VALKEY],
  );

  function handleTitleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    SET_TITLE(e.target.value);
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    SET_DESCRIPTION(e.target.value);
  }

  function handleTasksChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const TASKS_ARRAY: string[] = e.target.value.split("\n");
    SET_TASKS(TASKS_ARRAY);
  }

  function handleDeadlineChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    SET_DEADLINE(e.target.value);
  }

  function handleLanguageChange(language: string) {
    SET_LANGUAGE(language);
  }

  function handleSpecialtyChange(updatedSpecialties: string[]) {
    SET_SPECIALTY(updatedSpecialties);
  }

  function handleSaveClick() {
    if (IS_EDITABLE) {
      // Nur wenn gespeichert wird, soll validiert werden
      if (!TITLE.trim() || (!DESCRIPTION.trim() && TASKS.length === 0)) {
        alert(
          "Bitte füllen Sie den Titel oder mindestens Beschreibung oder Arbeitsaufgaben aus, bevor Sie speichern.",
        );
        return;
      }

      if (TASKS.join("\n").trim().length > 0) {
        const TASKS_ARRAY: string[] = TASKS.join("\n")
          .split("\n")
          .map(function (task: string): string {
            return task.trim();
          });
        const INVALID_TASKS: string[] = TASKS_ARRAY.filter(function (task: string): boolean {
          return task.length === 0;
        });

        if (INVALID_TASKS.length > 0) {
          alert(
            "Bitte geben Sie die Arbeitsaufgaben korrekt ein. Jede Aufgabe muss auf einer eigenen Zeile stehen und darf nicht nur aus Leerzeichen bestehen.",
          );
          return;
        }
      }
    }

    SET_IS_EDITABLE(!IS_EDITABLE);
  }

  async function handleDoneClick() {
    if (!TITLE.trim() || (!DESCRIPTION.trim() && TASKS.length === 0)) {
      alert(
        "Bitte füllen Sie den Titel oder mindestens Beschreibung oder Arbeitsaufgaben aus, bevor Sie bestätigen.",
      );
      return;
    }

    if (IS_EDITABLE) {
      alert(
        "Bitte überprüfen Sie Ihre Änderungen und speichern Sie den bearbeiteten Text zuerst, bevor Sie auf 'Bestätigen' klicken.",
      );
      return;
    }

    let FORMATTED_DEADLINE: Date | null = null;
    if (DEADLINE.trim()) {
      FORMATTED_DEADLINE = validateAndFormatDate(DEADLINE);
      if (!FORMATTED_DEADLINE) {
        alert("Bitte geben Sie ein gültiges Datum im Format TT.MM.JJJJ oder YYYY-MM-DD ein.");
        return;
      }
    }

    let TASKS_ARRAY: string[];
    if (TASKS.join("\n").trim() === "") {
      TASKS_ARRAY = [];
    } else {
      TASKS_ARRAY = TASKS.join("\n")
        .split("\n")
        .map(function (task: string): string {
          return task.trim();
        });
    }

    try {
      await saveNewData(
        ID,
        TITLE,
        DESCRIPTION,
        TASKS_ARRAY,
        FORMATTED_DEADLINE,
        LANGUAGE,
        SPECIALTY,
      );
      SET_IS_SUBMITTED(true);
    } catch {
      console.error("Fehler beim Speichern der Daten");
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {!IS_VALID ? (
        <div className="text-center">
          <p className="text-gray-500">
            Unter dieser URL existiert keine Stellenanzeige oder sie wurde entfernt.
          </p>
        </div>
      ) : !IS_SUBMITTED ? (
        <>
          <h2 className="text-xl font-bold mb-6">
            Überprüfen Sie in den folgenden Textfeldern die Korrektheit Ihrer Job-Anzeige.
          </h2>

          <p>
            Link zum Original Job:{" "}
            <a
              className="text-blue-600 underline mb-4"
              href={URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hier klicken
            </a>
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-xl mb-2">Titel:</h3>
              <TitleInput
                value={TITLE}
                onChange={handleTitleChange}
                isEditable={IS_EDITABLE}
                maxLength={300}
              />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Beschreibung:</h3>
              <DescriptionInput
                value={DESCRIPTION}
                onChange={handleDescriptionChange}
                isEditable={IS_EDITABLE}
              />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Arbeitsaufgaben:</h3>
              <p className="text-sm text-gray-500 mb-2">
                Bitte trennen Sie die Aufgaben mit einer Leerzeile ohne Komma.
              </p>
              <TasksInput value={TASKS} onChange={handleTasksChange} isEditable={IS_EDITABLE} />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Bewerbungsfrist:</h3>
              <DeadlineInput
                value={DEADLINE}
                onChange={handleDeadlineChange}
                isEditable={IS_EDITABLE}
              />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Sprache:</h3>
              <LanguageInput
                value={LANGUAGE}
                onChange={handleLanguageChange}
                isEditable={IS_EDITABLE}
              />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Fachgebiet:</h3>
              <SpecialtyInput
                value={SPECIALTY}
                onChange={handleSpecialtyChange}
                isEditable={IS_EDITABLE}
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-hellblau text-white rounded hover:bg-hellblau mt-4"
            >
              {IS_EDITABLE ? "Speichern" : "Bearbeiten"}
            </button>
            <button
              onClick={handleDoneClick}
              className="px-4 py-2 bg-dunkelblau text-white rounded hover:bg-hellblau mt-4 ml-auto"
            >
              Bestätigen
            </button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-l">Die Daten wurden gespeichert.</p>
          <p className="text-l mt-2">
            Ihre Stelle kann unter folgendem Link gefunden werden:{" "}
            <a
              href={`http://localhost:3000/job/${ID}`}
              className="text-blue-500 underline hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:3000/job/{ID}
            </a>
          </p>
          <p className="text-orange font-semibold text-xl">Vielen Dank für Ihre Kooperation!</p>
        </div>
      )}
    </div>
  );
}

export default Frame;
