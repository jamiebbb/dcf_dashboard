import fs from "fs";
import path from "path";

const COMPANIES_DIR = path.join(process.cwd(), "data", "companies");

/**
 * Get all companies from the /data/companies directory.
 * Each company is a JSON file named by ticker (e.g. BWY.json).
 */
export function getAllCompanies() {
  if (!fs.existsSync(COMPANIES_DIR)) return [];

  const files = fs.readdirSync(COMPANIES_DIR).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      try {
        const raw = fs.readFileSync(path.join(COMPANIES_DIR, file), "utf-8");
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single company by ticker slug.
 * Tries exact match first, then case-insensitive.
 */
export function getCompanyByTicker(ticker) {
  const slug = ticker.toUpperCase();
  const filePath = path.join(COMPANIES_DIR, `${slug}.json`);

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  }

  // Fallback: search all files for matching ticker field
  const all = getAllCompanies();
  return all.find((c) => c.ticker.toUpperCase() === slug) || null;
}

/**
 * Get all unique sectors from available companies.
 */
export function getAllSectors() {
  const companies = getAllCompanies();
  const sectors = [...new Set(companies.map((c) => c.sector).filter(Boolean))];
  return sectors.sort();
}

/**
 * Get companies filtered by sector.
 */
export function getCompaniesBySector(sector) {
  return getAllCompanies().filter(
    (c) => c.sector?.toLowerCase() === sector.toLowerCase()
  );
}
