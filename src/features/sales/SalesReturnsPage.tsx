import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { RotateCcw, Plus, CheckCircle, AlertTriangle } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockRepo } from '@/services/mockRepository'
import { SalesReturn } from '@/types'
import { formatDate, formatBDT } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const SalesReturnsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const returns = mockRepo.getSalesReturns()
  const invoices = mockRepo.getSalesInvoices()
  const products = mockRepo.getProducts()

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || '')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [returnedMT, setReturnedMT] = useState(5)
  const [refundAmountBDT, setRefundAmountBDT] = useState(290000)
  const [reason, setReason] = useState('')
  const [restocked, setRestocked] = useState(true)

  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault()
    const inv = invoices.find((i) => i.id === invoiceId)
    const prod = products.find((p) => p.id === productId)

    if (!inv || !prod) {
      toast.error('Invalid invoice or product selection.')
      return
    }

    mockRepo.saveSalesReturn({
      id: `sr-${Date.now()}`,
      returnNumber: `SR-2026-0${returns.length + 1}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      returnDate: new Date().toISOString().split('T')[0],
      productId: prod.id,
      productName: prod.name,
      returnedQuantityMT: returnedMT,
      refundAmountBDT,
      reason: reason || 'Defective packaging or moisture during customer transit',
      restocked,
    })

    dispatch(triggerDataRefresh())
    setModalOpen(false)
    toast.success(`Sales return registered! Customer ledger and stock updated.`)
  }

  const columns: ColumnDef<SalesReturn>[] = [
    {
      accessorKey: 'returnNumber',
      header: 'Return Ref',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('returnNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Original Invoice',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#202833] font-medium">
          {row.getValue('invoiceNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-[#202833]">
          {row.getValue('customerName')}
        </span>
      ),
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => formatDate(row.getValue('returnDate')),
    },
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => (
        <span className="text-xs text-[#202833]">{row.getValue('productName')}</span>
      ),
    },
    {
      accessorKey: 'returnedQuantityMT',
      header: 'Returned (MT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#991B1B]">
          {row.getValue('returnedQuantityMT')} MT
        </span>
      ),
    },
    {
      accessorKey: 'refundAmountBDT',
      header: 'Credit Note (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#202833]">
          {formatBDT(row.getValue('refundAmountBDT'))}
        </span>
      ),
    },
    {
      accessorKey: 'restocked',
      header: 'Restocked?',
      cell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            row.getValue('restocked')
              ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
          }`}
        >
          {row.getValue('restocked') ? 'Yes (Depot)' : 'Scrapped'}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Return Reason',
      cell: ({ row }) => (
        <span className="text-xs text-[#697586] max-w-[200px] truncate block">
          {row.getValue('reason')}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Sales Returns & Credit Notes</h2>
          <p className="text-xs text-[#697586]">
            Manage damaged bag returns, customer ledger credit notes, and warehouse restock
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Log Sales Return
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={returns}
        searchPlaceholder="Search sales returns by invoice, customer, return ref..."
      />

      {/* New Return Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveReturn}>
            <DialogHeader>
              <DialogTitle>Issue Sales Return & Credit Note</DialogTitle>
              <DialogDescription>
                Deducts customer outstanding due and optionally restocks available depot inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label required>Select Original Invoice</Label>
                <Select value={invoiceId} onValueChange={setInvoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.customerName} ({formatBDT(inv.totalAmountBDT)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label required>Returned Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Returned Quantity (MT)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={returnedMT}
                    onChange={(e) => setReturnedMT(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label required>Credit Note Value (BDT)</Label>
                  <Input
                    type="number"
                    value={refundAmountBDT}
                    onChange={(e) => setRefundAmountBDT(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label required>Reason for Return</Label>
                <Textarea
                  placeholder="e.g. Damp bags reported during truck unloading, packaging tear"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="restockCheck"
                  checked={restocked}
                  onChange={(e) => setRestocked(e.target.checked)}
                  className="rounded border-[#DCE2E8] text-[#526B83] focus:ring-[#526B83]"
                />
                <label htmlFor="restockCheck" className="text-xs text-[#202833] cursor-pointer">
                  Restock returned quantity back into Khatunganj Central Depot inventory
                </label>
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
                Issue Credit Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
