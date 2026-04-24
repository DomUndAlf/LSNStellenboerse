import axios from "axios";

/**
 * Adds a URL to the blacklist for a specific employer.
 * @param EMPLOYER_ID - The employer ID.
 * @param url - The URL to add to the blacklist.
 */
export async function addToBlacklist(EMPLOYER_ID: number, url: string): Promise<void> {
  try {
    await axios.put(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/blacklist`,
      { urls: [url] },
    );
    console.log(`URL added to the blacklist: ${url}`);
  } catch (error) {
    console.error(`Error adding URL to the blacklist: ${url}`, error.message);
  }
}

/**
 * Adds a URL to the whitelist for a specific employer.
 * @param EMPLOYER_ID - The employer ID.
 * @param url - The URL to add to the whitelist.
 */
export async function addToWhitelist(EMPLOYER_ID: number, url: string): Promise<void> {
  try {
    await axios.put(
      `http://localhost:${process.env.DBSERVER_PORT}/database/employers/${EMPLOYER_ID}/whitelist`,
      { urls: [url] },
    );
  } catch (error) {
    console.error(`Error adding URL to whitelist:`, error.message);
  }
}

/**
 * Determines if a URL is relevant based on specific criteria.
 * @param URL - The URL to check.
 * @returns True if the URL is relevant, false otherwise.
 */
export function isRelevantUrl(URL: string): boolean {
  if (URL.includes("@")) {
    return false;
  }
  const EXCLUDED_EXTENSION: string[] = [".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif"];
  if (
    EXCLUDED_EXTENSION.some(function (ext: string): boolean {
      return URL.endsWith(ext);
    })
  ) {
    return false;
  }
  if (URL.startsWith("#") || URL.startsWith("javascript:") || URL.startsWith("mailto:")) {
    return false;
  }
  return true;
}

/**
 * Determines if a URL should be treated as a PDF resource even if it does not explicitly end with ".pdf".
 * Handles common viewer patterns such as ".pdf/view" or ".pdf?download=1".
 * Also handles dynamic download URLs like "download.php" that typically serve PDFs.
 *
 * @param URL - The URL to inspect.
 * @returns True if the URL points to a PDF resource, false otherwise.
 */
