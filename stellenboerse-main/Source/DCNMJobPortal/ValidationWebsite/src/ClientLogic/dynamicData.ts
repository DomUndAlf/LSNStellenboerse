import axios, { AxiosResponse } from "axios";
import { IJob } from "../../../Shared/interfaces";

/**
 * Fetches a job based on a validation key.
 *
 * @param VALKEY The validation key used to retrieve the job. Must not be null.
 * @returns A promise resolving to the job object implementing the `IJob` interface.
 * @throws {Error} If the validation key is missing or the job data cannot be retrieved.
 */
export async function getJob(VALKEY: string | null): Promise<IJob> {
  const RESPONSE: AxiosResponse = await axios.get<IJob>(
    `http://localhost:4010/api/jobs/validation/${VALKEY}`,
  );
  return RESPONSE.data;
}

/**
 * Fetches employer data based on the employer ID.
 *
 * @param employerId The unique ID of the employer.
 * @returns A promise resolving to an object with the `toValidate` property.
 * @throws {Error} If the employer data cannot be retrieved.
 */
export async function getEmployer(employerId: number): Promise<{ toValidate: boolean }> {
  if (!employerId) {
    throw new Error("Employer ID is missing.");
  }

  try {
    const RESPONSE: AxiosResponse<{ toValidate: boolean }> = await axios.get<{
      toValidate: boolean;
    }>(`http://localhost:4010/api/employer/${employerId}`);
    return RESPONSE.data;
  } catch (error) {
    console.error("Error fetching employer data:", error);
    throw new Error("Failed to fetch employer data.");
  }
}
/**
 * Saves new job data by updating the corresponding job record.
 *
 * @param TITLE The new title of the job.
 * @param DESCRIPTION The new description of the job.
 * @param APPLICATIONDEADLINE The new application deadline for the job.
 *        Can be null if no deadline is provided.
 * @param TASKS new tasks of the job.
 * @param SPECIALTY The new specialty of the job.
 * @returns A promise that resolves when the update is successful.
 * @throws {Error} If the validation key is missing, the job cannot be retrieved, or the update fails.
 */
export async function saveNewData(
  ID: number | null,
  TITLE: string,
  DESCRIPTION: string,
  TASKS: string[],
  APPLICATIONDEADLINE: Date | null,
  LANGUAGE: string,
  SPECIALTY: string[],
): Promise<void> {
  await axios.put(`http://localhost:4010/api/jobs/validation/${ID}`, {
    VALID_TITLE: TITLE,
    VALID_DESCRIPTION: DESCRIPTION,
    VALID_TASKS: TASKS,
    VALID_LANGUAGE: LANGUAGE,
    VALID_DEADLINE: APPLICATIONDEADLINE,
    VALID_SPECIALTY: SPECIALTY,
  });
}
