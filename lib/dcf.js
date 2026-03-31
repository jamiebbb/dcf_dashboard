/**
 * DCF Calculation Engine
 *
 * Convention:
 *   - All monetary values (FCF, netDebt, EV, etc.) are in £m
 *   - sharesOutstanding is in millions
 *   - intrinsicValuePerShare is returned in pence (GBp) to match currentPrice
 *
 * Supports multiple valuation models:
 * - "standard"       → Classic FCF-based DCF
 * - "housebuilder"   → Land bank + completions-based model
 */

// ─── Standard FCF DCF ───────────────────────────────────────────────

export function calcStandardDCF(inputs) {
  const {
    projectedFCF = [],        // Array of projected free cash flows in £m
    discountRate = 0.09,      // WACC
    terminalGrowthRate = 0.025,
    sharesOutstanding,        // In millions
    netDebt = 0,              // £m — positive = debt, negative = net cash
  } = inputs;

  const n = projectedFCF.length;
  if (n === 0) return null;

  // PV of each year's cash flow
  const pvPerYear = projectedFCF.map((fcf, i) =>
    fcf / Math.pow(1 + discountRate, i + 1)
  );
  const pvFCF = pvPerYear.reduce((sum, pv) => sum + pv, 0);

  // Terminal value (Gordon Growth)
  const terminalFCF = projectedFCF[n - 1] * (1 + terminalGrowthRate);
  const terminalValue = terminalFCF / (discountRate - terminalGrowthRate);
  const pvTerminal = terminalValue / Math.pow(1 + discountRate, n);

  const enterpriseValue = pvFCF + pvTerminal;
  const equityValue = enterpriseValue - netDebt;

  // £m / millions of shares = £ per share → × 100 = pence
  const intrinsicValuePerShare = (equityValue / sharesOutstanding) * 100;

  return {
    pvFCF: Math.round(pvFCF),
    pvPerYear: pvPerYear.map(Math.round),
    terminalValue: Math.round(terminalValue),
    pvTerminal: Math.round(pvTerminal),
    enterpriseValue: Math.round(enterpriseValue),
    equityValue: Math.round(equityValue),
    intrinsicValuePerShare: Math.round(intrinsicValuePerShare * 100) / 100,
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
    discountRate = 0.09,
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
