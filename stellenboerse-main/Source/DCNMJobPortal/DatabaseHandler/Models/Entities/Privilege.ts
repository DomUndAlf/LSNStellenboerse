import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Privilege{
  @PrimaryGeneratedColumn()
  KeyID: number;

  @Column({length: 64, nullable: false})
  PrivilegeKey: string;
}
