import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Banknote, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { computeFinancialSummary } from '@/lib/calculations'
import { formatBDT, formatDate } from '@/lib/utils'

export const CashFlowPage: React.FC = () => {
  const navigate = useNavigate()
  const summary = computeFinancialSummary()
  const company = mockRepo.getCompanySettings()
  const payments = mockRepo.getPayments()
  const expenses = mockRepo.getExpenses()

  const customerReceipts = payments
    .filter((p) => p.paymentType === 'Customer Receipt')
    .reduce((s, p) => s + p.amountBDT, 0)

  const supplierPayments = payments
    .filter((p) => p.paymentType === 'Supplier Payment')
    .reduce((s, p) => s + p.amountBDT, 0)

  const opexPaid = expenses.reduce((s, e) => s + e.amountBDT, 0)
  const netOperatingCash = customerReceipts - supplierPayments - opexPaid

  const openingCash = 186000000 // Capital & beginning balance
  const closingCash = openingCash + netOperatingCash

  return (
    <div className="space-y-6">
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
            <h2 className="text-xl font-bold text-[#202833]">Statement of Cash Flows</h2>
            <p className="text-xs text-[#697586]">
              Direct cash inflows from dealer collections and outflows for import procurement and expenses
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
            Print Cash Flow
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#202833]">{company.companyName}</h3>
            <p className="text-xs text-[#697586]">{company.headOfficeAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              STATEMENT OF CASH FLOWS
            </span>
            <div className="text-xs text-[#697586] mt-1">
              For Period: <strong>01 July 2025 to 30 June 2026</strong>
            </div>
            <div className="text-xs text-[#697586]">All figures in Bangladeshi Taka (BDT)</div>
          </div>
        </div>

        <Table>
          <TableBody>
            {/* 1. Operating Activities */}
            <TableRow className="bg-[#F8FAFC] font-bold text-xs">
              <TableCell colSpan={2} className="text-[#202833] uppercase tracking-wider">
                1. CASH FLOWS FROM OPERATING ACTIVITIES
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#202833]">Cash Received from Domestic Fertilizer Dealers</TableCell>
              <TableCell className="text-right font-mono text-xs text-[#166534]">
                +{formatBDT(customerReceipts)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#697586]">Cash Paid to International Fertilizer Manufacturers (L/Cs)</TableCell>
              <TableCell className="text-right font-mono text-xs text-[#991B1B]">
                -{formatBDT(supplierPayments)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#697586]">Cash Paid for Depot Rent, Salaries & Operating Overhead</TableCell>
              <TableCell className="text-right font-mono text-xs text-[#991B1B]">
                -{formatBDT(opexPaid)}
              </TableCell>
            </TableRow>
            <TableRow className="font-bold border-b-2 border-[#DCE2E8]">
              <TableCell className="pl-6 text-xs text-[#202833]">Net Cash from Operating Activities</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">
                {netOperatingCash >= 0 ? `+${formatBDT(netOperatingCash)}` : `-${formatBDT(Math.abs(netOperatingCash))}`}
              </TableCell>
            </TableRow>

            {/* 2. Investing & Financing */}
            <TableRow className="bg-[#F8FAFC] font-bold text-xs">
              <TableCell colSpan={2} className="text-[#202833] uppercase tracking-wider">
                2. CASH FLOWS FROM FINANCING ACTIVITIES
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#202833]">Owner Capital Contribution</TableCell>
              <TableCell className="text-right font-mono text-xs">৳ 0</TableCell>
            </TableRow>

            {/* Reconciliation */}
            <TableRow className="font-bold bg-[#EBF0F5]/50 border-t-2 border-[#CBD5E1] text-xs">
              <TableCell className="text-xs font-bold text-[#202833]">NET MOVEMENT IN CASH & CASH EQUIVALENTS</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">
                {netOperatingCash >= 0 ? `+${formatBDT(netOperatingCash)}` : `-${formatBDT(Math.abs(netOperatingCash))}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-6 text-xs text-[#697586]">Cash & Bank Balances at Beginning of Period</TableCell>
              <TableCell className="text-right font-mono text-xs">{formatBDT(openingCash)}</TableCell>
            </TableRow>
            <TableRow className="font-bold bg-[#F0FDF4] border-t border-[#166534] text-sm text-[#166534]">
              <TableCell className="text-xs font-bold">CLOSING CASH & BANK BALANCES (RECONCILED)</TableCell>
              <TableCell className="text-right font-mono font-bold text-sm">
                {formatBDT(summary.totalCashAndBankBDT)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
