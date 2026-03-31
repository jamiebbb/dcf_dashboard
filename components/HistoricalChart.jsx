"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  revenue: "#60a5fa",
  profit: "#34d399",
  margin: "#fbbf24",
  fcf: "#a78bfa",
  completions: "#f472b6",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-slate-900 border border-white/10 p-3 text-xs shadow-xl">
      <div className="font-mono text-slate-400 mb-2">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono text-slate-200">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HistoricalChart({ company }) {
  const hist = company.historicalData;
  if (!hist?.years) return null;

  // Build chart data from historicals
  const data = hist.years.map((year, i) => ({
    year,
    Revenue: hist.revenue?.[i],
    "Operating Profit": hist.operatingProfit?.[i],
    "Op. Margin %": hist.operatingMargin?.[i],
    FCF: hist.freeCashFlow?.[i],
    Completions: hist.completions?.[i],
    EPS: hist.eps?.[i],
  }));

  const isHousebuilder = company.modelType === "housebuilder";

  return (
    <div className="space-y-6">
      {/* Revenue & Profit chart */}
      <div className="rounded-2xl border border-white/5 bg-[var(--bg-card)] p-5">
        <h3 className="font-display text-lg mb-1">Revenue & Profitability</h3>
        <p className="text-xs text-slate-500 mb-4">£m</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
              />
              <Bar
                dataKey="Revenue"
                fill={COLORS.revenue}
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar
                dataKey="Operating Profit"
                fill={COLORS.profit}
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Margin / FCF trend */}
      <div className="rounded-2xl border border-white/5 bg-[var(--bg-card)] p-5">
        <h3 className="font-display text-lg mb-1">
          {isHousebuilder ? "Margin & Completions" : "Margin & Free Cash Flow"}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {isHousebuilder ? "Op. margin (%) and units completed" : "Op. margin (%) and FCF (£m)"}
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Op. Margin %"
                stroke={COLORS.margin}
                fill={COLORS.margin}
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey={isHousebuilder ? "Completions" : "FCF"}
                stroke={isHousebuilder ? COLORS.completions : COLORS.fcf}
                fill={isHousebuilder ? COLORS.completions : COLORS.fcf}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
