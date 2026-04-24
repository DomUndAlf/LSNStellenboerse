/* eslint-disable no-restricted-syntax */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from "typeorm";
import { Job } from "./Job";
import { EmployerKeywordLocation } from "./EmployerKeywordLocation";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  LocationID: number;

  @Column({ length: 225, nullable: true })
  Street: string | null;

  @Column({ length: 15, nullable: true })
  HouseNumber: string | null;

  @Column({ length: 5, nullable: true })
  PostalCode: string | null;

  @Column({ length: 100, nullable: true })
  City: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @OneToMany(() => Job, (Jobs) => Jobs.Location)
  Jobs: Job[];

  @OneToMany(() => EmployerKeywordLocation, (keywordLocation) => keywordLocation.Location)
  EmployerKeywordLocations: EmployerKeywordLocation[];
}
