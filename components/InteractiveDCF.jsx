"use client";

import { useState, useMemo } from "react";
import DCFSummary from "./DCFSummary";
import ProjectedCashFlows from "./ProjectedCashFlows";
import SensitivityMatrix from "./SensitivityMatrix";
import HistoricalChart from "./HistoricalChart";
import AssumptionsPanel from "./AssumptionsPanel";

function SliderInput({ label, value, onChange, min, max, step, format }) {
  return (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-widest text-slate-500">
          {label}
        </label>
        <span className="font-mono text-sm text-slate-200">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-track"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-slate-600">
          {format(min)}
        </span>
        <span className="text-[9px] font-mono text-slate-600">
          {format(max)}
        </span>
      </div>
    </div>
  );
}

export default function InteractiveDCF({ company }) {
  const baseWACC = company.dcfInputs.discountRate;
  const baseTGR = company.dcfInputs.terminalGrowthRate;

  const [wacc, setWacc] = useState(baseWACC);
  const [tgr, setTgr] = useState(baseTGR);

  const isModified = wacc !== baseWACC || tgr !== baseTGR;

  // Build a modified company object with overridden discount rate / terminal growth
  const modifiedCompany = useMemo(() => {
    if (!isModified) return company;
    return {
      ...company,
      dcfInputs: {
        ...company.dcfInputs,
        discountRate: wacc,
        terminalGrowthRate: tgr,
      },
    };
  }, [company, wacc, tgr, isModified]);

  const handleReset = () => {
    setWacc(baseWACC);
    setTgr(baseTGR);
  };

  const pctFormat = (v) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-10">
      {/* Assumption sliders */}
      <div className="rounded-2xl border border-white/5 bg-[var(--bg-card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg">Model Assumptions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust WACC and terminal growth rate to see how the valuation
              changes
            </p>
          </div>
          {isModified && (
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
            >
              Reset to defaults
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-8">
          <SliderInput
            label="Discount Rate (WACC)"
            value={wacc}
            onChange={setWacc}
            min={0.04}
            max={0.15}
            step={0.005}
            format={pctFormat}
          />
          <SliderInput
            label="Terminal Growth Rate"
            value={tgr}
            onChange={setTgr}
            min={0.0}
            max={0.04}
            step={0.005}
            format={pctFormat}
          />
        </div>
        {isModified && (
          <div className="mt-3 text-[10px] text-amber-400/70 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
            Modified from base case (WACC {pctFormat(baseWACC)}, TGR{" "}
            {pctFormat(baseTGR)})
          </div>
        )}
      </div>

      {/* DCF Summary — the hero card */}
      <section>
        <DCFSummary company={modifiedCompany} />
      </section>

      {/* Projected Cash Flows table */}
      <section>
        <ProjectedCashFlows company={modifiedCompany} />
      </section>

      {/* Sensitivity Matrix */}
      <section>
        <SensitivityMatrix company={modifiedCompany} />
      </section>

      {/* Historical Charts */}
      <section>
        <HistoricalChart company={company} />
      </section>

      {/* Assumptions */}
      <section>
        <AssumptionsPanel company={company} />
      </section>
    </div>
  );
}
