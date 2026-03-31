import { NextResponse } from "next/server";

const BASE_URL = "https://api.financialreports.eu";

/**
 * GET /api/companies?search=bellway
 *
 * Proxies company search to Financial Reports EU.
 * Useful for a future "add company" workflow from the website.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const ticker = searchParams.get("ticker");

  if (!search && !ticker) {
    return NextResponse.json(
      { error: "Provide ?search= or ?ticker= parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.FINANCIAL_REPORTS_EU_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINANCIAL_REPORTS_EU_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      page_size: "10",
      view: "summary",
      ...(search && { search }),
      ...(ticker && { ticker }),
    });

    const res = await fetch(`${BASE_URL}/companies/?${params}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch from Financial Reports EU", detail: err.message },
      { status: 502 }
    );
  }
}
