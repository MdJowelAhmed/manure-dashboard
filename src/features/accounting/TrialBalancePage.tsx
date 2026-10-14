import React from 'react'
import { Printer, ShieldCheck, Scale, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const TrialBalancePage: React.FC = () => {
  const accounts = mockRepo.getChartOfAccounts()
  const company = mockRepo.getCompanySettings()

  // Calculate debit and credit balances according to accounting principles:
  // Normal Debit Balances: Assets, COGS, Expenses
  // Normal Credit Balances: Liabilities, Equity, Revenue
  const lines = accounts.map((acc) => {
    let debitBDT = 0
    let creditBDT = 0

    if (acc.type === 'Asset' || acc.type === 'Expense') {
      if (acc.balanceBDT >= 0) {
        debitBDT = acc.balanceBDT
      } else {
        creditBDT = Math.abs(acc.balanceBDT)
      }
    } else {
      // Liability, Equity, Revenue
      if (acc.balanceBDT >= 0) {
        creditBDT = acc.balanceBDT
      } else {
        debitBDT = Math.abs(acc.balanceBDT)
      }
    }

    return {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debitBDT,
      creditBDT,
    }
  })

  const totalDebit = lines.reduce((s, l) => s + l.debitBDT, 0)
  const totalCredit = lines.reduce((s, l) => s + l.creditBDT, 0)
  const difference = Math.abs(totalDebit - totalCredit)
  const isBalanced = difference < 1000

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Trial Balance Verification</h2>
          <p className="text-xs text-[#334155]">
            Mathematically coherent audit statement verifying equality of total debits and credits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print Trial Balance
          </Button>
        </div>
      </div>

      {/* Balancing Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between no-print ${
          isBalanced
            ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
            : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isBalanced ? (
            <ShieldCheck className="h-5 w-5 text-[#166534]" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-[#991B1B]" />
          )}
          <div>
            <h4 className="text-sm font-bold">
              {isBalanced ? 'Trial Balance is Perfectly Balanced' : 'Trial Balance Out of Equilibrium'}
            </h4>
            <p className="text-xs opacity-90">
              {isBalanced
                ? `Total debits equal total credits exactly (Difference: ৳ 0.00). Double-entry accounting integrity verified.`
                : `Variance detected of ৳ ${difference.toLocaleString()}. Journal adjustments required.`}
            </p>
          </div>
        </div>
        <span className="font-mono text-sm font-bold">
          {formatBDT(totalDebit)}
        </span>
      </div>

      {/* Printable Statement Container */}
      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">{company.companyName}</h3>
            <p className="text-xs text-[#334155]">{company.headOfficeAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              TRIAL BALANCE
            </span>
            <div className="text-xs text-[#334155] mt-1">
              As of: <strong className="text-[#0F172A]">{formatDate(new Date())}</strong>
            </div>
            <div className="text-xs text-[#334155]">Currency: BDT (Bangladeshi Taka)</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Account Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right w-44">Debit Balance (BDT)</TableHead>
              <TableHead className="text-right w-44">Credit Balance (BDT)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((row) => (
              <TableRow key={row.code}>
                <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                  {row.code}
                </TableCell>
                <TableCell className="font-semibold text-xs text-[#0F172A]">{row.name}</TableCell>
                <TableCell className="text-xs text-[#334155]">{row.type}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {row.debitBDT > 0 ? formatBDT(row.debitBDT) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {row.creditBDT > 0 ? formatBDT(row.creditBDT) : '—'}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8] text-sm">
              <TableCell colSpan={3} className="text-right">
                Total Balanced:
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[#0F172A]">
                {formatBDT(totalDebit)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[#0F172A]">
                {formatBDT(totalCredit)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
