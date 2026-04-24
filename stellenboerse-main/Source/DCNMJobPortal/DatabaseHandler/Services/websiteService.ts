import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import { Website } from "../Models/Entities/Website";
import { Repository } from "typeorm";

export async function createWebsite(
  joburl: string,
  etag: string,
  hash: string,
  lastmodified: string,
): Promise<number> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const NEW_WEBSITE: Website = WEBSITE_REPO.create({
    JobURL: joburl,
    ETag: etag,
    Hash: hash,
    LastModified: lastmodified,
  });

  const SAVED_WEBSITE: Website = await WEBSITE_REPO.save(NEW_WEBSITE);
  return SAVED_WEBSITE.WebsiteID;
}

export async function readAllWebsite(): Promise<Website[]> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  return await WEBSITE_REPO.find();
}

export async function readWebsite(websiteid: number): Promise<Website | null> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  return await WEBSITE_REPO.findOneBy({ WebsiteID: websiteid });
}

export async function readWebsiteByJobUrl(joburl: string): Promise<Website | null> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  return await WEBSITE_REPO.findOneBy({ JobURL: joburl });
}

export async function updateWebsite(
  websiteid: number,
  new_joburl: string,
  new_etag: string,
  new_hash: string,
  new_lastmodified: string,
): Promise<boolean> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  const UPDATING_WEBSITE: Website | null = await readWebsite(websiteid);
  if (!UPDATING_WEBSITE) {
    return false;
  }
  UPDATING_WEBSITE.JobURL = new_joburl;
  UPDATING_WEBSITE.ETag = new_etag;
  UPDATING_WEBSITE.Hash = new_hash;
  UPDATING_WEBSITE.LastModified = new_lastmodified;

  await WEBSITE_REPO.save(UPDATING_WEBSITE);
  return true;
}

export async function upsertWebsiteByJobUrl(
  joburl: string,
  etag: string,
  lastmodified: string,
  hash: string,
): Promise<number> {
  const WEBSITE_REPO: Repository<Website> = DATA_SOURCE.getRepository(Website);
  let website: Website | null;

  console.log(
    `[upsertWebsiteByJobUrl] Attempting to find or create website entry for URL: ${joburl}`,
  );

  website = await WEBSITE_REPO.findOneBy({ JobURL: joburl });

  if (website) {
    console.log(
      `[upsertWebsiteByJobUrl] Found existing website entry with ID: ${website.WebsiteID}`,
    );
    website.ETag = etag || "";
    website.LastModified = lastmodified || "";
    website.Hash = hash || "";
  } else {
    console.log(
      `[upsertWebsiteByJobUrl] No existing website found for URL: ${joburl}. Creating new entry.`,
    );
    website = WEBSITE_REPO.create({
      JobURL: joburl,
      ETag: etag || "",
      LastModified: lastmodified || "",
      Hash: hash || "",
    });
  }

  const RESULT: Website = await WEBSITE_REPO.save(website);
  console.log(
    `[upsertWebsiteByJobUrl] Website entry saved successfully. Returned WebsiteID: ${RESULT.WebsiteID}`,
  );

  return RESULT.WebsiteID;
}
