import axios, { AxiosResponse } from "axios";
import { IEmployer, IKeyword, ILocation } from "../Interfaces/types";

const EMPLOYERS_URL: string = "http://localhost:4010/api/employers";
const PRIVILEGE_URL: string = "http://localhost:4010/api/privileges";
const LOCATION_URL: string = "http://localhost:4010/api/locations";
const KEYWORD_URL: string = "http://localhost:4010/api/keyword";
const DISTINCT_NAME_URL: string = "http://localhost:4010/api/employers/distinct/name";

export async function getEmployers(): Promise<{FullName: string, ShortName: string}[]> {
  const RESPONSE: AxiosResponse = await axios.get(DISTINCT_NAME_URL);
  const RESULT: { employer_FullName: string, employer_ShortName: string }[] = await RESPONSE.data;
  const EMPLOYERS: {FullName: string, ShortName: string}[] = RESULT.map(function (body: { employer_FullName: string, employer_ShortName: string }) {
    return {FullName: body.employer_FullName, ShortName: body.employer_ShortName};
  });
  return EMPLOYERS;
}

export async function checkPrivilege(key: string): Promise<boolean> {
  if (!key) {
    return false;
  }
  try {
    await axios.get(PRIVILEGE_URL + "/" + key);
    return true;
  } catch {
    return false;
  }
}

export async function getOneEmployer(id: number): Promise<IEmployer> {
  const RESPONSE: AxiosResponse = await axios.get(EMPLOYERS_URL + "/" + id);
  const RESULT: IEmployer = await RESPONSE.data;
  return RESULT;
}

export async function getAllEmployers(): Promise<IEmployer[]> {
  const RESPONSE: AxiosResponse = await axios.get(EMPLOYERS_URL + "/" + "user");
  const RESULT: IEmployer[] = await RESPONSE.data;
  return RESULT;
}

export async function getAllLocations(): Promise<ILocation[]> {
  const RESPONSE: AxiosResponse = await axios.get(LOCATION_URL);
  const RESULT: ILocation[] = await RESPONSE.data;
  return RESULT;
}

export async function getOneLocation(locationid: number) {
  let response: AxiosResponse = await axios.get(LOCATION_URL + "/" + locationid);
  let receivedLocation: ILocation = response.data;
  return receivedLocation;
}

export async function getKeyword(employerid: number) {
  let response: AxiosResponse = await axios.get(KEYWORD_URL + "/" + employerid);
  let receivedKeyword: IKeyword = response.data;
  return receivedKeyword;
}

export async function saveEmployer(employer: IEmployer) {
  await axios.put(EMPLOYERS_URL + "/" + employer.EmployerID, {
    new_shortname: employer.ShortName,
    new_fullname: employer.FullName,
    new_website: employer.Website,
    new_emails: employer.Emails,
    new_tovalidate: employer.toValidate,
    new_isEmbedded: employer.isEmbedded,
    new_isactive: employer.isActive,
    new_contactPerson: employer.ContactPerson,
    new_showContact: employer.showContact,
    new_sendValidationEmails: employer.sendValidationEmails,
  });
}

export async function saveLocation(location: ILocation) {
  await axios.put(LOCATION_URL + "/" + location.LocationID, {
    new_street: location.Street ?? "",
    new_housenumber: location.HouseNumber ?? "",
    new_postalcode: location.PostalCode ?? "",
    new_city: location.City,
  });
}

export async function createEmployer(employer: IEmployer) {
  await axios.post(EMPLOYERS_URL, {
    shortname: employer.ShortName,
    fullname: employer.FullName,
    website: employer.Website,
    locationid: employer.LocationID,
    emails: employer.Emails,
    contactPerson: employer.ContactPerson,
    showContact: employer.showContact,
    sendValidationEmails: employer.sendValidationEmails,
  });
}

export async function createLocation(location: ILocation) {
  await axios.post(LOCATION_URL, {
    street: location.Street ?? "",
    housenumber: location.HouseNumber ?? "",
    postalcode: location.PostalCode ?? "",
    city: location.City,
  });
}

export async function createNewKeyword(
  newkeyword: string,
  newemployerid: number,
  newlocationid: number,
) {
  await axios.post(KEYWORD_URL, {
    employerid: newemployerid,
    locationid: newlocationid,
    keyword: newkeyword,
  });
}

export async function deleteEmployer(id: number) {
  await axios.delete(EMPLOYERS_URL + "/" + id);
}
