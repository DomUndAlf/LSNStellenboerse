export interface IEmployer {
  EmployerID: number;
  ShortName: string;
  FullName: string;
  Website: string;
  Emails: string[];
  created_at: Date;
  Jobs: IJob[];
  LocationID: number;
  isEmbedded: boolean;
  toValidate: boolean;
  isActive: boolean;
  ContactPerson: string;
  showContact: boolean;
  sendValidationEmails: boolean;
}

export interface IKeywordForEmployer {
  IKeywordForEmployerID: number;
  EmployerID: number;
  Location: { LocationID: number };
  Keyword: string;
}

export interface IJob {
  JobID: number;
  EmployerID: number;
  LocationID: number;
  WebsiteID: number;
  Title: string;
  Description: string;
  Tasks: string[];
  ApplicationDeadline: Date;
  ValidationKey: string;
  Language: string;
  Specialty: string[];
  created_at: Date;
  Employer: IEmployer;
  Location: ILocation;
  Website: IWebsite;
}

export interface IWebsite {
  WebsiteID: number;
  JobURL: string;
  ETag: string;
  Hash: string;
  LastModified: string;
  Jobs: IJob[];
}

export interface ILocation {
  LocationID: number;
  Street: string | null;
  HouseNumber: string | null;
  PostalCode: string | null;
  City: string;
  created_at: Date;
  Jobs: IJob[];
}
