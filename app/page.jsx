import { getAllCompanies, getAllSectors } from "@/lib/companies";
import { runDCF, calcMarginOfSafety } from "@/lib/dcf";
import CompanyGrid from "@/components/CompanyGrid";

export const revalidate = 3600;

export default function HomePage() {
  const companies = getAllCompanies();
  const sectors = getAllSectors();

  const enriched = companies.map((c) => {
    const result = runDCF(c);
    const iv = result?.intrinsicValuePerShare;
    const margin = calcMarginOfSafety(iv, c.currentPrice);
    return { ...c, intrinsicValue: iv, marginOfSafety: margin };
  });

  const undervalued = enriched.filter((c) => c.marginOfSafety > 0).length;
  const avgMargin =
    enriched.reduce((sum, c) => sum + (c.marginOfSafety || 0), 0) /
    (enriched.length || 1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">
          FTSE 250 Intrinsic Values
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          A growing repository of DCF valuations for every company in the FTSE
          250. Each model is built from annual report data via Financial Reports
          EU and updated as new filings are published.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Companies Modelled
          </div>
          <div className="font-mono text-2xl text-slate-200">
            {companies.length}
            <span className="text-sm text-slate-500"> / 250</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Sectors Covered
          </div>
          <div className="font-mono text-2xl text-slate-200">
            {sectors.length}
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Undervalued
          </div>
          <div className="font-mono text-2xl text-emerald-400">
            {undervalued}
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Avg. Margin of Safety
          </div>
          <div
            className={`font-mono text-2xl ${
              avgMargin > 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {avgMargin > 0 ? "+" : ""}
            {avgMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Interactive grid with search + sector filters */}
      {companies.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg">No companies modelled yet.</p>
          <p className="text-sm mt-2">
            Add a JSON file to{" "}
            <code className="bg-white/5 px-2 py-0.5 rounded text-xs font-mono">
              /data/companies/
            </code>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <CompanyGrid companies={enriched} sectors={sectors} />
      )}

      {/* Roadmap note */}
      <div className="mt-16 rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <div className="text-xs uppercase tracking-widest text-slate-600 mb-2">
          Roadmap
        </div>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Working toward full FTSE 250 coverage. Next: live share price
          streaming, auto-update from Financial Reports EU webhooks, and sector
          comparison views.
        </p>
      </div>
    </div>
  );
}
