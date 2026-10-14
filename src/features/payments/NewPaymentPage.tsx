import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Banknote, Landmark, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockRepo } from '@/services/mockRepository'
import { PaymentRecord, PaymentType } from '@/types'
import { formatBDT } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const NewPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const customers = mockRepo.getCustomers()
  const suppliers = mockRepo.getSuppliers()
  const accounts = mockRepo.getCashBankAccounts()
  const invoices = mockRepo.getSalesInvoices()
  const imports = mockRepo.getImports()

  const [paymentType, setPaymentType] = useState<PaymentType>('Customer Receipt')
  const [partyId, setPartyId] = useState(customers[0]?.id || '')
  const [date, setDate] = useState('2026-03-30')
  const [amountBDT, setAmountBDT] = useState(10000000)
  const [paymentMethod, setPaymentMethod] = useState<'BEFTN / RTGS' | 'Cheque' | 'Cash' | 'Bank Deposit'>('BEFTN / RTGS')
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id || '')
  const [referenceNumber, setReferenceNumber] = useState(`EBL-RTGS-${Math.floor(10000 + Math.random() * 90000)}`)
  const [allocatedId, setAllocatedId] = useState('')
  const [notes, setNotes] = useState('')

  // Party details
  const selectedCustomer = customers.find((c) => c.id === partyId)
  const selectedSupplier = suppliers.find((s) => s.id === partyId)
  const selectedAccount = accounts.find((a) => a.id === bankAccountId)

  // Unpaid invoices for customer
  const dueInvoices = invoices.filter((i) => i.customerId === partyId && i.amountDueBDT > 0)
  // Unpaid imports for supplier
  const dueImports = imports.filter((imp) => imp.supplierId === partyId && imp.balanceDueBDT > 0)

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (amountBDT <= 0) {
      toast.error('Please enter a valid positive payment amount.')
      return
    }

    const partyName =
      paymentType === 'Customer Receipt'
        ? selectedCustomer?.name || 'Customer'
        : selectedSupplier?.name || 'Supplier'

    const allocatedRef =
      paymentType === 'Customer Receipt'
        ? dueInvoices.find((i) => i.id === allocatedId)?.invoiceNumber
        : dueImports.find((i) => i.id === allocatedId)?.importReference

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber:
        paymentType === 'Customer Receipt'
          ? `REC-2026-${Math.floor(100 + Math.random() * 900)}`
          : `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      paymentType,
      partyId,
      partyName,
      date,
      amountBDT,
      paymentMethod,
      bankAccountId,
      bankAccountName: selectedAccount?.accountName || 'Bank Account',
      referenceNumber,
      allocatedInvoiceOrImportId: allocatedId || undefined,
      allocatedReference: allocatedRef,
      notes,
      status: 'Completed',
    }

    mockRepo.savePayment(newPayment)
    dispatch(triggerDataRefresh())
    toast.success(
      `${paymentType} of ${formatBDT(amountBDT)} recorded! Ledger and bank accounts updated.`
    )
    navigate('/payments')
  }

  return (
    <form onSubmit={handleSavePayment} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/payments')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Record Payment / Collection Voucher</h2>
            <p className="text-xs text-[#334155]">
              Post customer bank receipts or international supplier L/C settlements with allocation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/payments')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            Save Voucher
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voucher Classification & Party</CardTitle>
          <CardDescription>Specify whether receiving from customer or disbursing to supplier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Transaction Flow</Label>
              <Select
                value={paymentType}
                onValueChange={(val: any) => {
                  setPaymentType(val)
                  if (val === 'Customer Receipt') {
                    setPartyId(customers[0]?.id || '')
                  } else {
                    setPartyId(suppliers[0]?.id || '')
                  }
                  setAllocatedId('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer Receipt">Customer Receipt (Money In)</SelectItem>
                  <SelectItem value="Supplier Payment">Supplier Payment (Money Out)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label required>
                {paymentType === 'Customer Receipt' ? 'Customer (Dealer)' : 'Supplier (Vendor)'}
              </Label>
              <Select value={partyId} onValueChange={setPartyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Party..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentType === 'Customer Receipt'
                    ? customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} (Due: {formatBDT(c.outstandingDueBDT)})
                        </SelectItem>
                      ))
                    : suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} (Due: {formatBDT(s.balanceDueBDT)})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account & Allocation</CardTitle>
          <CardDescription>Select deposit/disbursement account and link to outstanding bill</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Bank / Cash Account</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.accountName} (Balance: {formatBDT(a.currentBalanceBDT)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label required>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val: any) => setPaymentMethod(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEFTN / RTGS">BEFTN / RTGS Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Bank Cheque</SelectItem>
                  <SelectItem value="Cash">Cash Deposit</SelectItem>
                  <SelectItem value="Bank Deposit">Direct Branch Cash Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Bank Reference / Cheque #</Label>
              <Input
                placeholder="e.g. EBL-RTGS-99011 or CHQ-092812"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Allocate to Specific Invoice or Bill</Label>
              <Select value={allocatedId} onValueChange={setAllocatedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bill to allocate..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- None (General On-Account) --</SelectItem>
                  {paymentType === 'Customer Receipt'
                    ? dueInvoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} (Due: {formatBDT(inv.amountDueBDT)})
                        </SelectItem>
                      ))
                    : dueImports.map((imp) => (
                        <SelectItem key={imp.id} value={imp.id}>
                          {imp.importReference} (Due: {formatBDT(imp.balanceDueBDT)})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes & Remarks</Label>
            <Textarea
              placeholder="Voucher narrative, deposit slip details, purpose of remittance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
