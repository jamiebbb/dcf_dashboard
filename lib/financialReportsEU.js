/**
 * Financial Reports EU — API Client
 *
 * This module wraps the Financial Reports EU API for use in
 * Next.js API routes and server components.
 *
 * Set FINANCIAL_REPORTS_EU_API_KEY in your .env.local file.
 * API docs: https://financialreports.eu
 */

const BASE_URL = "https://api.financialreports.eu";

async function apiFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      url.searchParams.set(key, String(val));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Token ${process.env.FINANCIAL_REPORTS_EU_API_KEY}`,
      Accept: "application/json",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
  });

  if (!res.ok) {
    throw new Error(`FREU API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ─── Companies ──────────────────────────────────────────────────────

export async function searchCompanies(query, { page = 1, pageSize = 20 } = {}) {
  return apiFetch("/companies/", {
    search: query,
    page,
    page_size: pageSize,
    view: "summary",
  });
}

export async function getCompanyById(id) {
  return apiFetch(`/companies/${id}/`);
}

export async function getCompanyByTicker(ticker) {
  const result = await apiFetch("/companies/", {
    ticker,
    page_size: 1,
    view: "summary",
  });
  return result.results?.[0] || null;
}

// ─── Filings ────────────────────────────────────────────────────────

export async function getAnnualReports(companyId, { limit = 5 } = {}) {
  return apiFetch("/filings/", {
    company: companyId,
    types: "10-K,10-K-AFS",
    ordering: "-release_datetime",
    page_size: limit,
  });
}

export async function getLatestAnnualReport(companyId) {
  const result = await getAnnualReports(companyId, { limit: 1 });
  return result.results?.[0] || null;
}

export async function getFilingMarkdown(filingId, { limit = 50000, offset = 0 } = {}) {
  return apiFetch(`/filings/${filingId}/markdown/`, { limit, offset });
}

// ─── Sectors ────────────────────────────────────────────────────────

export async function getISICSections() {
  return apiFetch("/isic/sections/", { page_size: 100 });
}

export async function getCompaniesBySector(sectorCode, { page = 1, pageSize = 50 } = {}) {
  return apiFetch("/companies/", {
    sector: sectorCode,
    page,
    page_size: pageSize,
    view: "summary",
  });
}

// ─── Webhooks (for auto-updating when new reports drop) ─────────────

export async function createWebhook(url, options = {}) {
  const res = await fetch(`${BASE_URL}/webhooks/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.FINANCIAL_REPORTS_EU_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      is_active: true,
      track_all_companies: false,
      trigger_on_filing_processed: true,
      trigger_on_filing_received: false,
      include_markdown: true,
      subscribed_filing_types: ["10-K", "10-K-AFS"],
      ...options,
    }),
  });

  return res.json();
}
