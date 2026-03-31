import { NextResponse } from "next/server";

const BASE_URL = "https://api.financialreports.eu";

/**
 * GET /api/filings?company_id=5265&types=10-K
 *
 * Proxies filing search to Financial Reports EU.
 * Used by the frontend to list annual reports for a company.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("company_id");

  if (!companyId) {
    return NextResponse.json(
      { error: "Provide ?company_id= parameter" },
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
      company: companyId,
      types: searchParams.get("types") || "10-K,10-K-AFS",
      ordering: "-release_datetime",
      page_size: searchParams.get("limit") || "5",
    });

    const res = await fetch(`${BASE_URL}/filings/?${params}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch filings", detail: err.message },
      { status: 502 }
    );
  }
}
