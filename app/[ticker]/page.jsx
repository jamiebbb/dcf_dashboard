import { notFound } from "next/navigation";
import { getAllCompanies, getCompanyByTicker } from "@/lib/companies";
import DCFSummary from "@/components/DCFSummary";
import SensitivityMatrix from "@/components/SensitivityMatrix";
import HistoricalChart from "@/components/HistoricalChart";
import ProjectedCashFlows from "@/components/ProjectedCashFlows";
import AssumptionsPanel from "@/components/AssumptionsPanel";

export const revalidate = 3600;

// Pre-generate pages for all known companies at build time
export function generateStaticParams() {
  const companies = getAllCompanies();
  return companies.map((c) => ({ ticker: c.ticker }));
}

export function generateMetadata({ params }) {
  const company = getCompanyByTicker(params.ticker);
  if (!company) return { title: "Company Not Found" };

  return {
    title: `${company.name} (${company.ticker}) — DCF Valuation`,
    description: `Intrinsic value analysis and DCF model for ${company.name}, part of the FTSE 250 Valuations project.`,
  };
}

export default function CompanyPage({ params }) {
  const company = getCompanyByTicker(params.ticker);
  if (!company) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <a href="/" className="hover:text-slate-300 transition-colors">
          All Companies
        </a>
        <span>/</span>
        <span className="text-slate-400">{company.sector}</span>
        <span>/</span>
        <span className="text-slate-300">{company.ticker}</span>
      </div>

      {/* Company header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-sm px-3 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/5">
            {company.ticker}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 capitalize">
            {company.modelType} DCF
          </span>
          {company.freuCompanyId && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
              📄 Linked to Financial Reports EU
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
          {company.name}
        </h1>
        <p className="text-slate-400 max-w-2xl">{company.description}</p>
      </div>

      {/* DCF Summary — the hero card */}
      <section className="mb-10">
        <DCFSummary company={company} />
      </section>

      {/* Projected Cash Flows table */}
      <section className="mb-10">
        <ProjectedCashFlows company={company} />
      </section>

      {/* Sensitivity Matrix */}
      <section className="mb-10">
        <SensitivityMatrix company={company} />
      </section>

      {/* Historical Charts */}
      <section className="mb-10">
        <HistoricalChart company={company} />
      </section>

      {/* Assumptions */}
      <section className="mb-10">
        <AssumptionsPanel company={company} />
      </section>

      {/* Filing link */}
      {company.freuCompanyId && (
        <section className="rounded-2xl border border-white/5 bg-[var(--bg-card)] p-6">
          <h3 className="font-display text-lg mb-3">
            Source Documents
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            This model is built from regulatory filings sourced via Financial
            Reports EU. View the original annual reports and financial
            statements:
          </p>
          <a
            href={`https://financialreports.eu/companies/${company.freuCompanyId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
          >
            View all filings on Financial Reports EU →
          </a>
        </section>
      )}

      {/* Footer metadata */}
      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-600">
        <span>
          Last updated: {company.lastUpdated} · Price as at:{" "}
          {company.lastPriceUpdate}
        </span>
        <span>
          ISIN: {company.isin} · Currency: {company.currency}
        </span>
      </div>
    </div>
  );
}
