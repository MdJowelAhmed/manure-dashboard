# Meridian Business | Fertilizer Import & Local Sales Management Dashboard

A production-style frontend prototype built for an international fertilizer import and domestic distribution business in Bangladesh.

The application manages international procurement (SABIC, QAFCO, OCP, Sinofert), sea-transit logistics via Chittagong Port, single-depot warehouse stock operations at **Khatunganj Central Depot**, local dealer sales distribution across Bangladesh, customer and supplier trade ledgers, operating expense management, and a complete double-entry accounting engine in Bangladeshi Taka (BDT).

---

## 1. Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom enterprise tokens
- **Design System & Primitives**: Radix UI + shadcn/ui compatible components
- **Navigation & Routing**: React Router v7
- **State Management**: Redux Toolkit (UI state, date filters, prototype refresh) & prepared RTK Query architecture
- **Forms & Validation**: React Hook Form + Zod
- **Data Tables**: TanStack Table v8 (sorting, filtering, sticky headers, pagination)
- **Charts & Visualizations**: Recharts (Monthly Sales vs. Landed Cost, Inventory Stock by Product)
- **Icons**: Lucide React
- **Toast Notifications**: Sonner
- **Testing**: Vitest + React Testing Library + Jest DOM matchers

---

## 2. Palette & Visual Identity

Engineered with an understated, professional enterprise finance palette:

| Token | Hex Code | Purpose |
|---|---|---|
| **App Background** | `#F7F8FA` | Neutral canvas backdrop |
| **Main Surfaces** | `#FFFFFF` | Cards, tables, modal dialogs |
| **Primary Text** | `#202833` | Headings, amounts, high-emphasis text |
| **Secondary Text** | `#697586` | Subtitles, table labels, metadata |
| **Borders** | `#DCE2E8` | Table borders, card outlines |
| **Accent** | `#526B83` | Brand mark, primary action buttons, active navigation |
| **Success** | `#0F766E` / `#166534` | Paid, received, balanced, in-stock badges |
| **Warning** | `#B45309` | Approaching due, partial payment, low stock |
| **Danger** | `#991B1B` | Overdue balances, cancellations, stockouts |

---

## 3. Bangladesh Business & Accounting Context

- **Business Entity**: Meridian Agri-Trade Ltd. (Trading as *Meridian Business*), 102-103 Agrabad C/A, Chattogram. Trade License: `TRAD/CHA/2019/55210`, BIN: `003481290-0101`, TIN: `5812-4419-7720`.
- **Sole Depot**: **Khatunganj Central Depot** (Chaktai Khal Road, Chattogram — 15,000 MT capacity).
- **Core Commodities**:
  - Urea (Prilled 46% N) — Ex Saudi Arabia (SABIC)
  - Di-Ammonium Phosphate (DAP 18-46-0) — Ex Morocco (OCP Group)
  - Triple Super Phosphate (TSP 0-46-0) — Ex China (Sinofert)
  - Muriate of Potash (MoP 0-0-60) — Ex Canada / Jordan
  - NPK Compound (15-15-15 Balanced) — Ex UAE
  - Zinc Sulphate Monohydrate (36% Zn) & Agricultural Gypsum
- **Unit Conversions**: Base unit is **Metric Ton (MT)**. Fully supports conversions to standard 50kg / 25kg bags (1 MT = 20 Bags of 50kg = 1,000 KG).
- **Landed Cost Allocation**: Transparent weight-based allocation capitalizing ocean freight, marine cargo insurance, customs assessment (NBR), port handling (Chittagong Port Authority), C&F agent charges, and inland transport into inventory valuation without asserting a final approved statutory accounting policy.
- **Double-Entry Equilibrium**: Full double-entry ledger with automated journal entries, zero-difference Trial Balance, and reconciled Balance Sheet & Profit and Loss statements.

---

## 4. Route Map

