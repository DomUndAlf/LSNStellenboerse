import express, { Router } from "express";
import { postEmail } from "../Controllers/validationController";

const VALROUTER: Router = express.Router();
VALROUTER.post("/email/:jobid", postEmail);

export default VALROUTER;
