"use client";

import { runDCF, calcMarginOfSafety } from "@/lib/dcf";

function StatBlock({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
        {label}
      </div>
      <div className={`font-mono text-xl font-medium ${accent || "text-slate-200"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function DCFSummary({ company }) {
  const result = runDCF(company);
  if (!result) return null;

  const iv = result.intrinsicValuePerShare;
  const margin = calcMarginOfSafety(iv, company.currentPrice);
  const isUndervalued = margin > 0;

  const fmt = (n) =>
    typeof n === "number"
      ? n >= 1000
        ? `£${(n / 1000).toFixed(1)}bn`
        : `£${n}m`
      : "—";

  return (
    <div className="space-y-6">
      {/* Hero: IV vs Price */}
      <div
        className={`rounded-2xl border p-6 ${
          isUndervalued
            ? "border-emerald-500/20 bg-emerald-500/[0.03]"
            : "border-red-500/20 bg-red-500/[0.03]"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isUndervalued ? "bg-emerald-400 undervalued" : "bg-red-400 overvalued"
            }`}
          />
          <span className="text-sm text-slate-400">
            {isUndervalued ? "Trading below intrinsic value" : "Trading above intrinsic value"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
              Intrinsic Value
            </div>
            <div
              className={`font-mono text-3xl font-medium ${
                isUndervalued ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {iv?.toLocaleString()}p
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
              Current Price
            </div>
            <div className="font-mono text-3xl font-medium text-slate-300">
              {company.currentPrice?.toLocaleString()}p
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
              Margin of Safety
            </div>
            <div
              className={`font-mono text-3xl font-medium ${
                isUndervalued ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {margin > 0 ? "+" : ""}
              {margin}%
            </div>
          </div>
        </div>
      </div>

      {/* DCF Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBlock
          label="PV of Cash Flows"
          value={fmt(result.pvFCF)}
        />
        <StatBlock
          label="Terminal Value"
          value={fmt(result.terminalValue)}
          sub={`PV: ${fmt(result.pvTerminal)}`}
        />
        <StatBlock
          label="Enterprise Value"
          value={fmt(result.enterpriseValue)}
        />
        <StatBlock
          label="Equity Value"
          value={fmt(result.equityValue)}
          sub={`${company.dcfInputs.sharesOutstanding}m shares`}
        />
      </div>

      {/* Key Assumptions */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
          Key Model Inputs
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Discount Rate (WACC)</span>
            <div className="font-mono text-slate-300">
              {(company.dcfInputs.discountRate * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="text-slate-500">Terminal Growth</span>
            <div className="font-mono text-slate-300">
              {(company.dcfInputs.terminalGrowthRate * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="text-slate-500">Net Debt</span>
            <div className="font-mono text-slate-300">
              {company.dcfInputs.netDebt < 0
                ? `${fmt(Math.abs(company.dcfInputs.netDebt))} (cash)`
                : fmt(company.dcfInputs.netDebt)}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Model Type</span>
            <div className="font-mono text-slate-300 capitalize">
              {company.modelType} · mid-year
            </div>
          </div>
        </div>
      </div>

      {/* Cross-check metrics — investment banking sanity checks */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
          Valuation Cross-Checks
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">TV % of EV</span>
            <div className={`font-mono ${result.tvPctOfEV > 75 ? "text-amber-400" : "text-slate-300"}`}>
              {result.tvPctOfEV}%
              {result.tvPctOfEV > 75 && <span className="text-[10px] ml-1">⚠</span>}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Implied Exit Multiple</span>
            <div className="font-mono text-slate-300">
              {result.impliedExitMultiple ? `${result.impliedExitMultiple}x FCF` : "—"}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Implied FCF Yield</span>
            <div className="font-mono text-slate-300">
              {result.impliedFCFYield ? `${result.impliedFCFYield}%` : "—"}
            </div>
          </div>
          <div>
            <span className="text-slate-500">PV of FCFs vs TV</span>
            <div className="font-mono text-slate-300">
              {fmt(result.pvFCF)} / {fmt(result.pvTerminal)}
            </div>
          </div>
        </div>
      </div>

      {/* Housebuilder-specific extras */}
      {company.modelType === "housebuilder" && result.landBankValue && (
        <div className="rounded-xl bg-amber-500/[0.03] border border-amber-500/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-amber-500/70 mb-3">
            Housebuilder Metrics
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Land Bank Value</span>
              <div className="font-mono text-amber-400">{fmt(result.landBankValue)}</div>
            </div>
            <div>
              <span className="text-slate-500">Years Supply</span>
              <div className="font-mono text-amber-400">
                {result.landBankYearsSupply} yrs
              </div>
            </div>
            <div>
              <span className="text-slate-500">Proj. Completions (Yr 5)</span>
              <div className="font-mono text-amber-400">
                {company.dcfInputs.projectedCompletions?.slice(-1)[0]?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
