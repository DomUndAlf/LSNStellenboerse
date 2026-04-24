import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const DATA_SOURCE: DataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [
    path.resolve(__dirname, "../Models/Entities/*.ts"),
    path.resolve(__dirname, "../Models/Entities/*.js"),
  ],
  migrations: [
    path.resolve(__dirname, "./Migrations/*.ts"),
    path.resolve(__dirname, "./Migrations/*.js"),
  ],
  timezone: "Z",
});
