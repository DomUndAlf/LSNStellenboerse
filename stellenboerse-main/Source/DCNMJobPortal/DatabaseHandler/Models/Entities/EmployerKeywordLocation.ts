/* eslint-disable no-restricted-syntax */
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Employer } from "./Employer";
import { Location } from "./Location";

@Entity()
export class EmployerKeywordLocation {
  @PrimaryGeneratedColumn()
  ID: number;

  @ManyToOne(() => Employer, (employer) => employer.EmployerKeywordLocations)
  @JoinColumn({ name: "EmployerID" })
  Employer: Employer;

  @ManyToOne(() => Location, (location) => location.EmployerKeywordLocations)
  @JoinColumn({ name: "LocationID" })
  Location: Location;

  @Column({ length: 511 })
  Keyword: string;
}
