import dotenv from "dotenv";
import cors from "cors";
import express, { Express } from "express";
import webAgentRouter from "./Routers/webAgentRouter";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import http from "http";
import YAML from "yamljs";
import { exitCodes } from "../Shared/exitCodes";
import path from "path";

dotenv.config({ path: "../.env" });

export const APP: Express = express();
APP.use(express.json());
APP.use(cors());

const SWAGGER_DOCS: JsonObject = YAML.load(path.resolve(__dirname, "./Config/swaggerDocs.yaml"));

// Documentation unter: http://localhost:4030/api-docs
APP.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCS));
APP.use("/webagent", webAgentRouter);

console.log("Server started on Port: " + process.env.WEBAGENT_PORT + " | WebAgent");
let webAgentServer: http.Server = APP.listen(Number(process.env.WEBAGENT_PORT) || 4030);

async function shutdown() {
  try {
    webAgentServer.close();
    process.exit(exitCodes.Success);
  } catch {
    console.error("Error during shutdown");
    process.exit(exitCodes.UncaughtFatalException);
  }
}

process.on("SIGINT", shutdown);
