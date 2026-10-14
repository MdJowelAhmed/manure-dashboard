import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  FileText,
  TrendingUp,
  Scale,
  Banknote,
  Boxes,
  Users,
  Building2,
  Ship,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computeFinancialSummary } from '@/lib/calculations'
import { formatBDT, formatCompactBDT } from '@/lib/utils'

export const ReportsHubPage: React.FC = () => {
  const navigate = useNavigate()
  const summary = computeFinancialSummary()

  const reportCards = [
    {
      title: 'Profit & Loss Statement (P&L)',
      description: 'Gross sales revenue, landed COGS, gross margin, operating expenses, and net profit',
      href: '/reports/profit-loss',
      icon: TrendingUp,
      metric: `Net Profit: ${formatCompactBDT(summary.netProfitBDT)}`,
    },
    {
      title: 'Balance Sheet Statement',
      description: 'Current assets, trade liabilities, owner equity, and balanced ledger verification',
      href: '/reports/balance-sheet',
      icon: Scale,
      metric: `Assets: ${formatCompactBDT(summary.totalAssetsBDT)}`,
    },
    {
      title: 'Cash Flow Statement',
      description: 'Cash inflows from dealer receipts, import disbursements, and operational overheads',
      href: '/reports/cash-flow',
      icon: Banknote,
      metric: `Liquid Cash: ${formatCompactBDT(summary.totalCashAndBankBDT)}`,
    },
    {
      title: 'Inventory Valuation Report',
      description: 'Product-by-product physical stock, bag conversions, and capitalized landed valuation',
      href: '/reports/inventory-valuation',
      icon: Boxes,
      metric: `Valuation: ${formatCompactBDT(summary.inventoryValueBDT)}`,
    },
    {
      title: 'Accounts Receivable Aging',
      description: 'Dealer credit aging (0-30, 31-60, 61-90, 90+ days) and collection risk exposure',
      href: '/reports/receivables',
      icon: Users,
      metric: `Receivables: ${formatCompactBDT(summary.accountsReceivableBDT)}`,
    },
    {
      title: 'Accounts Payable Aging',
      description: 'International supplier L/C liabilities, usance maturities, and payment schedules',
      href: '/reports/payables',
      icon: Building2,
      metric: `Payables: ${formatCompactBDT(summary.accountsPayableBDT)}`,
    },
    {
      title: 'Sales Performance Analysis',
      description: 'Domestic distribution breakdown by commodity, district, dealer, and volume',
      href: '/reports/sales',
      icon: FileText,
      metric: `Sales: ${formatCompactBDT(summary.netSalesBDT)}`,
    },
    {
      title: 'Import Landed Cost Analysis',
      description: 'Weight-allocated breakdown of freight, insurance, customs assessment, port and C&F',
      href: '/reports/import-costs',
      icon: Ship,
      metric: 'Landed Breakdown',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#202833]">Financial & Operational Reports Hub</h2>
        <p className="text-xs text-[#697586]">
          Double-entry statements, trade aging matrices, and inventory valuation derived from central ledger
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((report) => {
          const Icon = report.icon
          return (
            <Card
              key={report.href}
              className="cursor-pointer transition-all hover:border-[#CBD5E1] hover:shadow-sm group"
              onClick={() => navigate(report.href)}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[#EBF0F5] text-[#526B83] flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#526B83] transition-colors" />
                  </div>
                  <h3 className="font-semibold text-sm text-[#202833] group-hover:text-[#526B83] transition-colors leading-snug">
                    {report.title}
                  </h3>
                  <p className="text-xs text-[#697586] leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-[#0F766E]">
                    {report.metric}
                  </span>
                  <span className="text-xs text-[#526B83] font-medium group-hover:underline">
                    Generate &rarr;
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
