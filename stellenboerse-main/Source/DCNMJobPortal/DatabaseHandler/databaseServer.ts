import dotenv from "dotenv";
import cors from "cors";
import express, { Express } from "express";
import databaseRouter from "./Routers/databaseRouter";
import apiRouter from "./Routers/apiRouter";
import http from "http";
import { DATA_SOURCE } from "./Config/data-source";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import { exitCodes } from "../Shared/exitCodes";
import { httpStatus } from "../Shared/httpStatus";
import YAML from "yamljs";
import path from "path";

dotenv.config({ path: "../.env" });

export const APP: Express = express();
APP.use(express.json());
APP.use(cors());

// Middleware: Check if DataSource is initialized
// Skip this check for health endpoint to allow Docker healthchecks
APP.use((req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }
  if (!DATA_SOURCE.isInitialized) {
    return res.status(httpStatus.SERVICE_UNAVAILABLE).json({
      error: "Database not initialized",
      message: "Database connection is not available. Please check database configuration."
    });
  }
  next();
});

APP.use("/api", apiRouter);
APP.use("/database", databaseRouter);

// Documentation unter: http://localhost:4010/api-docs
const SWAGGER_DOCS: JsonObject = YAML.load(path.resolve(__dirname, "./Config/swaggerDocs.yaml"));
APP.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCS));

let db_server: http.Server;

export async function start() {
  try {
    await DATA_SOURCE.initialize();
    console.log("Database connection established successfully");

    // Start server only after successful DB initialization
    db_server = APP.listen(Number(process.env.DBSERVER_PORT) || 4010);
    console.log("Server started on Port:", process.env.DBSERVER_PORT, "| Database");
  } catch (err) {
    console.error("Error during Data Source initialization:", err.message);
    console.error("Server will not start without database connection");
    process.exit(exitCodes.UncaughtFatalException);
  }
}

export async function shutdown() {
  try {
    await DATA_SOURCE.destroy();
    db_server.close();
    console.log("Data Source has been closed!");
    process.exit(exitCodes.Success);
  } catch (err) {
    console.error(err, "Error during the Data Source shutdown!");
    process.exit(exitCodes.UncaughtFatalException);
  }
}

start();
process.on("SIGINT", shutdown);
