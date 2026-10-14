import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { FileText, Filter, Calendar } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

interface LedgerRow {
  id: string
  date: string
  journalRef: string
  source: string
  description: string
  debitBDT: number
  creditBDT: number
  balanceBDT: number
}

export const GeneralLedgerPage: React.FC = () => {
  const accounts = mockRepo.getChartOfAccounts()
  const journals = mockRepo.getJournalEntries()

  const [selectedAccountCode, setSelectedAccountCode] = useState(accounts[0]?.code || '1020')
  const activeAccount = accounts.find((a) => a.code === selectedAccountCode)

  // Construct ledger transactions for the chosen account
  const accountRows: LedgerRow[] = []
  let runningBalance = 0

  journals.forEach((jrn) => {
    jrn.lines.forEach((l) => {
      if (l.accountCode === selectedAccountCode) {
        if (activeAccount?.type === 'Asset' || activeAccount?.type === 'Expense') {
          runningBalance += l.debitBDT - l.creditBDT
        } else {
          runningBalance += l.creditBDT - l.debitBDT
        }

        accountRows.push({
          id: `${jrn.id}-${l.id}`,
          date: jrn.date,
          journalRef: jrn.entryNumber,
          source: jrn.source,
          description: jrn.description,
          debitBDT: l.debitBDT,
          creditBDT: l.creditBDT,
          balanceBDT: runningBalance,
        })
      }
    })
  })

  // Sort chronological
  accountRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalDebit = accountRows.reduce((s, r) => s + r.debitBDT, 0)
  const totalCredit = accountRows.reduce((s, r) => s + r.creditBDT, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">General Ledger (GL)</h2>
          <p className="text-xs text-[#334155]">
            Detailed transaction history and running balances per chart of accounts code
          </p>
        </div>

        {/* Account Selector */}
        <div className="w-full sm:w-80">
          <Select value={selectedAccountCode} onValueChange={setSelectedAccountCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select account..." />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.code} value={acc.code}>
                  {acc.code} - {acc.name} ({acc.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Account Balance Summary Card */}
      {activeAccount && (
        <Card className="bg-white border-[#DCE2E8]">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#334155]">Account Particulars</span>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">
                {activeAccount.code} — {activeAccount.name}
              </h3>
              <p className="text-xs text-[#334155] mt-0.5">{activeAccount.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] text-[#334155]">Classification</span>
                <div className="text-xs font-semibold text-[#526B83]">{activeAccount.type}</div>
              </div>
              <div>
                <span className="text-[11px] text-[#334155]">Ledger Closing Balance</span>
                <div className="text-lg font-bold font-mono text-[#0F172A]">
                  {formatBDT(activeAccount.balanceBDT)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Movement Ledger</CardTitle>
          <CardDescription>
            Audit entries posting to {activeAccount?.code} - {activeAccount?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {accountRows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC]">
                  <TableHead>Posting Date</TableHead>
                  <TableHead>Journal Ref</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Description / Narrative</TableHead>
                  <TableHead className="text-right">Debit (BDT)</TableHead>
                  <TableHead className="text-right">Credit (BDT)</TableHead>
                  <TableHead className="text-right">Running Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{formatDate(row.date)}</TableCell>
                    <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                      {row.journalRef}
                    </TableCell>
                    <TableCell className="text-xs text-[#334155]">{row.source}</TableCell>
                    <TableCell className="text-xs text-[#0F172A] max-w-[280px]">
                      {row.description}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {row.debitBDT > 0 ? formatBDT(row.debitBDT) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {row.creditBDT > 0 ? formatBDT(row.creditBDT) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-[#0F172A]">
                      {formatBDT(row.balanceBDT)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-[#F8FAFC] font-bold border-t-2 border-[#DCE2E8]">
                  <TableCell colSpan={4} className="text-right text-xs">Total Movements:</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(totalDebit)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBDT(totalCredit)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#526B83]">
                    {formatBDT(activeAccount?.balanceBDT || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-[#334155]">
              No transactions posted for this account code yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
