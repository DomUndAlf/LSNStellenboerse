import cors from "cors";
import express, { Express } from "express";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import http from "http";
import { exitCodes } from "../Shared/exitCodes";
import YAML from "yamljs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import aiRoute from "./Routers/aiRouter";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY ist not defined in the .env file");
}
const SWAGGER_DOCS: JsonObject = YAML.load(path.resolve(__dirname, "./Config/swaggerDocs.yaml"));

const APP: Express = express();
APP.use(express.json());
APP.use(cors());

// Documentation unter: http://localhost:4040/api-docs
APP.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCS));
APP.use("/aiagent", aiRoute);

let aiServer: http.Server = APP.listen(Number(process.env.AI_PORT) || 4040, function () {
  console.log("Server started on Port: " + process.env.AI_PORT + " | AI Server");
});

async function shutdown() {
  try {
    aiServer.close();
    process.exit(exitCodes.Success);
  } catch {
    console.error("Error during shutdown");
    process.exit(exitCodes.UncaughtFatalException);
  }
}

process.on("SIGINT", shutdown);
