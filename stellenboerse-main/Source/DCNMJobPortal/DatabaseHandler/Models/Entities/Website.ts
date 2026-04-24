/* eslint-disable no-restricted-syntax */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Job } from "./Job";

@Entity()
export class Website {
  @PrimaryGeneratedColumn()
  WebsiteID: number;

  @Column("text")
  JobURL: string;

  @Column("text")
  ETag: string;

  @Column("text")
  Hash: string;

  @Column("text")
  LastModified: string;

  @OneToMany(() => Job, (Jobs) => Jobs.Website)
  Jobs: Job[];
}
