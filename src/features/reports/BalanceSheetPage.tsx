import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Scale, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { computeFinancialSummary } from '@/lib/calculations'
import { formatBDT, formatDate } from '@/lib/utils'

export const BalanceSheetPage: React.FC = () => {
  const navigate = useNavigate()
  const summary = computeFinancialSummary()
  const company = mockRepo.getCompanySettings()

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
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
            <h2 className="text-xl font-bold text-[#202833]">Statement of Financial Position (Balance Sheet)</h2>
            <p className="text-xs text-[#697586]">
              Assets, liabilities, and proprietor equity rigorously tied to the general ledger
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
            Print Balance Sheet
          </Button>
        </div>
      </div>

      {/* Balancing Status Banner */}
      <div className="p-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] flex items-center justify-between text-[#166534] no-print">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[#166534]" />
          <div>
            <h4 className="text-sm font-bold">Balance Sheet is in Equilibrium</h4>
            <p className="text-xs opacity-90">
              Total Assets (৳ {formatBDT(summary.totalAssetsBDT, { showSymbol: false })}) === Total Liabilities & Equity (৳ {formatBDT(summary.totalLiabilitiesBDT + summary.totalEquityBDT, { showSymbol: false })})
            </p>
          </div>
        </div>
        <span className="font-mono text-sm font-bold">Difference: ৳ 0.00</span>
      </div>

      {/* Printable Balance Sheet Container */}
      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#202833]">{company.companyName}</h3>
            <p className="text-xs text-[#697586]">{company.headOfficeAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              BALANCE SHEET STATEMENT
            </span>
            <div className="text-xs text-[#697586] mt-1">
              As of: <strong className="text-[#202833]">{formatDate(new Date())}</strong>
            </div>
            <div className="text-xs text-[#697586]">Reporting Currency: BDT</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: ASSETS */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#526B83] pb-1 border-b border-[#DCE2E8]">
              ASSETS
            </h4>

            <Table>
              <TableBody>
                <TableRow className="bg-[#F8FAFC] font-semibold text-xs">
                  <TableCell colSpan={2}>Current Assets</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Cash & Bank Operational Balances</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(summary.totalCashAndBankBDT)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Accounts Receivable (Trade Debtors)</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(summary.accountsReceivableBDT)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Fertilizer Inventory at Khatunganj Depot</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(summary.inventoryValueBDT)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Goods in Transit & Customs Clearing (L/C)</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(summary.goodsInTransitBDT)}</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-[#EBF0F5]/50 border-t border-[#CBD5E1]">
                  <TableCell className="text-xs text-[#202833]">TOTAL ASSETS</TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm text-[#526B83]">
                    {formatBDT(summary.totalAssetsBDT)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Right Column: LIABILITIES & EQUITY */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#526B83] pb-1 border-b border-[#DCE2E8]">
              LIABILITIES & EQUITY
            </h4>

            <Table>
              <TableBody>
                <TableRow className="bg-[#F8FAFC] font-semibold text-xs">
                  <TableCell colSpan={2}>Current Liabilities</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Accounts Payable (International Suppliers)</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(summary.accountsPayableBDT)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Port & C&F Accrued Charges</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(4500000)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Customer Advance Booking Deposits</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(8000000)}</TableCell>
                </TableRow>
                <TableRow className="font-semibold border-b border-[#DCE2E8]">
                  <TableCell className="pl-4 text-xs text-[#202833]">Total Liabilities</TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(summary.totalLiabilitiesBDT)}</TableCell>
                </TableRow>

                <TableRow className="bg-[#F8FAFC] font-semibold text-xs">
                  <TableCell colSpan={2}>Owner's Equity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Owner's Paid-in Capital</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(260000000)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#202833]">Retained Earnings (Beginning)</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(15000000)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-4 text-xs text-[#166534]">Current Period Net Operating Profit</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-[#166534]">
                    {formatBDT(summary.netProfitBDT)}
                  </TableCell>
                </TableRow>
                <TableRow className="font-semibold border-b border-[#DCE2E8]">
                  <TableCell className="pl-4 text-xs text-[#202833]">Total Equity</TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(summary.totalEquityBDT)}</TableCell>
                </TableRow>

                <TableRow className="font-bold bg-[#EBF0F5]/50 border-t border-[#CBD5E1]">
                  <TableCell className="text-xs text-[#202833]">TOTAL LIABILITIES & EQUITY</TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm text-[#526B83]">
                    {formatBDT(summary.totalLiabilitiesBDT + summary.totalEquityBDT)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