export function isPdfLikeUrl(URL: string): boolean {
  const NORMALIZED_URL: string = URL.toLowerCase();
  const PDF_PATTERN: RegExp = /\.pdf($|[?#/])/;
  if (PDF_PATTERN.test(NORMALIZED_URL)) {
    return true;
  }
  // Dynamic download URLs that typically serve PDFs (e.g., wcms.itz.uni-halle.de/download.php)
  if (NORMALIZED_URL.includes("download.php") || NORMALIZED_URL.includes("/download?")) {
    return true;
  }
  return false;
}

/**
 * Determines if a URL is potentially job-related based on keywords.
 * @param URL - The URL to check.
 * @returns True if the URL is likely job-related, false otherwise.
 */
export function isPotentialJobUrl(URL: string): boolean {
  const JOB_KEYWORDS: string[] = [
    "job",
    "career",
    "karriere",
    "stellen",
    "vacancies",
    "jobs",
    "careers",
    "vacancy",
    "jobposting",
    "ausschreibung",
    "stellenangebote",
    "umantis",
    "dozentensuche",
    "dozentengesuche",
    "dozent",
    "abschlussarbeit",
    "praktikum",
    "hilfskraft",
    "hiwi",
    "lehrbeauftragte",
    "lehrauftrag",
  ];
  const EXCLUDED_KEYWORDS: string[] = [
    "team",
    "about-us",
    "about",
    "contact",
    "research",
    "environment",
    "services",
    "profil",
    "opportunities",
    "newsletter",
    "impressum",
    "datenschutz",
    "overview",
    "hochschulleben",
    "events",
    "publications",
    "publikationen",
    "institute",
  ];
  // Compound words that contain excluded keywords but should NOT be excluded
  const ALLOWED_COMPOUNDS: string[] = [
    "dozentensuche",
    "dozentengesuche",
    "jobsuche",
    "stellensuche",
  ];
  const URL_LOWER: string = URL.toLowerCase();
  const HAS_JOB_KEYWORD: boolean = JOB_KEYWORDS.some(function (keyword: string): boolean {
    return URL_LOWER.includes(keyword);
  });
  // Check if URL contains an allowed compound word (these override excluded keywords)
  const HAS_ALLOWED_COMPOUND: boolean = ALLOWED_COMPOUNDS.some(function (compound: string): boolean {
    return URL_LOWER.includes(compound);
  });
  if (HAS_ALLOWED_COMPOUND) {
    return true;
  }
  const HAS_EXCLUDED_KEYWORD: boolean = EXCLUDED_KEYWORDS.some(function (keyword: string): boolean {
    return URL_LOWER.includes(keyword);
  });
  return HAS_JOB_KEYWORD && !HAS_EXCLUDED_KEYWORD;
}

/**
 * Checks if the page content indicates an overview/listing page rather than a specific job posting.
 * Overview pages typically contain phrases indicating multiple jobs or empty job lists.
 * IMPORTANT: Does NOT use content length as a criterion - single jobs on main pages can be short!
 * @param content - The text content of the page.
 * @returns True if the page appears to be an overview page, false otherwise.
 */
export function isOverviewPage(content: string): boolean {
  const contentLower: string = content.toLowerCase();
  
  // First check: If the page has clear job-specific content, it's NOT an overview page
  // These are strong indicators of a single job posting
  const SINGLE_JOB_INDICATORS: string[] = [
    "ihre aufgaben",
    "ihr profil", 
    "wir bieten",
    "was sie mitbringen",
    "was du mitbringst",
    "anforderungsprofil",
    "stellenbeschreibung",
    "aufgabengebiet",
    "your responsibilities",
    "your profile",
    "we offer",
    "job description",
    "requirements:",
    "qualifications:",
    "bewerbungsfrist:",
    "application deadline:",
    "kennziffer:",
    "reference number:",
    "ihre bewerbung soll enthalten",
    "ihre bewerbung sollte enthalten",
    "bewerbungsunterlagen",
    "bitte bewerben sie sich",
    "praktikum im",
    "pflichtpraktik",
    "please apply",
    "apply now",
    "jetzt bewerben",
  ];
  
  // Count how many single-job indicators are present
  let singleJobIndicatorCount: number = 0;
  for (const indicator of SINGLE_JOB_INDICATORS) {
    if (contentLower.includes(indicator)) {
      singleJobIndicatorCount++;
    }
  }
  
  // If we have 2+ single-job indicators, this is definitely a job posting, not an overview
  if (singleJobIndicatorCount >= 2) {
    return false;
  }
  
  // Phrases that indicate a job listing/overview page (with NO actual job content)
  const OVERVIEW_PHRASES: string[] = [
    "derzeit gibt es",
    "folgende ausschreibungen",
    "folgende stellenangebote",
    "keine stellen verfügbar",
    "keine stellenangebote",
    "keine nachrichten verfügbar",
    "derzeit keine offenen stellen",
    "currently no open positions",
    "no positions available",
    "keine aktuellen ausschreibungen",
    "currently, we have no job openings",
    "we have no job openings",
    "no job openings at this time",
    "no current job openings",
    "no open positions at this time",
    "we currently have no open positions",
    "there are currently no vacancies",
    "no vacancies at the moment",
  ];
  
  for (const phrase of OVERVIEW_PHRASES) {
    if (contentLower.includes(phrase)) {
      return true;
    }
  }
  
  // Check for overview page patterns: page lists multiple job titles without job content
  // This is indicated by having "unsere stellenangebote"/"aktuelle stellenangebote" 
  // but WITHOUT the single job indicators
  const LISTING_HEADERS: string[] = [
    "unsere stellenangebote",
    "aktuelle stellenangebote",
    "offene stellen",
    "alle stellenangebote",
    "current job openings",
    "available positions",
    "open positions",
    "job listings",
    "browse our jobs",
  ];
  
  const hasListingHeader: boolean = LISTING_HEADERS.some(header => contentLower.includes(header));
  
  // If it has a listing header but NO single-job indicators, it's an overview page
  if (hasListingHeader && singleJobIndicatorCount === 0) {
    return true;
  }
  
  return false;
}

/**
 * Calculates a score based on job-related and general content keywords in the page content.
 * @param content - The content of the page.
 * @returns The calculated score, where a higher score indicates higher job relevance.
 */
export function calculateContentScore(content: string): number {
  const JOB_RELATED_KEYWORDS: string[] = [
    "Anforderungen",
    "Bewerbung",
    "Vollzeit",
    "Teilzeit",
    "Position",
    "Aufgaben",
    "Verantwortlichkeiten",
    "Stelle",
    "Wir bieten",
    "Ihr Profil",
    "Was Du bei uns tust",
    "Was Du mitbringst",
    "Was Du erwarten kannst",
    "Was Sie bei uns tun",
    "Was Sie mitbringen",
    "Was Sie erwarten können",
    "Was bieten wir?",
    "Angebot und Voraussetzungen",
    "Bewerbungsfrist",
    "Wir bieten Ihnen",
    "Ihre Aufgaben",
    "Unsere Anforderungen",
    "Term of Appointment",
    "Application",
    "PhD positions",
    // Dozenten/Lehrbeauftragte keywords
    "Lehrbeauftragte",
    "Lehrauftragsangebote",
    "Lehrauftrag",
    "nebenberuflich tätige",
    "Bedarf an",
    "Dozentensuche",
    "Dozentengesuche",
    "Honorarprofessur",
  ];
  const GENERAL_KEYWORDS: string[] = [
    "Forschung",
    "Umwelt",
    "Themenbereich",
    "Projekt",
    "Analyse",
    "Studie",
    "Publikationen",
    "Ausgeschriebene Professuren",
  ];

  let score: number = 0;

  JOB_RELATED_KEYWORDS.forEach(function (keyword: string): void {
    if (content.includes(keyword)) {
      score += 1;
    }
  });

  GENERAL_KEYWORDS.forEach(function (keyword: string): void {
    if (content.includes(keyword)) {
      score -= 1;
    }
  });

  return score;
}

/**
 * Determines if a URL is a known general (non-job-related) URL based on exact and partial matches.
 * @param URL - The URL to check.
 * @returns True if the URL is known as general, false otherwise.
 */
export function isKnownGeneralUrl(URL: string): boolean {
  const EXACT_MATCH_URLS: string[] = [
    "https://www.jobs-studentenwerke.de/",
    "https://www.fraunhofer.de/de/jobs-und-karriere.html",
    "https://www.dbfz.de/en/career/job-offers",
    "https://www.dbfz.de/karriere/studentische-hilfskraefte",
    "https://www.sprind.org/de/jobs/",
    "https://www.dubnow.de/rechtes-menu/ausschreibungen/",
    "https://www.iom-leipzig.de/karriere/",
    "https://www.hzdr.de/db/cms?pnid=440",
    "https://www.ipk-gatersleben.de/en/",
    "https://www.ipk-gatersleben.de/karriere/stellenangebote",
    "https://www.uni-jena.de/en/122166/job-market",
    "https://www.med.ovgu.de/karriere/stellenangebote/%c3%84rztliches+personal.html",
    "https://www.med.ovgu.de/karriere/stellenangebote/%c3%84rztliches+personal.html",
    "https://www.med.ovgu.de/karriere/stellenangebote/pflege+und+funktionsdienst.html",
    "https://www.med.ovgu.de/karriere/stellenangebote/verwaltung_+it+_+management-p-23454.html",
    "https://www.studentenwerk-leipzig.de/jobs-und-karriere",
    "https://www.leibniz-gwzo.de/de/institut/stellenangebote/",
    "https://www.ba-leipzig.de/die-akademie/stellenangebote",
    // Note: HS Merseburg neuigkeiten removed - job postings are under /neuigkeiten/details/
    "https://www.hs-merseburg.de/arbeiten/arbeitsgebiete/hochschulleben/",
  ];

  const PARTIAL_MATCH_KEYWORDS: string[] = [
    "/impressum",
    "/datenschutz",
    "/privacy",
    "/terms",
    "/about",
    "/contact",
    "/overview",
    "/opportunities",
    "/linguistics",
    "/positions-available",
    "/genetics",
    // Note: /news and /neuigkeiten are intentionally NOT here - they may contain job postings
    // in subpaths like /neuigkeiten/details/professur-xyz
    "/hochschulleben",
    "/arbeitsgebiete/hochschulleben",
    "/events",
    "/publications",
    "/publikationen",
    "/institute",
    "/suche",
    "/search",
    "/working-at-iom",
    "/veranstaltungen",
    "/!joblist?",
    "!bewerbungs1?",
    "/arbeiten-an-der-tud",
    "/Pflege-Therapie-Soziales-jobs",
    "/working-at-the-university/job-offers",
    "/arbeiten-an-der-universitaet/ausbildung",
    "/professorenstellen/rss",
    "/karriereweg-professur",
    "/www.ovgu.de/-p",
    "/arbeitsgebiete/professur",
    "/arbeitsgebiete/lehre-und-forschung",
    "/h2-alumni",
    "News&tx_news",
    "/en/research",
    "/en/career/vocational-training",
    "/institut/verwaltung/",
    "ipk-gatersleben.de/forschung/",
  ];

  const DOMAIN_EXCLUSIONS: string[] = [
    "xing.com",
    "linkedin.com",
    "youtube.com",
    "google.com",
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "tiktok.com",
    "x.com",
  ];

  if (URL.toLowerCase().startsWith("https://www.studentenwerk-leipzig.de/?s=")) {
    return true;
  }

  if (EXACT_MATCH_URLS.includes(URL.toLowerCase())) {
    return true;
  }

  const DOMAIN: string = extractHostname(URL);
  if (
    DOMAIN &&
    DOMAIN_EXCLUSIONS.some(function (excludedDomain: string): boolean {
      return DOMAIN && DOMAIN.includes(excludedDomain);
    })
  ) {
    return true;
  }

  if (URL.toLowerCase().includes("/team") && !URL.toLowerCase().includes("/teamleiter")) {
    return true;
  }

  return PARTIAL_MATCH_KEYWORDS.some(function (keyword: string): boolean {
    return URL.toLowerCase().includes(keyword);
  });
}

const TRUSTED_JOB_PORTAL_DOMAINS: string[] = ["interamt.de"];

/**
 * Determines if a URL belongs to a trusted job portal that requires special handling.
 * @param URL - The URL to check.
 * @returns True if the URL belongs to a trusted portal, false otherwise.
 */
export function isKnownJobPortal(URL: string): boolean {
  const HOSTNAME: string | null = extractHostname(URL);

  if (!HOSTNAME) {
    return false;
  }

  return TRUSTED_JOB_PORTAL_DOMAINS.some(function (domain: string): boolean {
    return HOSTNAME === domain || HOSTNAME.endsWith(`.${domain}`);
  });
}

/**
 * Extracts the hostname from a URL without using `new URL`.
 * @param url - The URL from which to extract the hostname.
 * @returns The hostname of the URL, or null if the URL is invalid.
 */
function extractHostname(url: string): string | null {
  const MATCH: RegExpMatchArray | null = url.match(/^https?:\/\/([^/]+)/);
  return MATCH ? MATCH[1].toLowerCase() : null;
}

/**
 * Checks if the page content has strong indicators that it's a job posting.
 * This is used when content is too large for AI classification.
 * Only returns true if there are clear job-specific phrases.
 * @param content - The page content to check.
 * @returns True if the content has strong job indicators.
 */
export function hasStrongJobIndicators(content: string): boolean {
  const contentLower: string = content.toLowerCase();

  // Strong job indicators that typically only appear on actual job postings
  const STRONG_JOB_PHRASES: string[] = [
    "bewerbungsschluss",
    "bewerbungsfrist",
    "ihre bewerbung",
    "bewerben sie sich",
    "application deadline",
    "apply now",
    "send your application",
    "stellenausschreibung",
    "zu besetzen",
    "befristet bis",
    "entgeltgruppe",
    "vergütung nach",
    "tv-l",
    "tvöd",
    "arbeitszeit",
    "wochenstunden",
    "ihre aufgaben",
    "ihr profil",
    "we offer",
    "your tasks",
    "your profile",
    "anforderungen",
    "qualifikationen",
    "requirements",
    "qualifications",
  ];

  // Count how many strong indicators are present
  let indicatorCount: number = 0;
  for (const phrase of STRONG_JOB_PHRASES) {
    if (contentLower.includes(phrase)) {
      indicatorCount++;
    }
  }

  // Require at least 2 strong indicators to be confident it's a job
  return indicatorCount >= 2;
}

/**
 * Checks if a URL has very strong job indicators that make AI classification unnecessary.
 * These are URLs where the classification is absolutely certain based on the URL alone.
 * @param url The URL to check
 * @returns true if the URL has very strong job indicators
 */
export function hasVeryStrongJobUrlIndicators(url: string): boolean {
  const urlLower: string = url.toLowerCase();

  // Very strong job indicators in URLs - these are unambiguous job posting indicators
  const VERY_STRONG_JOB_INDICATORS: string[] = [
    "stellenausschreibung",
    "stellenanzeige",
    "stellenangebote",
    "stellengesuch",
    "dozentensuche",
    "dozentengesuche",
    "dozentinnensuche",
    "lehrkraft",
    "lehrkraefte",
    "jobposting",
    "job-posting",
    "karriere/stellen",
    "career/jobs",
    "jobs/apply",
    "stellen/bewerben",
    "ausschreibung/stell",
    "praktikumsausschreibung",
    "werkstudentenstelle",
    "masterarbeit",
    "bachelorarbeit",
    // Job portal patterns - URLs with these are almost certainly job postings
    "/job/",
    "/jobs/",
    "/stelle/",
    "/vacancy/",
    "/vacancies/",
    "ausbildung-zum",
    "ausbildung-zur",
    // University professorship/job portals
    "berufungsportal",
  ];

  for (const indicator of VERY_STRONG_JOB_INDICATORS) {
    if (urlLower.includes(indicator)) {
      return true;
    }
  }

  return false;
}
