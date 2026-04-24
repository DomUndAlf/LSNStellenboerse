import express, { Router } from "express";
import * as jobController from "../Controllers/jobController";
import * as locationController from "../Controllers/locationController";
import * as employerController from "../Controllers/employerController";
import * as websiteController from "../Controllers/websiteController";
import * as keywordController from "../Controllers/keywordController";
import * as cleanupController from "../Controllers/cleanupController";

const ROUTER: Router = express.Router();
ROUTER.post("/jobs/saveorupdate", jobController.saveOrUpdateJob);
ROUTER.post("/jobs/url", jobController.getJobIDByUrl);
ROUTER.get("/jobs", jobController.getAllJob);
ROUTER.get("/jobs/:jobid", jobController.getJob);
ROUTER.get("/jobs/website/:websiteid", jobController.getJobByWebsiteId);
ROUTER.get("/jobs/validation/:jobid", jobController.getJobForValidation);
ROUTER.put("/jobs/validation/:jobid", jobController.setValidationKey);
ROUTER.delete("/jobs/:jobid", jobController.deleteJob);
ROUTER.post("/jobs/urldelete", jobController.deleteJobByUrl);

ROUTER.post("/employers", employerController.postEmployer);
ROUTER.get("/employers", employerController.getAllEmployer);
ROUTER.get("/employers/active", employerController.getAllActiveEmployers);
ROUTER.get("/employers/:empid", employerController.getEmployer);
ROUTER.get("/employers/:empid/blacklist", employerController.getBlacklist);
ROUTER.get("/employers/:empid/whitelist", employerController.getWhitelist);
ROUTER.get("/employers/:empid/jobs/urls", employerController.getJobUrlsByEmployer);
ROUTER.put("/employers/:empid", employerController.putEmployer);
ROUTER.put("/employers/:empid/blacklist", employerController.putBlacklist);
ROUTER.put("/employers/:empid/blacklist/replace", employerController.replaceBlacklist);
ROUTER.put("/employers/:empid/whitelist", employerController.putWhitelist);
ROUTER.delete("/employers/:empid/whitelist", employerController.deleteWhitelistUrl);
ROUTER.delete("/employers/:empid/blacklist", employerController.deleteBlacklistUrl);
ROUTER.delete("/employers/:empid", employerController.deleteEmployer);

ROUTER.post("/locations", locationController.postLocation);
ROUTER.get("/locations", locationController.getAllLocation);
ROUTER.get("/locations/:locationid", locationController.getLocation);
ROUTER.put("/locations/:locationid", locationController.putLocation);
ROUTER.delete("/locations/:locationid", locationController.deleteLocation);

ROUTER.post("/websites", websiteController.postWebsite);
ROUTER.get("/websites", websiteController.getAllWebsite);
ROUTER.get("/websites/:websiteid", websiteController.getWebsite);
ROUTER.put("/websites/joburl", websiteController.getWebsiteByJobUrl);
ROUTER.put("/websites/:websiteid", websiteController.putWebsite);
ROUTER.post("/websites/upsertbyjoburl", websiteController.upsertWebsiteByJobUrl);

ROUTER.get("/keyword/:employerid", keywordController.getKeyWords);

ROUTER.post("/cleanup/orphaned", cleanupController.cleanupOrphanedRecords);
ROUTER.post("/cleanup/empty-jobs", cleanupController.cleanupEmptyJobs);

export default ROUTER;
