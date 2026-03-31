/**
 * DCF Calculation Engine — Investment Banking Standard
 *
 * Convention:
 *   - All monetary values (FCF, netDebt, EV, etc.) are in £m
 *   - sharesOutstanding is in millions
 *   - intrinsicValuePerShare is returned in pence (GBp) to match currentPrice
 *   - Mid-year discounting convention (cash flows assumed mid-year)
 *   - Terminal value at end of projection period
 *
 * Supports multiple valuation models:
 * - "standard"       → Classic FCF-based DCF
 * - "housebuilder"   → Land bank + completions-based model
 */

// ─── Standard FCF DCF ───────────────────────────────────────────────

export function calcStandardDCF(inputs) {
  const {
    projectedFCF = [],        // Array of projected free cash flows in £m
    discountRate = 0.075,     // WACC
    terminalGrowthRate = 0.02,
    sharesOutstanding,        // In millions
    netDebt = 0,              // £m — positive = debt, negative = net cash
  } = inputs;

  const n = projectedFCF.length;
  if (n === 0) return null;

  // Guard: terminal growth must be less than discount rate
  const effectiveTGR = Math.min(terminalGrowthRate, discountRate - 0.005);

  // PV of each year's cash flow — MID-YEAR CONVENTION
  // Cash flows assumed to arrive mid-year (i + 0.5) not year-end (i + 1)
  const pvPerYear = projectedFCF.map((fcf, i) =>
    fcf / Math.pow(1 + discountRate, i + 0.5)
  );
  const pvFCF = pvPerYear.reduce((sum, pv) => sum + pv, 0);

  // Terminal value (Gordon Growth) — valued at END of last projection year
  const terminalFCF = projectedFCF[n - 1] * (1 + effectiveTGR);
  const terminalValue = terminalFCF / (discountRate - effectiveTGR);
  // TV discounted from end of year n (not mid-year, since it represents
  // the value of all cash flows AFTER the projection period)
  const pvTerminal = terminalValue / Math.pow(1 + discountRate, n);

  const enterpriseValue = pvFCF + pvTerminal;
  const equityValue = enterpriseValue - netDebt;

  // £m / millions of shares = £ per share → × 100 = pence
  const intrinsicValuePerShare = (equityValue / sharesOutstanding) * 100;

  // Terminal value as % of total EV — flag if over-reliant on TV
  const tvPctOfEV = enterpriseValue > 0
    ? Math.round((pvTerminal / enterpriseValue) * 1000) / 10
    : 0;

  // Implied exit multiple (TV / last year FCF) — sanity check
  const impliedExitMultiple = projectedFCF[n - 1] > 0
    ? Math.round((terminalValue / projectedFCF[n - 1]) * 10) / 10
    : null;

  // Implied perpetuity FCF yield
  const impliedFCFYield = enterpriseValue > 0
    ? Math.round((projectedFCF[n - 1] / enterpriseValue) * 1000) / 10
    : null;

  return {
    pvFCF: Math.round(pvFCF),
    pvPerYear: pvPerYear.map(Math.round),
    terminalValue: Math.round(terminalValue),
    pvTerminal: Math.round(pvTerminal),
    enterpriseValue: Math.round(enterpriseValue),
    equityValue: Math.round(equityValue),
    intrinsicValuePerShare: Math.round(intrinsicValuePerShare * 100) / 100,
    tvPctOfEV,
    impliedExitMultiple,
    impliedFCFYield,
  };
}

// ─── Housebuilder Model ─────────────────────────────────────────────

export function calcHousebuilderDCF(inputs) {
  const {
    projectedCompletions = [],     // Units per year
    projectedASP = [],             // Average selling price per unit (£)
    projectedMargin = [],          // Operating margin %
    landBankValue = 0,             // Current land bank market value (£m)
    landBankYearsSupply = 0,
    discountRate = 0.075,
    terminalGrowthRate = 0.02,
    sharesOutstanding,             // In millions
    netDebt = 0,                   // £m
  } = inputs;

  const n = projectedCompletions.length;
  if (n === 0) return null;

  // Generate revenue and FCF from completions model
  // Revenue = units × ASP → raw £, then convert to £m
  const projectedRevenue = projectedCompletions.map(
    (units, i) => (units * projectedASP[i]) / 1e6
  );
  const projectedFCF = projectedRevenue.map(
    (rev, i) => rev * (projectedMargin[i] / 100)
  );

  // Run standard DCF on the derived FCFs (now in £m)
  const dcfResult = calcStandardDCF({
    projectedFCF,
    discountRate,
    terminalGrowthRate,
    sharesOutstanding,
    netDebt,
  });

  return {
    ...dcfResult,
    projectedRevenue: projectedRevenue.map((v) => Math.round(v)),
    projectedFCF: projectedFCF.map((v) => Math.round(v)),
    landBankValue: Math.round(landBankValue),
    landBankYearsSupply,
  };
}

// ─── Sensitivity Matrix ─────────────────────────────────────────────

export function buildSensitivityMatrix(inputs, modelType = "standard") {
  const {
    discountRate: baseDiscount,
    terminalGrowthRate: baseGrowth,
  } = inputs;

  // Range: ±1.5% discount rate, ±1% growth in 0.5% steps
  const discountRates = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map(
    (d) => baseDiscount + d / 100
  );
  const growthRates = [-1, -0.5, 0, 0.5, 1].map(
    (g) => baseGrowth + g / 100
  );

  const calcFn =
    modelType === "housebuilder" ? calcHousebuilderDCF : calcStandardDCF;

  const matrix = growthRates.map((g) =>
    discountRates.map((d) => {
      const result = calcFn({
        ...inputs,
        discountRate: d,
        terminalGrowthRate: g,
      });
      return result?.intrinsicValuePerShare ?? 0;
    })
  );

  return {
    discountRates: discountRates.map((r) => (r * 100).toFixed(1) + "%"),
    growthRates: growthRates.map((r) => (r * 100).toFixed(1) + "%"),
    values: matrix,
  };
}

// ─── Margin of Safety ───────────────────────────────────────────────

export function calcMarginOfSafety(intrinsicValue, currentPrice) {
  if (!intrinsicValue || !currentPrice) return null;
  const margin = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
  return Math.round(margin * 10) / 10;
}

// ─── Model Router ───────────────────────────────────────────────────

export function runDCF(company) {
  const { modelType = "standard", dcfInputs } = company;

  switch (modelType) {
    case "housebuilder":
      return calcHousebuilderDCF(dcfInputs);
    case "standard":
    default:
      return calcStandardDCF(dcfInputs);
  }
}
