"use client";

import { runDCF } from "@/lib/dcf";

export default function ProjectedCashFlows({ company }) {
  const inputs = company.dcfInputs;
  const isHousebuilder = company.modelType === "housebuilder";
  const discountRate = inputs.discountRate;
  const result = runDCF(company);

  const numYears = (inputs.projectedFCF || inputs.projectedCompletions).length;
  const years = Array.from({ length: numYears }, (_, i) => `Year ${i + 1}`);

  const rows = [];

  if (isHousebuilder) {
    // Revenue = completions × ASP, convert to £m
    const revenueM = inputs.projectedCompletions.map(
      (u, i) => Math.round((u * inputs.projectedASP[i]) / 1e6)
    );
    const fcfM = inputs.projectedCompletions.map((u, i) =>
      Math.round((u * inputs.projectedASP[i] * inputs.projectedMargin[i]) / 100 / 1e6)
    );

    rows.push({
      label: "Completions (units)",
      values: inputs.projectedCompletions,
      format: (v) => v?.toLocaleString(),
    });
    rows.push({
      label: "Avg. Selling Price",
      values: inputs.projectedASP,
      format: (v) => `\u00A3${(v / 1000).toFixed(0)}k`,
    });
    rows.push({
      label: "Revenue (\u00A3m)",
      values: revenueM,
      format: (v) => `\u00A3${v?.toLocaleString()}m`,
    });
    rows.push({
      label: "Operating Margin",
      values: inputs.projectedMargin,
      format: (v) => `${v}%`,
    });
    rows.push({
      label: "Est. FCF (\u00A3m)",
      values: fcfM,
      format: (v) => `\u00A3${v?.toLocaleString()}m`,
      highlight: true,
    });
  } else {
    rows.push({
      label: "Free Cash Flow (\u00A3m)",
      values: inputs.projectedFCF,
      format: (v) => `\u00A3${v?.toLocaleString()}m`,
      highlight: true,
    });
  }

  // Discount factors
  rows.push({
    label: "Discount Factor",
    values: years.map((_, i) =>
      (1 / Math.pow(1 + discountRate, i + 1)).toFixed(4)
    ),
    format: (v) => v,
    muted: true,
  });

  // PV of each year's FCF from the DCF engine result
  rows.push({
    label: "PV of FCF (\u00A3m)",
    values: result?.pvPerYear || [],
    format: (v) => `\u00A3${v?.toLocaleString()}m`,
    highlight: true,
  });

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--bg-card)] overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="font-display text-lg">Projected Cash Flows</h3>
        <p className="text-xs text-slate-500 mt-1">
          {isHousebuilder
            ? "Completions-based revenue model"
            : "Free cash flow projections"}{" "}
          — {years.length} year forecast period
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-3 text-left text-[10px] uppercase tracking-widest text-slate-500 w-48">
                Metric
              </th>
              {years.map((y) => (
                <th
                  key={y}
                  className="p-3 text-right font-mono text-xs text-slate-500"
                >
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={`border-t border-white/[0.03] ${
                  row.highlight ? "bg-white/[0.02]" : ""
                }`}
              >
                <td
                  className={`p-3 text-xs ${
                    row.muted
                      ? "text-slate-600"
                      : row.highlight
                      ? "text-slate-300 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {row.label}
                </td>
                {row.values.map((val, i) => (
                  <td
                    key={i}
                    className={`p-3 text-right font-mono text-xs ${
                      row.muted
                        ? "text-slate-600"
                        : row.highlight
                        ? "text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {row.format(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
