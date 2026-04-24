import dotenv from "dotenv";
import cors from "cors";
import express, { Express } from "express";
import scraperRouter from "./Routers/schedulerRouter";
import swaggerUi from "swagger-ui-express";
import SWAGGER_DOCS from "./swaggerOptions";
import http from "http";
import { scheduleScraper } from "./Services/scraperScheduler";
import { cleanupOrphanedRecords, cleanupEmptyJobs } from "./Services/cleanupScheduler";
import { exitCodes } from "../Shared/exitCodes";

dotenv.config({ path: "../.env" });

const APP: Express = express();
APP.use(express.json());
APP.use(cors());

APP.use("/scraper", scraperRouter);
// Documentation at: http://localhost:4050/api-docs
APP.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCS));

const PORT: number = Number(process.env.SCHEDULER_PORT) || 4050;
let scraperServer: http.Server = APP.listen(PORT, async function () {
  console.log(`Scraper Service started on Port: ${PORT}`);
  
  // Run cleanup on startup
  await cleanupOrphanedRecords();
  await cleanupEmptyJobs();
  
  // Schedule daily cleanup at 3:00 AM
  scheduleCleanup();
  
  // Start regular scraper
  await scheduleScraper();
});

/**
 * Schedules daily cleanup of orphaned records at 3:00 AM
 */
function scheduleCleanup() {
  const now = new Date();
  const scheduledTime = new Date(now);
  scheduledTime.setHours(3, 0, 0, 0);
  
  // If 3 AM has already passed today, schedule for tomorrow
  if (now >= scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilCleanup = scheduledTime.getTime() - now.getTime();
  
  setTimeout(async function() {
    await cleanupOrphanedRecords();
    await cleanupEmptyJobs();
    // Schedule next cleanup in 24 hours
    setInterval(async function() {
      await cleanupOrphanedRecords();
      await cleanupEmptyJobs();
    }, 24 * 60 * 60 * 1000);
  }, timeUntilCleanup);
  
  console.log(`Daily cleanup scheduled for ${scheduledTime.toLocaleString()}`);
}

async function shutdown() {
  try {
    scraperServer.close();
    process.exit(exitCodes.Success);
  } catch {
    console.error("Error during shutdown");
    process.exit(exitCodes.UncaughtFatalException);
  }
}

process.on("SIGINT", shutdown);
