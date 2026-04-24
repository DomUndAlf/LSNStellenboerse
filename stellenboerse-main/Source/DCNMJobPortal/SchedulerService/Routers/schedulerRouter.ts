import express, { Router } from "express";
import { startScraperSchedule } from "../Controllers/schedulerController";

const ROUTER: Router = express.Router();
ROUTER.post("/start", startScraperSchedule);

export default ROUTER;

/**
 * @swagger
 * /scheduler/start:
 *   post:
 *     summary: Start the scraper scheduler
 *     description: This endpoint starts the scraper scheduler to initiate scraping at regular intervals.
 *     tags:
 *       - Scheduler Service
 *     responses:
 *       200:
 *         description: Scheduler started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Scheduler started successfully
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error!
 *                 details:
 *                   type: string
 *                   example: "An unknown error occurred"
 */
