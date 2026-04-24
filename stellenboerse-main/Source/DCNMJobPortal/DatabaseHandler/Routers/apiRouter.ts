import express, { Router } from "express";
import * as jobController from "../Controllers/jobController";
import * as employerController from "../Controllers/employerController";
import * as locationController from "../Controllers/locationController";
import * as privilegeController from "../Controllers/privilegeController";
import { RateLimitRequestHandler, rateLimit } from "express-rate-limit";
import * as keywordController from "../Controllers/keywordController";

const LIMITER: RateLimitRequestHandler = rateLimit({
  windowMs: 1000,
  limit: 10,
});

const ROUTER: Router = express.Router();

ROUTER.post("/jobs", jobController.mainFilter);
ROUTER.get("/jobs/:jobid", jobController.getJob);
ROUTER.get("/jobs/validation/:key", LIMITER, jobController.getJobByValidationKey);
ROUTER.put("/jobs/validation/:jobid", jobController.validateJob);
ROUTER.get("/employers/user", employerController.getAllEmployerForUser);
ROUTER.get("/employers", employerController.getAllEmployer);
ROUTER.get("/employers/distinct/name", employerController.getAllDistinctEmployerName);
ROUTER.get("/employers/:empid", employerController.getEmployer);
ROUTER.put("/employers/:empid", employerController.putEmployer);
ROUTER.post("/employers", employerController.postEmployer);
ROUTER.get("/locations", locationController.getAllLocation);
ROUTER.get("/locations/:locationid", locationController.getLocation);
ROUTER.put("/locations/:locationid", locationController.putLocation);
ROUTER.post("/locations/", locationController.postLocation);
ROUTER.get("/privileges/:key", privilegeController.existsPrivilege);
ROUTER.get("/employer/:empid/tovalidate", employerController.getEmployerValidationStatus);
ROUTER.get("/keyword/:employerid", keywordController.getKeyWords);
ROUTER.post("/keyword", keywordController.postKeyword);
ROUTER.get("/tool/jobs", jobController.getAllJobsForUser);
ROUTER.delete("/employers/:empid", employerController.deleteEmployerForUser);
// Expose job deletion via /api to mirror employer tool behavior
ROUTER.delete("/jobs/:jobid", jobController.deleteJob);

// Health check endpoint for Docker healthcheck
ROUTER.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "database_handler" });
});

export default ROUTER;
