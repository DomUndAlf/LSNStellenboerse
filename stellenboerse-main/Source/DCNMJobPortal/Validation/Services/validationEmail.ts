import validator from "validator";
import { sendMail } from "./sendEmail";
import { IJob } from "../../Shared/interfaces";
import axios, { AxiosResponse } from "axios";
import path from "path";

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
/**
 * Sends a Validation Email that contains the Unique Link of a specific Job
 * @param jobid
 * @param newKey
 */
export async function sendValidationEmail(JOB_ID: number, NEW_KEY: string): Promise<void> {
  try {
    const RESPONSE: AxiosResponse<IJob> = await axios.get<IJob>(
      `http://localhost:${process.env.DBSERVER_PORT}/database/jobs/validation/${JOB_ID}`,
    );
    const VALIDATING_JOB: IJob = RESPONSE.data;

    if (!VALIDATING_JOB.Employer.sendValidationEmails) {
      console.log(`VALIDATION EMAIL FOR JOB #${JOB_ID} SKIPPED.`);
      return;
    }

    const EMAIL_TEXT: string = generateEmailText(NEW_KEY);
    const SUBJECT: string = `Validierungsemail für Job #${JOB_ID}`;
    const IS_PRODUCTION: boolean = process.env.MODE === "production";

    const EMAIL_LIST: string[] = IS_PRODUCTION
      ? VALIDATING_JOB.Employer.Emails
      : [process.env.SEND_ADDRESS as string];

    if (!EMAIL_LIST.every(isValidEmail)) {
      throw new Error("INVALID EMAIL ADDRESS DETECTED IN EMAIL LIST");
    }

    await sendMail(EMAIL_LIST, SUBJECT, EMAIL_TEXT);
    console.log(`VALIDATION EMAIL FOR JOB #${JOB_ID} SENT SUCCESSFULLY.`);
  } catch (ERROR) {
    console.error(`ERROR SENDING VALIDATION EMAIL FOR JOB #${JOB_ID}:`, ERROR);
    throw new Error(`FAILED TO SEND VALIDATION EMAIL FOR JOB #${JOB_ID}`);
  }
}

function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

function generateEmailText(validationKey: string): string {
  return `Sehr geehrte Damen und Herren,

diese Nachricht wurde automatisch von der DCNM-Stellenbörse des Leipzig Science Network (LSN) erstellt. Der Inhalt der folgenden Jobanzeige wurde mithilfe von Künstlicher Intelligenz verarbeitet, um Ihnen den Bearbeitungsprozess zu erleichtern.
Bitte überprüfen Sie die Angaben zur Jobanzeige über den folgenden Link. Dort können Sie den Inhalt anpassen oder bestätigen, dass alle Informationen korrekt sind:

Anzeige prüfen und bearbeiten: http://localhost:3010?key=${validationKey}

Nach Ihrer Bestätigung wird die Anzeige gespeichert und auf unserer Plattform veröffentlicht. Sollten Sie Fragen oder Anmerkungen haben, steht das LSN Ihnen jederzeit gerne zur Verfügung.
Vielen Dank für Ihre Unterstützung.

Mit freundlichen Grüßen

Ihr Leipzig Science Network `;
}
