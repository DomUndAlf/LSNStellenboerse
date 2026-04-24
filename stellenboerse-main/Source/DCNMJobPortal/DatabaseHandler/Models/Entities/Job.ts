/* eslint-disable no-restricted-syntax */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Employer } from "./Employer";
import { Location } from "./Location";
import { Website } from "./Website";

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  JobID: number;

  @Column()
  EmployerID: number;

  @Column()
  LocationID: number;

  @Column()
  WebsiteID: number;

  @Column({ default: false })
  isValid: boolean;

  @Column({ length: 255 })
  Title: string;

  @Column("text", {nullable: true})
  Description: string;

  @Column("json", {nullable: true})
  Tasks: string[];

  @Column("json", {nullable: true})
  Specialty: string[];

  @Column({ length: 24, nullable: true, default: null })
  ValidationKey: string;

  @Column({ nullable: true, default: null })
  ApplicationDeadline: Date;

  @Column({ length: 2 })
  Language: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @ManyToOne(() => Employer, (Employer) => Employer.Jobs, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "EmployerID" })
  Employer: Employer;

  @ManyToOne(() => Location, (Location) => Location.Jobs, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "LocationID" })
  Location: Location;

  @ManyToOne(() => Website, (Website) => Website.Jobs, { nullable: true })
  @JoinColumn({ name: "WebsiteID" })
  Website: Website;
}
