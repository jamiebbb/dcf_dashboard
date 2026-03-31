# FTSE 250 Intrinsic Values

A growing repository of DCF valuations for every company in the FTSE 250. Built with Next.js and deployed on Vercel, with company data sourced from [Financial Reports EU](https://financialreports.eu).

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ftse250-valuations.git
cd ftse250-valuations

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your Financial Reports EU API key

# Run locally
npm run dev
```

Visit `http://localhost:3000` to see the site.

## Project Structure

```
ftse250-valuations/
├── app/
│   ├── page.jsx                    # Homepage — searchable index
│   ├── [ticker]/page.jsx           # Dynamic company valuation page
│   ├── api/companies/route.js      # Proxy to Financial Reports EU
│   ├── api/filings/route.js        # Proxy for filing lookups
│   └── layout.jsx                  # Global layout and nav
├── components/
│   ├── CompanyCard.jsx             # Card for homepage grid
│   ├── DCFSummary.jsx              # Hero valuation card
│   ├── SensitivityMatrix.jsx       # WACC × growth sensitivity table
│   ├── HistoricalChart.jsx         # Revenue, margin, FCF charts
│   ├── ProjectedCashFlows.jsx      # Year-by-year projection table
│   └── AssumptionsPanel.jsx        # Analyst notes and drivers
├── data/
│   └── companies/
│       ├── BWY.json                # Bellway (housebuilder model)
│       ├── RR.json                 # Rolls-Royce (standard model)
│       └── ...                     # Add more here!
├── lib/
│   ├── companies.js                # File-based company data access
│   ├── dcf.js                      # DCF calculation engine
│   └── financialReportsEU.js       # FREU API client
└── public/
```

## Adding a New Company

1. Create a JSON file in `data/companies/` named `TICKER.json`
2. Follow the schema from `BWY.json` (housebuilder) or `RR.json` (standard)
3. Set the `modelType` field: `"standard"`, `"housebuilder"`, etc.
4. Commit, push, and Vercel will auto-deploy

### Supported Model Types

| Model Type     | Key Inputs                                         | Best For                    |
|----------------|----------------------------------------------------|-----------------------------|
| `standard`     | projectedFCF, discountRate, terminalGrowthRate     | Most companies              |
| `housebuilder` | completions, ASP, margin, land bank                | Bellway, Persimmon, Vistry  |
| `bank`         | *(planned)* book value, NIM, cost of equity        | Barclays, NatWest, etc.     |
| `insurer`      | *(planned)* combined ratio, investment income      | Aviva, Direct Line, etc.    |
| `reit`         | *(planned)* NAV, dividend yield, cap rate          | Land Securities, etc.       |

## Financial Reports EU Integration

The project connects to Financial Reports EU for:
- **Company metadata** — name, ISIN, sector codes
- **Annual reports** — full filings in processed markdown
- **Webhook alerts** — trigger re-analysis when new reports are published

Set your API key in `.env.local`:
```
FINANCIAL_REPORTS_EU_API_KEY=your_key
```

## Deploying to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Add `FINANCIAL_REPORTS_EU_API_KEY` in the Vercel environment variables
5. Deploy — that's it

Every push to `main` will auto-deploy. Company JSON changes deploy in ~30 seconds.

## Roadmap

- [x] Core DCF engine with sensitivity analysis
- [x] Housebuilder-specific model
- [x] Financial Reports EU integration
- [ ] Interactive DCF parameter adjustment (sliders)
- [ ] Live share price via API (London Stock Exchange / Yahoo Finance)
- [ ] Auto-update when new annual reports are filed (FREU webhooks)
- [ ] Bank, insurer, and REIT model templates
- [ ] Sector comparison views
- [ ] Export models to Excel
- [ ] Full FTSE 250 coverage

## Disclaimer

This is a personal research project. Valuations are illustrative and should not be considered investment advice. Always do your own research.
