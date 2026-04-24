import * as React from "react";
import { fetchJosForUser, deleteJobById, deleteJobsByIds } from "../../apiReceive/receiveJob";
import axios from "axios";

export interface IJobList {
  JobID: number;
  Title: string;
  ValidationKey: string;
  EmployerID?: number;
  EmployerShortname?: string;
}

const VALIDATION_URL: string = "http://localhost:3010?key=";

export default function JobList(): React.ReactElement {
  const [SEARCH_TERM, SET_SEARCH_TERM]: [string, React.Dispatch<React.SetStateAction<string>>] =
    React.useState("");
  const [JOBS, SET_JOBS]: [IJobList[], React.Dispatch<React.SetStateAction<IJobList[]>>] =
    React.useState([]);
  const [SELECTED, SET_SELECTED] = React.useState<number[]>([]);
  const [SELECT_ALL, SET_SELECT_ALL] = React.useState<boolean>(false);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    SET_SEARCH_TERM(event.target.value);
  }

  function goToJob(key: string) {
    window.open(`${VALIDATION_URL}${key}`);
  }

  async function handleDeleteSingle(jobid: number) {
    if (!confirm(`Sind Sie sicher, dass Sie Job #${jobid} löschen möchten?`)) return;
    try {
      const ok = await deleteJobById(jobid);
      if (ok) {
        SET_JOBS((prev) => prev.filter((j) => j.JobID !== jobid));
        SET_SELECTED((prev) => prev.filter((id) => id !== jobid));
        alert("Job gelöscht");
      } else {
        alert("Löschen fehlgeschlagen");
      }
    } catch (e) {
      console.error(e);
      alert("Fehler beim Löschen");
    }
  }

  async function handleDeleteSelected() {
    if (SELECTED.length === 0) return;
    if (!confirm(`Sind Sie sicher, dass Sie ${SELECTED.length} Job(s) löschen möchten?`)) return;
    const results = await deleteJobsByIds(SELECTED);
    const successIds = results.filter((r) => r.success).map((r) => r.id);
    if (successIds.length > 0) {
      SET_JOBS((prev) => prev.filter((j) => !successIds.includes(j.JobID)));
      SET_SELECTED([]);
      alert(`${successIds.length} Job(s) gelöscht`);
    } else {
      alert("Keine Jobs konnten gelöscht werden");
    }
  }

  React.useEffect(function () {
    async function fetchData() {
      try {
        let jobs: IJobList[] = await fetchJosForUser();
        // Backend now returns Employer relation; map ShortName if present
        const enriched = jobs.map((job) => {
          const emp = (job as any).Employer;
          return { ...job, EmployerShortname: emp ? emp.ShortName : undefined } as IJobList;
        });
        SET_JOBS(enriched);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <h3 className="font-semibold text-2xl text-center mb-4">Jobs</h3>
      <div className="w-full flex justify-center mb-8">
        <input
          className="w-4/5 p-2 border border-gray-300 rounded-md shadow"
          placeholder="Suchen..."
          onChange={handleSearchChange}
        />
      </div>
      <div className="flex flex-col gap-4 justify-center">
        <div className="flex gap-2 justify-between mb-2 items-center">
          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={SELECT_ALL}
                onChange={(e) => {
                  const checked = e.target.checked;
                  SET_SELECT_ALL(checked);
                  if (checked) {
                    // Only select visible/filtered jobs
                    const term = SEARCH_TERM.toLowerCase();
                    const visibleJobs = JOBS.filter((job) => 
                      job.Title.toLowerCase().includes(term) ||
                      job.JobID.toString().includes(term) ||
                      (job.EmployerShortname || "").toLowerCase().includes(term)
                    );
                    SET_SELECTED(visibleJobs.map((j) => j.JobID));
                  } else {
                    SET_SELECTED([]);
                  }
                }}
              />
              Alles auswählen
            </label>
          </div>
          <div>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
              disabled={SELECTED.length === 0}
            >
              Lösche ausgewählte
            </button>
          </div>
        </div>
        {JOBS.map(function (job: IJobList) {
          const term = SEARCH_TERM.toLowerCase();
          const visible =
            job.Title.toLowerCase().includes(term) ||
            job.JobID.toString().includes(term) ||
            (job.EmployerShortname || "").toLowerCase().includes(term);
          return (
            visible && (
              <div
                key={job.JobID}
                className="flex items-center bg-white hover:bg-sky-200 border border-gray-400 shadow rounded-xl p-2"
              >
                <input
                  type="checkbox"
                  className="mr-3"
                  checked={SELECTED.includes(job.JobID)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      SET_SELECTED((prev) => [...prev, job.JobID]);
                      // if selecting individual, update select-all state
                      if (SELECTED.length + 1 === JOBS.length) {
                        SET_SELECT_ALL(true);
                      }
                    } else {
                      SET_SELECTED((prev) => prev.filter((id) => id !== job.JobID));
                      SET_SELECT_ALL(false);
                    }
                  }}
                />
                <div className="flex-1 text-left" onClick={() => goToJob(job.ValidationKey)}>
                  <h1 className="font-semibold">#{job.JobID}</h1>
                  <h1 className="font-bold text-scale-lg text-dunkelblau">{job.Title}</h1>
                  {job.EmployerShortname && (
                    <div className="text-textbody text-scale-md">
                      Arbeitgeber: {job.EmployerShortname}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteSingle(job.JobID)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            )
          );
        })}
      </div>
    </>
  );
}