| Category | Route | Description |
|---|---|---|
| **Overview** | `/dashboard` | High-level financial KPIs, sales vs cost charts, low stock alerts, overdue dues |
| **Procurement** | `/imports` | Import shipments list, landed cost totals, and status pipeline |
| | `/imports/new` | Consignment creation with live landed-cost allocation preview |
| | `/imports/:id` | Import dossier with Landed Cost tab, Goods Receipts, and linked journals |
| | `/purchase-orders` | Purchase orders contract tracking with international manufacturers |
| | `/goods-receipts` | Goods Receipt Notes (GRN) log with modal for receiving stock into depot |
| **Inventory** | `/inventory` | Stock overview, warehouse capacity usage, and valuation table |
| | `/inventory/products/new` | Product creation with SKU, packaging bag size, and reorder levels |
| | `/inventory/products/:id` | Product detail with unit conversion matrix, movements, and sales history |
| | `/inventory/movements` | Chronological audit trail of warehouse intake, deliveries, and returns |
| | `/inventory/adjustments` | Physical count reconciliation, bagging losses, and variance write-offs |
| **Sales** | `/sales` | Commercial sales invoices list with collection and due tracking |
| | `/sales/new` | Invoice form with available stock check, unit selector, and live totals |
| | `/sales/:id` | Professional printable Bangladeshi invoice with tax and journal breakdown |
| | `/sales-returns` | Damaged bag returns and customer credit note issuance |
| **Partners** | `/customers` | Dealer directory, credit limits, and outstanding balances |
| | `/customers/new` | Register new fertilizer dealer or cooperative |
| | `/customers/:id` | Dealer ledger with printable Statement of Account |
| | `/suppliers` | International supplier directory, L/C terms, and payable balances |
| | `/suppliers/new` | Register international vendor with SWIFT banking details |
| | `/suppliers/:id` | Vendor dossier with import history and L/C disbursements |
| **Treasury** | `/payments` | Customer collections and supplier payment vouchers |
| | `/payments/new` | Record payments with invoice and bill allocation |
| | `/cash-bank` | Treasury accounts (Eastern Bank Ops, Islami Bank L/C, Petty Cash) |
| | `/expenses` | Operating expenses (godown lease, payroll, utilities) separated from landed cost |
| **Accounting** | `/accounting/chart-of-accounts` | Standard Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expense) |
| | `/accounting/journals` | Journal entries with debit/credit inspection |
| | `/accounting/journals/new` | Post manual journal with **strict real-time debit = credit balance validation** |
| | `/accounting/general-ledger` | General ledger with account selector and running balance |
| | `/accounting/trial-balance` | Trial balance audit statement verifying total debits equal total credits |
| | `/accounting/periods` | Fiscal years schedule and book closure locks |
| **Reports** | `/reports` | Financial & operational reports hub |
| | `/reports/profit-loss` | Statement of Profit or Loss (Gross sales, landed COGS, net profit) |
| | `/reports/balance-sheet` | Balance sheet in equilibrium (Assets = Liabilities + Equity) |
| | `/reports/cash-flow` | Cash flow statement with treasury reconciliation |
| | `/reports/inventory-valuation` | Product-by-product landed cost inventory valuation statement |
| | `/reports/receivables` | A/R aging schedule (0-30, 31-60, 61-90, 90+ days) |
| | `/reports/payables` | Trade payables schedule for international suppliers |
| | `/reports/sales` | Domestic sales volume breakdown by commodity |
| | `/reports/import-costs` | Itemized landed cost analysis report |
| **Settings** | `/settings` | Company profile, warehouse info, accounting params, and audit trail |

---

## 5. Development & Running Commands

### Install Dependencies
```bash
npm install
```

### Run Locally (Dev Server)
```bash
npm run dev
# Starts Vite dev server at http://127.0.0.1:5173/
```

### Run Unit Tests
```bash
npm test
# Executes Vitest test suite covering calculations, double-entry validation, and formatters
```

### Build Production Bundle
```bash
npm run build
# Runs type checking (tsc -b) and generates optimized production bundle in dist/
```

---

## 6. Architecture & Extensibility

- **Clean Feature Organization**: Code is separated into `src/features/*`, `src/components/*`, `src/lib/*`, `src/mocks/*`, and `src/services/*`.
- **Mock Repository & Storage Adapter**: All CRUD operations flow through `mockRepo` backed by an isolated `storageAdapter.ts`. This allows persistent prototype interactions during user testing, with a one-click **"Reset Demo Baseline Data"** action in the header.
- **Future API Readiness**: Page components interact exclusively with typed interfaces; when connecting to a real backend in subsequent phases, the service layer can be replaced with HTTP endpoints or RTK Query hooks without modifying UI components.
