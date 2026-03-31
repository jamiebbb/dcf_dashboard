"use client";

import { useState, useMemo } from "react";
import CompanyCard from "./CompanyCard";

export default function CompanyGrid({ companies, sectors }) {
  const [activeSector, setActiveSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = companies;

    if (activeSector !== "All") {
      result = result.filter((c) => c.sector === activeSector);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.ticker.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.sector?.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q)
      );
    }

    return result.sort(
      (a, b) => (b.marginOfSafety || 0) - (a.marginOfSafety || 0)
    );
  }, [companies, activeSector, searchQuery]);

  return (
    <>
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by ticker, name, or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-colors font-mono"
        />
      </div>

      {/* Sector filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveSector("All")}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
            activeSector === "All"
              ? "bg-white/10 text-white"
              : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
          }`}
        >
          All ({companies.length})
        </button>
        {sectors.map((sector) => {
          const count = companies.filter((c) => c.sector === sector).length;
          return (
            <button
              key={sector}
              onClick={() =>
                setActiveSector(activeSector === sector ? "All" : sector)
              }
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                activeSector === sector
                  ? "bg-white/10 text-white"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              {sector} ({count})
            </button>
          );
        })}
      </div>

      {/* Company grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">No matches found.</p>
          <p className="text-sm mt-2">
            Try a different search or clear the filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((company) => (
            <CompanyCard key={company.ticker} company={company} />
          ))}
        </div>
      )}
    </>
  );
}
