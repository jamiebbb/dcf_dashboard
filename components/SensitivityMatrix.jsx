"use client";

import { buildSensitivityMatrix } from "@/lib/dcf";

export default function SensitivityMatrix({ company }) {
  const matrix = buildSensitivityMatrix(
    company.dcfInputs,
    company.modelType
  );

  if (!matrix) return null;

  const currentPrice = company.currentPrice;

  // Find the "base case" indices (the middle of each axis)
  const baseDiscountIdx = Math.floor(matrix.discountRates.length / 2);
  const baseGrowthIdx = Math.floor(matrix.growthRates.length / 2);

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--bg-card)] overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="font-display text-lg">Sensitivity Analysis</h3>
        <p className="text-xs text-slate-500 mt-1">
          Intrinsic value per share across discount rate (WACC) and terminal
          growth assumptions. Current price: {currentPrice?.toLocaleString()}p
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left text-[10px] uppercase tracking-widest text-slate-500 bg-white/[0.02]">
                Growth ↓ / WACC →
              </th>
              {matrix.discountRates.map((rate, i) => (
                <th
                  key={rate}
                  className={`p-3 text-center font-mono text-xs ${
                    i === baseDiscountIdx
                      ? "text-blue-400 bg-blue-500/[0.05]"
                      : "text-slate-500"
                  }`}
                >
                  {rate}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.values.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t border-white/[0.03]">
                <td
                  className={`p-3 font-mono text-xs ${
                    rowIdx === baseGrowthIdx
                      ? "text-blue-400 bg-blue-500/[0.05]"
                      : "text-slate-500"
                  }`}
                >
                  {matrix.growthRates[rowIdx]}
                </td>
                {row.map((val, colIdx) => {
                  const isBase =
                    rowIdx === baseGrowthIdx && colIdx === baseDiscountIdx;
                  const isAbove = val > currentPrice;
                  const diff = ((val - currentPrice) / currentPrice) * 100;

                  return (
                    <td
                      key={colIdx}
                      className={`p-3 text-center font-mono text-xs transition-colors ${
                        isBase
                          ? "bg-blue-500/10 font-semibold ring-1 ring-blue-500/30"
                          : ""
                      } ${
                        isAbove
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                      title={`${diff > 0 ? "+" : ""}${diff.toFixed(1)}% vs current price`}
                    >
                      {Math.round(val).toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-slate-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Above current price
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Below current price
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Base case
        </span>
      </div>
    </div>
  );
}
