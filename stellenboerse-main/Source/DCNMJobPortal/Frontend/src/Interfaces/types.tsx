export interface IJob {
  JobID: number;
  Title: string;
  Description: string;
  Website: IWebsite;
  Location: ILocation;
  Employer: IEmployer;
  ApplicationDeadline?: Date;
  Language: string;
  Tasks: string[];
  created_at: Date;
  Specialty: string[];
}

export interface IWebsite {
  WebsiteID: number;
  JobURL: string;
  ETag: string;
  Hash: string;
  LastModified: string;
}

export interface ILocation {
  LocationID: number;
  Street: string | null;
  HouseNumber: string | null;
  PostalCode: string | null;
  City: string;
}

export interface IEmployer {
  EmployerID: number;
  LocationID: number;
  ShortName: string;
  FullName: string;
  Website: string;
  Emails: string[];
  created_at: Date;
  toValidate: boolean;
  isEmbedded: boolean;
  isActive: boolean;
  ContactPerson: string;
  showContact: boolean;
  sendValidationEmails: boolean;
}

export interface IFilterData {
  userSpecialty: string;
  userLanguage: string;
  userEmployernames: string[];
  userSearchterms: string[];
  userSortMode: string;
  userSortOrder: string;
  userPage: number;
}

export interface IKeyword {
  ID: number;
  Employer: IEmployer;
  Location: ILocation;
  Keyword: string;
}

export interface IFilterResponse {
  jobs: IJob[];
  count: number;
}
