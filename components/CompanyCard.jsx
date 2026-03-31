"use client";

import { runDCF, calcMarginOfSafety } from "@/lib/dcf";

export default function CompanyCard({ company }) {
  const result = runDCF(company);
  const iv = result?.intrinsicValuePerShare;
  const margin = calcMarginOfSafety(iv, company.currentPrice);
  const isUndervalued = margin > 0;

  return (
    <a
      href={`/${company.ticker}`}
      className="group block rounded-2xl border border-white/5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 hover:border-white/10 overflow-hidden"
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: isUndervalued
            ? "linear-gradient(90deg, #34d399, #60a5fa)"
            : "linear-gradient(90deg, #f87171, #fbbf24)",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                {company.ticker}
              </span>
              <span className="text-xs text-slate-500">{company.currency}</span>
            </div>
            <h3 className="font-display text-lg leading-tight group-hover:text-white transition-colors">
              {company.name}
            </h3>
          </div>
          <span
            className={`text-xs font-mono px-2 py-1 rounded-full ${
              isUndervalued
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {isUndervalued ? "▲" : "▼"} {Math.abs(margin)}%
          </span>
        </div>

        {/* Sector tag */}
        <div className="text-xs text-slate-500 mb-4">{company.sector}</div>

        {/* Price vs IV */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Price
            </div>
            <div className="font-mono text-sm text-slate-300">
              {company.currentPrice?.toLocaleString()}p
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Intrinsic Value
            </div>
            <div
              className={`font-mono text-sm ${
                isUndervalued ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {iv ? `${iv.toLocaleString()}p` : "—"}
            </div>
          </div>
        </div>

        {/* Model type badge */}
        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600">
          <span className="uppercase tracking-wider">
            {company.modelType} DCF
          </span>
          <span>
            Updated {company.lastUpdated}
          </span>
        </div>
      </div>
    </a>
  );
}
