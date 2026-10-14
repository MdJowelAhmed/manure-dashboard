import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Banknote, ArrowDownLeft, ArrowUpRight, Plus, Building } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const CashBankPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const accounts = mockRepo.getCashBankAccounts()
  const payments = mockRepo.getPayments()
  const expenses = mockRepo.getExpenses()

  const totalLiquidity = accounts.reduce((sum, a) => sum + a.currentBalanceBDT, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Cash & Bank Account Balances</h2>
          <p className="text-xs text-[#334155]">
            Treasury accounts, operational bank books, import L/C lines, and Khatunganj depot petty cash
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/payments/new')}
            className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Record Payment / Receipt
          </Button>
        </div>
      </div>

      {/* Total Liquidity Callout Banner */}
      <div className="p-5 rounded-xl border border-[#DCE2E8] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs text-[#334155]">Total Liquid Treasury Funds</span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-0.5">
            {formatBDT(totalLiquidity)}
          </div>
          <span className="text-xs text-[#166534]">
            Reconciled with General Ledger Cash & Bank accounts (1010, 1020, 1030)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            Solvent & Active
          </span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <Card key={acc.id} className="relative overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#334155]">
                  {acc.accountType} Account
                </span>
                <div className="h-7 w-7 rounded-md bg-[#F1F5F9] flex items-center justify-center text-[#526B83]">
                  {acc.accountType === 'Bank' ? (
                    <Landmark className="h-4 w-4" />
                  ) : (
                    <Banknote className="h-4 w-4" />
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0F172A] leading-tight">{acc.accountName}</h4>
                <p className="text-xs font-mono text-[#526B83] mt-0.5">{acc.accountNumber}</p>
                <p className="text-[11px] text-[#334155] mt-0.5">{acc.branch}</p>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9]">
                <span className="text-[11px] text-[#334155]">Current Balance:</span>
                <div className="text-lg font-bold font-mono text-[#0F172A]">
                  {formatBDT(acc.currentBalanceBDT)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Cash & Bank Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Banking Transactions & Vouchers</CardTitle>
          <CardDescription>
            Chronological audit of deposits, collections, supplier disbursements, and operating expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Voucher #</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Party / Payee</TableHead>
                <TableHead>Method / Ref</TableHead>
                <TableHead className="text-right">Inflow (Deposit)</TableHead>
                <TableHead className="text-right">Outflow (Payment)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const isReceipt = p.paymentType === 'Customer Receipt'
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{formatDate(p.date)}</TableCell>
                    <TableCell className="font-mono text-xs font-medium text-[#526B83]">
                      {p.paymentNumber}
                    </TableCell>
                    <TableCell className="text-xs">{p.bankAccountName}</TableCell>
                    <TableCell className="font-medium text-xs text-[#0F172A]">
                      {p.partyName}
                    </TableCell>
                    <TableCell className="text-xs text-[#334155]">
                      {p.paymentMethod} • <span className="font-mono">{p.referenceNumber}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-[#166534]">
                      {isReceipt ? formatBDT(p.amountBDT) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-[#0F172A]">
                      {!isReceipt ? formatBDT(p.amountBDT) : '—'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
