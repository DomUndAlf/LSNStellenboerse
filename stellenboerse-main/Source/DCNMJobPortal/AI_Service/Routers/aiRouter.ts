import express, { Router } from "express";
import * as aiControllers from "../Controllers/aiController";

const AIROUTER: Router = express.Router();

AIROUTER.post("/extract", aiControllers.aiController);
AIROUTER.post("/pdf", aiControllers.pdfController);

AIROUTER.post("/classify", aiControllers.classifyUrls);
AIROUTER.post("/embedded/scrape", aiControllers.scrapeEmbedded);

export default AIROUTER;
