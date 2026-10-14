import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, TrendingUp, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { computeFinancialSummary } from '@/lib/calculations'
import { formatBDT, formatDate } from '@/lib/utils'

export const ProfitLossPage: React.FC = () => {
  const navigate = useNavigate()
  const summary = computeFinancialSummary()
  const company = mockRepo.getCompanySettings()
  const expenses = mockRepo.getExpenses()

  // Itemize operating expense categories
  const expenseByCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amountBDT
  })

  return (
    <div className="space-y-6">
      {/* Top Action Bar (No Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#202833]">Statement of Profit or Loss (Income Statement)</h2>
            <p className="text-xs text-[#697586]">
              Coherent derivation from sales invoices, landed-cost COGS, and operational overheads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print Statement
          </Button>
        </div>
      </div>

      {/* Printable Financial Statement Container */}
      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        {/* Statement Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#202833]">{company.companyName}</h3>
            <p className="text-xs text-[#697586]">{company.headOfficeAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              STATEMENT OF PROFIT OR LOSS
            </span>
            <div className="text-xs text-[#697586] mt-1">
              For Period: <strong>01 July 2025 to 30 June 2026</strong>
            </div>
            <div className="text-xs text-[#697586]">All amounts in Bangladeshi Taka (BDT)</div>
          </div>
        </div>

        <Table>
          <TableBody>
            {/* 1. REVENUE */}
            <TableRow className="bg-[#F8FAFC] font-bold text-xs">
              <TableCell colSpan={2} className="text-[#202833] uppercase tracking-wider">
                1. REVENUE FROM DOMESTIC SALES
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#202833]">Gross Domestic Fertilizer Invoices</TableCell>
              <TableCell className="text-right font-mono text-xs">{formatBDT(summary.grossSalesBDT)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#697586]">Less: Sales Returns & Credit Allowances</TableCell>
              <TableCell className="text-right font-mono text-xs text-[#991B1B]">
                {summary.salesReturnsBDT > 0 ? `-${formatBDT(summary.salesReturnsBDT)}` : '৳ 0'}
              </TableCell>
            </TableRow>
            <TableRow className="font-bold border-b-2 border-[#DCE2E8]">
              <TableCell className="pl-6 text-xs text-[#202833]">Net Revenue from Operations</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs text-[#202833]">
                {formatBDT(summary.netSalesBDT)}
              </TableCell>
            </TableRow>

            {/* 2. COST OF GOODS SOLD */}
            <TableRow className="bg-[#F8FAFC] font-bold text-xs">
              <TableCell colSpan={2} className="text-[#202833] uppercase tracking-wider">
                2. COST OF GOODS SOLD (CAPITALIZED LANDED COST)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#697586]">
                Allocated Landed Cost of Fertilizer Delivered (FOB + Freight + Duty + Port + C&F)
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-[#991B1B]">
                -{formatBDT(summary.cogsBDT)}
              </TableCell>
            </TableRow>
            <TableRow className="font-bold bg-[#EBF0F5]/50 border-y border-[#CBD5E1]">
              <TableCell className="text-xs font-bold text-[#202833]">
                GROSS PROFIT (Margin: {summary.grossProfitMargin.toFixed(1)}%)
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-sm text-[#0F766E]">
                {formatBDT(summary.grossProfitBDT)}
              </TableCell>
            </TableRow>

            {/* 3. OPERATING EXPENSES */}
            <TableRow className="bg-[#F8FAFC] font-bold text-xs">
              <TableCell colSpan={2} className="text-[#202833] uppercase tracking-wider">
                3. OPERATING EXPENSES (ADMINISTRATIVE & DEPOT OVERHEAD)
              </TableCell>
            </TableRow>
            {Object.entries(expenseByCategory).map(([cat, amt]) => (
              <TableRow key={cat}>
                <TableCell className="pl-6 text-xs text-[#697586]">{cat}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatBDT(amt)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold border-b-2 border-[#DCE2E8]">
              <TableCell className="pl-6 text-xs text-[#202833]">Total Operating Expenses</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs text-[#991B1B]">
                -{formatBDT(summary.operatingExpensesBDT)}
              </TableCell>
            </TableRow>

            {/* 4. NET PROFIT */}
            <TableRow className="font-bold bg-[#F0FDF4] border-t-2 border-[#166534] text-sm">
              <TableCell className="text-xs font-bold text-[#166534]">
                NET OPERATING PROFIT (Net Margin: {summary.netProfitMargin.toFixed(1)}%)
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-base text-[#166534]">
                {formatBDT(summary.netProfitBDT)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="pt-4 text-xs text-[#697586] border-t border-[#F1F5F9]">
          <p>
            * Note: Fertilizer import ancillary costs (ocean freight, marine insurance, customs duty, port handling, and inland transport)
            are capitalized directly into landed inventory cost and recognized as COGS upon delivery.
          </p>
        </div>
      </div>
    </div>
  )
}
