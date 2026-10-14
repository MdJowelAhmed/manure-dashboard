import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { WalletCards, Plus, Building, FileText, CheckCircle } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockRepo } from '@/services/mockRepository'
import { ExpenseRecord } from '@/types'
import { formatBDT, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const ExpensesListPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const expenses = mockRepo.getExpenses()
  const accounts = mockRepo.getCashBankAccounts()

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountBDT, 0)

  // New Expense Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [date, setDate] = useState('2026-03-31')
  const [category, setCategory] = useState<ExpenseRecord['category']>(
    'Warehouse Rent & Godown Maintenance'
  )
  const [payee, setPayee] = useState('')
  const [amountBDT, setAmountBDT] = useState(850000)
  const [paymentAccountId, setPaymentAccountId] = useState(accounts[0]?.id || '')
  const [referenceNumber, setReferenceNumber] = useState(`EXP-REF-${Math.floor(1000 + Math.random() * 9000)}`)
  const [notes, setNotes] = useState('')

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payee) {
      toast.error('Please enter the payee name or vendor.')
      return
    }
    if (amountBDT <= 0) {
      toast.error('Please enter a valid expense amount.')
      return
    }

    const selectedAcc = accounts.find((a) => a.id === paymentAccountId)

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2026-0${expenses.length + 1}`,
      date,
      category,
      payee,
      amountBDT,
      paymentAccountId,
      paymentAccountName: selectedAcc?.accountName || 'Bank Account',
      referenceNumber,
      notes,
    }

    mockRepo.saveExpense(newExpense)
    dispatch(triggerDataRefresh())
    setModalOpen(false)
    toast.success(`Expense ${newExpense.expenseNumber} recorded! Bank account balance updated.`)
  }

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: 'expenseNumber',
      header: 'Expense Ref',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('expenseNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'category',
      header: 'Operating Category',
      cell: ({ row }) => (
        <span className="font-medium text-xs text-[#0F172A]">{row.getValue('category')}</span>
      ),
    },
    {
      accessorKey: 'payee',
      header: 'Payee / Vendor',
      cell: ({ row }) => (
        <span className="text-xs text-[#0F172A]">{row.getValue('payee')}</span>
      ),
    },
    {
      accessorKey: 'paymentAccountName',
      header: 'Payment Account',
      cell: ({ row }) => (
        <span className="text-xs text-[#334155]">{row.getValue('paymentAccountName')}</span>
      ),
    },
    {
      accessorKey: 'amountBDT',
      header: 'Amount (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#0F172A] text-right block">
          {formatBDT(row.getValue('amountBDT'))}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Voucher Notes',
      cell: ({ row }) => (
        <span className="text-xs text-[#334155] max-w-[200px] truncate block">
          {row.getValue('notes') || '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Operating Expenses (OPEX)</h2>
          <p className="text-xs text-[#334155]">
            Warehouse godown rent, payroll, depot electricity, and audit fees (segregated from landed cost)
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Record Operating Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Operating Expenses (FY 25-26)</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(totalExpenses)}
            </div>
            <span className="text-[11px] text-[#334155]">{expenses.length} Expense Vouchers</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Warehouse Godown Lease</span>
            <div className="text-xl font-bold font-mono text-[#526B83] mt-0.5">
              {formatBDT(
                expenses
                  .filter((e) => e.category === 'Warehouse Rent & Godown Maintenance')
                  .reduce((s, e) => s + e.amountBDT, 0)
              )}
            </div>
            <span className="text-[11px] text-[#334155]">Khatunganj 15,000 MT shed rent</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Staff Payroll & Allowances</span>
            <div className="text-xl font-bold font-mono text-[#526B83] mt-0.5">
              {formatBDT(
                expenses
                  .filter((e) => e.category === 'Staff Salaries & Allowances')
                  .reduce((s, e) => s + e.amountBDT, 0)
              )}
            </div>
            <span className="text-[11px] text-[#334155]">18 depot and logistics staff</span>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        searchPlaceholder="Search expenses by payee, category, ref..."
      />

      {/* New Expense Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveExpense}>
            <DialogHeader>
              <DialogTitle>Record Operating Expense Voucher</DialogTitle>
              <DialogDescription>
                Posts operating expense to the general ledger and disburses funds from bank/petty cash
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label required>Expense Category</Label>
                <Select
                  value={category}
                  onValueChange={(val: any) => setCategory(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warehouse Rent & Godown Maintenance">
                      Warehouse Rent & Godown Maintenance
                    </SelectItem>
                    <SelectItem value="Staff Salaries & Allowances">
                      Staff Salaries & Allowances
                    </SelectItem>
                    <SelectItem value="Depot Utility & Electricity">
                      Depot Utility & Electricity
                    </SelectItem>
                    <SelectItem value="Professional, Audit & Legal Fees">
                      Professional, Audit & Legal Fees
                    </SelectItem>
                    <SelectItem value="Office Supplies & Communication">
                      Office Supplies & Communication
                    </SelectItem>
                    <SelectItem value="Depot Security & Safety">
                      Depot Security & Safety
                    </SelectItem>
                    <SelectItem value="Bank Charges & Commission">
                      Bank Charges & Commission
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label required>Payee / Vendor Name</Label>
                <Input
                  placeholder="e.g. BPDB Chittagong, Godown Landlord, Security Agency"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Payment Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label required>Amount (BDT)</Label>
                  <Input
                    type="number"
                    value={amountBDT}
                    onChange={(e) => setAmountBDT(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Disbursing Account</Label>
                  <Select
                    value={paymentAccountId}
                    onValueChange={setPaymentAccountId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label required>Cheque / Transaction #</Label>
                  <Input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Voucher Notes & Bill Details</Label>
                <Textarea
                  placeholder="Bill month, invoice reference, purpose of expenditure..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#526B83] hover:bg-[#3E5367] text-white"
              >
                Post Expense Voucher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
