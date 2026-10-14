import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { BookOpen, Plus, Eye, Scale, CheckCircle } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { JournalEntry } from '@/types'
import { formatBDT, formatDate } from '@/lib/utils'

export const JournalsListPage: React.FC = () => {
  const navigate = useNavigate()
  const journals = mockRepo.getJournalEntries()
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null)

  const columns: ColumnDef<JournalEntry>[] = [
    {
      accessorKey: 'entryNumber',
      header: 'Entry #',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#526B83]">
          {row.getValue('entryNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'source',
      header: 'Transaction Source',
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F5F9] border border-[#DCE2E8]">
          {row.getValue('source')}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Narrative / Particulars',
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[340px]">
          <span className="font-medium text-xs text-[#0F172A] truncate">
            {row.original.description}
          </span>
          <span className="text-[11px] text-[#334155]">Ref: {row.original.reference}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalDebitBDT',
      header: 'Debit Total (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#0F172A] text-right block">
          {formatBDT(row.original.totalDebitBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'totalCreditBDT',
      header: 'Credit Total (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#0F172A] text-right block">
          {formatBDT(row.original.totalCreditBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setSelectedJournal(row.original)}
          >
            <Eye className="h-3 w-3 mr-1 text-[#526B83]" />
            Lines
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Double-Entry Journal Entries</h2>
          <p className="text-xs text-[#334155]">
            General journal vouchers with strict debit = credit balancing validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/accounting/trial-balance')}
            className="text-xs h-9"
          >
            <Scale className="h-3.5 w-3.5 mr-1 text-[#526B83]" />
            Trial Balance
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/accounting/journals/new')}
            className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Journal Entry
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={journals}
        searchPlaceholder="Search journal entries by reference, narrative, source..."
      />

      {/* Journal Lines Inspection Modal */}
      {selectedJournal && (
        <Dialog open={!!selectedJournal} onOpenChange={() => setSelectedJournal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="font-mono text-base">
                  {selectedJournal.entryNumber} — {selectedJournal.source}
                </DialogTitle>
                <StatusBadge status={selectedJournal.status} />
              </div>
              <DialogDescription className="text-xs">
                Date: {formatDate(selectedJournal.date)} • Ref: {selectedJournal.reference}
                <div className="text-[#0F172A] font-medium mt-1">
                  {selectedJournal.description}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Party / Ref</TableHead>
                    <TableHead className="text-right">Debit (BDT)</TableHead>
                    <TableHead className="text-right">Credit (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedJournal.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                        {line.accountCode}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-[#0F172A]">
                        {line.accountName}
                      </TableCell>
                      <TableCell className="text-xs text-[#334155]">
                        {line.partyRef || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {line.debitBDT > 0 ? formatBDT(line.debitBDT) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {line.creditBDT > 0 ? formatBDT(line.creditBDT) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8]">
                    <TableCell colSpan={3} className="text-right">
                      Total Balanced:
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
                      {formatBDT(selectedJournal.totalDebitBDT)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
                      {formatBDT(selectedJournal.totalCreditBDT)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
