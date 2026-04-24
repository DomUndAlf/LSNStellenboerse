/* eslint-disable no-restricted-syntax */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Job } from "./Job";
import { EmployerKeywordLocation } from "./EmployerKeywordLocation";

@Entity()
export class Employer {
  @PrimaryGeneratedColumn()
  EmployerID: number;

  @Column()
  LocationID: number;

  @Column({ length: 255 })
  ShortName: string;

  @Column({ length: 255, nullable: true })
  FullName: string;

  @Column({ length: 500, nullable: true })
  Website: string;

  @Column("simple-json",{ nullable: true })
  Emails: string[];

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @OneToMany(() => Job, (job) => job.Employer)
  Jobs: Job[];

  @Column("simple-json", { nullable: true })
  Blacklist: string[];

  @Column("simple-json", { nullable: true })
  Whitelist: string[];

  @Column({ default: false })
  isEmbedded: boolean;
  
  @Column({ default: true })
  toValidate: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ length: 255, nullable: true })
  ContactPerson: string;

  @Column({ default: false })
  showContact: boolean;

  @Column({ default: true })
  sendValidationEmails: boolean;
  
  @OneToMany(() => EmployerKeywordLocation, (keywordLocation) => keywordLocation.Employer)
  EmployerKeywordLocations: EmployerKeywordLocation[];
}
