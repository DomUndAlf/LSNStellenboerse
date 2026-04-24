import dotenv from "dotenv";
import cors from "cors";
import express, { Express } from "express";
import validationRouter from "./Routers/validationRouter";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import http from "http";
import { exitCodes } from "../Shared/exitCodes";
import YAML from "yamljs";
import path from "path";

dotenv.config({ path: "../.env" });

export const APP: Express = express();
APP.use(express.json());
APP.use(cors());
APP.use("/validation", validationRouter);

// Documentation unter: http://localhost:4020/api-docs
const SWAGGER_DOCS: JsonObject = YAML.load(path.resolve(__dirname, "./Config/swaggerDocs.yaml"));
APP.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCS));

let validationServer: http.Server;

validationServer = APP.listen(Number(process.env.VALIDATION_PORT) || 4020);
console.log("Server started on Port: " + process.env.VALIDATION_PORT + " | Validation");

async function shutdown() {
  try {
    validationServer.close();
    process.exit(exitCodes.Success);
  } catch {
    console.error("Error during shutdown");
    process.exit(exitCodes.UncaughtFatalException);
  }
}

process.on("SIGINT", shutdown);
