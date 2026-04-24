import express, { Router } from "express";
import {
  postParallelStart,
  postSerialStart,
  postScrapeAllEmployers,
  postScrapeAllActiveEmployers,
} from "../Controllers/webAgentController";

const ROUTER: Router = express.Router();
ROUTER.post("/serial/:empid", postSerialStart);
ROUTER.post("/parallel/:empid", postParallelStart);
ROUTER.post("/scrapeAll", postScrapeAllEmployers);
ROUTER.post("/scrapeAllActive", postScrapeAllActiveEmployers);

export default ROUTER;
