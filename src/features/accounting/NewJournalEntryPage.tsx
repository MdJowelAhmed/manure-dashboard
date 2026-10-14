import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { JournalEntry, JournalLine } from '@/types'
import { formatBDT } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

interface FormLine {
  id: string
  accountCode: string
  debitBDT: number
  creditBDT: number
  partyRef: string
}

export const NewJournalEntryPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const accounts = mockRepo.getChartOfAccounts()

  const [date, setDate] = useState('2026-03-31')
  const [reference, setReference] = useState(`MAN-JRN-${Math.floor(100 + Math.random() * 900)}`)
  const [description, setDescription] = useState('')
  const [source, setSource] = useState<JournalEntry['source']>('Manual Journal')

  const [lines, setLines] = useState<FormLine[]>([
    {
      id: '1',
      accountCode: '1020', // Eastern Bank
      debitBDT: 1500000,
      creditBDT: 0,
      partyRef: 'Deposit Remittance',
    },
    {
      id: '2',
      accountCode: '3010', // Owner's Capital
      debitBDT: 0,
      creditBDT: 1500000,
      partyRef: "Owner's Capital Contribution",
    },
  ])

  // Live Totals & Balance Verification
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debitBDT) || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.creditBDT) || 0), 0)
  const difference = totalDebit - totalCredit
  const isBalanced = Math.abs(difference) < 0.01 && totalDebit > 0

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: `line-${Date.now()}`,
        accountCode: accounts[0]?.code || '1010',
        debitBDT: 0,
        creditBDT: 0,
        partyRef: '',
      },
    ])
  }

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error('A double-entry journal entry must have at least two account lines.')
      return
    }
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleUpdateLine = (index: number, field: keyof FormLine, value: any) => {
    const updated = [...lines]
    updated[index] = { ...updated[index], [field]: value }
    setLines(updated)
  }

  const handlePostJournal = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isBalanced) {
      toast.error(
        `Posting Denied: Total debits (৳ ${totalDebit.toLocaleString()}) do not equal total credits (৳ ${totalCredit.toLocaleString()}). Difference: ৳ ${Math.abs(
          difference
        ).toLocaleString()}`
      )
      return
    }

    if (!description) {
      toast.error('Please enter a description for this journal entry.')
      return
    }

    const journalLines: JournalLine[] = lines.map((l) => {
      const acc = accounts.find((a) => a.code === l.accountCode)
      return {
        id: l.id,
        accountCode: l.accountCode,
        accountName: acc?.name || 'General Ledger Account',
        debitBDT: Number(l.debitBDT) || 0,
        creditBDT: Number(l.creditBDT) || 0,
        partyRef: l.partyRef || undefined,
      }
    })

    const entryNumber = `JRN-2026-00${mockRepo.getJournalEntries().length + 1}`

    const result = mockRepo.saveJournalEntry({
      id: `jrn-${Date.now()}`,
      entryNumber,
      date,
      source,
      reference,
      description,
      lines: journalLines,
      totalDebitBDT: totalDebit,
      totalCreditBDT: totalCredit,
      status: 'Posted',
    })

    if (!result.success) {
      toast.error(result.error || 'Failed posting journal.')
      return
    }

    dispatch(triggerDataRefresh())
    toast.success(`Journal Entry ${entryNumber} successfully balanced and posted!`)
    navigate('/accounting/journals')
  }

  return (
    <form onSubmit={handlePostJournal} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/accounting/journals')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Post Double-Entry Journal</h2>
            <p className="text-xs text-[#334155]">
              Real-time balance enforcement: Total debits must strictly equal total credits
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/accounting/journals')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!isBalanced}
            className={`text-white ${
              isBalanced ? 'bg-[#526B83] hover:bg-[#3E5367]' : 'bg-[#94A3B8] cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Post Journal Entry
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Header & Source Particulars</CardTitle>
          <CardDescription>Document reference and accounting voucher narrative</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label required>Posting Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label required>Voucher Reference #</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label required>Source Category</Label>
              <Select
                value={source}
                onValueChange={(val: any) => setSource(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual Journal">Manual Adjusting Journal</SelectItem>
                  <SelectItem value="Import Purchase">Import Purchase Voucher</SelectItem>
                  <SelectItem value="Sales Invoice">Sales Invoice Posting</SelectItem>
                  <SelectItem value="Customer Receipt">Customer Receipt Voucher</SelectItem>
                  <SelectItem value="Supplier Payment">Supplier Settlement Voucher</SelectItem>
                  <SelectItem value="Operating Expense">Operating Expense Voucher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label required>Journal Narrative / Description</Label>
            <Textarea
              placeholder="e.g. Owner capital infusion via Eastern Bank wire transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Lines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Double-Entry Account Lines</CardTitle>
            <CardDescription>Assign debit and credit movements across chart of accounts</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLine}
            className="text-xs h-8 text-[#526B83]"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Account Line
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="w-64">General Ledger Account</TableHead>
                <TableHead>Party / Reference Detail</TableHead>
                <TableHead className="text-right w-44">Debit (BDT)</TableHead>
                <TableHead className="text-right w-44">Credit (BDT)</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, idx) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Select
                      value={line.accountCode}
                      onValueChange={(val) => handleUpdateLine(idx, 'accountCode', val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                  </TableCell>

                  <TableCell>
                    <Input
                      placeholder="Optional notes / party ref"
                      value={line.partyRef}
                      onChange={(e) => handleUpdateLine(idx, 'partyRef', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      value={line.debitBDT || ''}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleUpdateLine(idx, 'debitBDT', Number(e.target.value))
                      }
                      className="h-8 text-xs font-mono text-right"
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      value={line.creditBDT || ''}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleUpdateLine(idx, 'creditBDT', Number(e.target.value))
                      }
                      className="h-8 text-xs font-mono text-right"
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lines.length <= 2}
                      className="text-[#991B1B] hover:text-[#DC2626] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals & Real-Time Balancing Status Row */}
              <TableRow className="bg-[#F8FAFC] font-semibold border-t-2 border-[#DCE2E8]">
                <TableCell colSpan={2} className="text-right text-xs text-[#0F172A]">
                  Double-Entry Totals:
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-xs text-[#0F172A]">
                  {formatBDT(totalDebit)}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-xs text-[#0F172A]">
                  {formatBDT(totalCredit)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Real-Time Balance Difference Indicator */}
          <div className="p-4 border-t border-[#DCE2E8] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {isBalanced ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#166534]">
                <ShieldCheck className="h-4 w-4" />
                <span>Journal Balanced (Difference: ৳ 0.00). Ready for posting.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#991B1B]">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Unbalanced Entry! Debits and Credits must be equal. Out of balance by:{' '}
                  <strong className="font-mono">৳ {Math.abs(difference).toLocaleString()}</strong>
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isBalanced}
              className={`text-white text-xs h-9 ${
                isBalanced
                  ? 'bg-[#526B83] hover:bg-[#3E5367]'
                  : 'bg-[#94A3B8] cursor-not-allowed opacity-60'
              }`}
            >
              Post Journal Voucher
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
