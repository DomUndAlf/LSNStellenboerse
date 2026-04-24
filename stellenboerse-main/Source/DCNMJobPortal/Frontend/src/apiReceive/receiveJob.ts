import axios, { AxiosResponse } from "axios";
import { IFilterData, IFilterResponse, IJob } from "../Interfaces/types";
import { IJobList } from "../components/DatabaseTool/JobList";

const URL: string = "http://localhost:4010/api/jobs";
const TOOL_URL: string = "http://localhost:4010/api/tool/jobs";

/**
 * Fetches Filtered Array of Jobs from the Database.
 * @returns {Promise<IJob[]>}
 * @throws {AxiosError}
 */
export async function fetchJobs(filterData: IFilterData): Promise<IFilterResponse> {
  let specialty: string = remapSpecialty(filterData.userSpecialty);
  const RESPONSE: AxiosResponse = await axios.post<IFilterResponse>(URL, {
    specialty: specialty,
    language: filterData.userLanguage,
    employernames: filterData.userEmployernames,
    sortmode: filterData.userSortMode,
    sortorder: filterData.userSortOrder,
    searchterms: filterData.userSearchterms,
    page: filterData.userPage,
  });

  return RESPONSE.data;
}

function remapSpecialty(specialty: string) {
  if (!specialty) {
    return "";
  }
  if (specialty == "socialScience") {
    return "Geistes- und Sozialwissenschaften";
  }
  if (specialty == "engineering") {
    return "Ingenieurwissenschaften";
  }
  if (specialty == "culture") {
    return "Kultur, Kunst, Musik";
  }
  if (specialty == "health") {
    return "Medizin, Gesundheit, Psychologie";
  }
  if (specialty == "mint") {
    return "MINT";
  }
  if (specialty == "law") {
    return "Rechtswissenschaften";
  }
  if (specialty == "economics") {
    return "Wirtschaftswissenschaften";
  }
  if (specialty == "nonAcademic") {
    return "Nicht-wissenschaftliche Berufe";
  }
  return "";
}

export async function fetchJosForUser(): Promise<IJobList[]> {
  let response: AxiosResponse = await axios.get<IJobList>(`${TOOL_URL}`);
  return response.data;
}

/**
 * Deletes a job by its id using the database router.
 */
export async function deleteJobById(jobid: number): Promise<boolean> {
  // Use the public API router like employer operations, not the /database router directly
  const RESPONSE: AxiosResponse = await axios.delete(`${URL}/${jobid}`);
  return RESPONSE.status >= 200 && RESPONSE.status < 300;
}

/**
 * Bulk delete jobs by id (calls single delete per id).
 */
export async function deleteJobsByIds(
  jobids: number[],
): Promise<{ id: number; success: boolean }[]> {
  const results: { id: number; success: boolean }[] = [];
  for (const id of jobids) {
    try {
      const ok = await deleteJobById(id);
      results.push({ id, success: ok });
    } catch (e) {
      results.push({ id, success: false });
    }
  }
  return results;
}

export async function fetchOneJob(jobid: number): Promise<IJob> {
  let response: AxiosResponse = await axios.get(`${URL}/${jobid}`);
  return response.data;
}
