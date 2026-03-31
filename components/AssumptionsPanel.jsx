"use client";

export default function AssumptionsPanel({ company }) {
  const a = company.assumptions;
  if (!a) return null;

  const sections = [
    { label: "Revenue Drivers", text: a.revenueDrivers, icon: "📈" },
    { label: "Margin Drivers", text: a.marginDrivers, icon: "⚙️" },
    { label: "Key Risks", text: a.risks, icon: "⚠️" },
    { label: "Catalysts", text: a.catalyst, icon: "🔑" },
  ].filter((s) => s.text);

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--bg-card)] p-5">
      <h3 className="font-display text-lg mb-4">Analyst Assumptions</h3>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.label} className="flex gap-3">
            <span className="text-lg mt-0.5 shrink-0">{s.icon}</span>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                {s.label}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      {a.lastReportAnalysed && (
        <div className="mt-5 pt-4 border-t border-white/5 text-xs text-slate-500 flex items-center gap-2">
          <span>📄</span>
          Based on: {a.lastReportAnalysed}
        </div>
      )}
    </div>
  );
}
