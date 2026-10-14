import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Receipt, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { SalesInvoice, SalesInvoiceItem, UnitType } from '@/types'
import { formatBDT } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

interface FormLineItem {
  productId: string
  quantity: number
  unit: UnitType
  unitPriceBDT: number
  discountBDT: number
}

export const NewInvoicePage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const customers = mockRepo.getCustomers()
  const products = mockRepo.getProducts()

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '')
  const [invoiceDate, setInvoiceDate] = useState('2026-03-30')
  const [dueDate, setDueDate] = useState('2026-04-29')
  const [deliveryChallanNo, setDeliveryChallanNo] = useState(`DC-2026-${Math.floor(100 + Math.random() * 900)}`)
  const [amountPaidBDT, setAmountPaidBDT] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cheque' | 'Cash'>('Bank Transfer')
  const [taxBDT, setTaxBDT] = useState(0)
  const [notes, setNotes] = useState('')

  // Line items state
  const [items, setItems] = useState<FormLineItem[]>([
    {
      productId: products[0]?.id || '',
      quantity: 100,
      unit: 'MT',
      unitPriceBDT: products[0]?.sellingPricePerMT || 58000,
      discountBDT: 0,
    },
  ])

  const selectedCustomer = customers.find((c) => c.id === customerId)

  // Calculations
  const calculatedItems = items.map((it, idx) => {
    const prod = products.find((p) => p.id === it.productId)
    const kgPerBag = prod?.kgPerBag || 50

    let qtyInMT = it.quantity
    if (it.unit === 'BAG') {
      qtyInMT = (it.quantity * kgPerBag) / 1000
    } else if (it.unit === 'KG') {
      qtyInMT = it.quantity / 1000
    }

    const lineTotal = Math.max(0, it.quantity * it.unitPriceBDT - it.discountBDT)

    return {
      ...it,
      id: `line-${idx}`,
      productName: prod?.name || 'Fertilizer',
      quantityInMT: qtyInMT,
      totalBDT: lineTotal,
      availableStockMT: prod?.stockMT || 0,
    }
  })

  const subtotalBDT = calculatedItems.reduce((sum, it) => sum + it.quantity * it.unitPriceBDT, 0)
  const totalItemDiscountBDT = calculatedItems.reduce((sum, it) => sum + it.discountBDT, 0)
  const totalAmountBDT = subtotalBDT - totalItemDiscountBDT + taxBDT
  const amountDueBDT = Math.max(0, totalAmountBDT - amountPaidBDT)

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: products[0]?.id || '',
        quantity: 50,
        unit: 'MT',
        unitPriceBDT: products[0]?.sellingPricePerMT || 58000,
        discountBDT: 0,
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: keyof FormLineItem, value: any) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }

    // If product changed, update default unit price
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value)
      if (prod) {
        item.unitPriceBDT = prod.sellingPricePerMT
      }
    }

    updated[index] = item
    setItems(updated)
  }

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId) {
      toast.error('Please select a customer.')
      return
    }

    // Check available stock
    for (const line of calculatedItems) {
      if (line.quantityInMT > line.availableStockMT) {
        toast.error(
          `Insufficient stock for ${line.productName}. Requested: ${line.quantityInMT} MT, Available: ${line.availableStockMT} MT.`
        )
        return
      }
    }

    const invoiceNumber = `INV-2026-${100 + mockRepo.getSalesInvoices().length + 1}`

    const invoiceLines: SalesInvoiceItem[] = calculatedItems.map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unit: it.unit,
      quantityInMT: it.quantityInMT,
      unitPriceBDT: it.unitPriceBDT,
      discountBDT: it.discountBDT,
      totalBDT: it.totalBDT,
    }))

    const newInvoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId,
      customerName: selectedCustomer?.name || 'Customer',
      customerDistrict: selectedCustomer?.district || 'Bangladesh',
      invoiceDate,
      dueDate,
      deliveryChallanNo: deliveryChallanNo || `DC-${Date.now()}`,
      items: invoiceLines,
      subtotalBDT,
      discountBDT: totalItemDiscountBDT,
      taxBDT,
      totalAmountBDT,
      amountPaidBDT,
      amountDueBDT,
      paymentMethod,
      status: amountDueBDT === 0 ? 'Paid' : amountPaidBDT > 0 ? 'Partially Paid' : 'Unpaid',
      notes,
      stockDeducted: true,
    }

    mockRepo.saveSalesInvoice(newInvoice)

    // If an initial payment was received, record it
    if (amountPaidBDT > 0) {
      mockRepo.savePayment({
        id: `pay-${Date.now()}`,
        paymentNumber: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
        paymentType: 'Customer Receipt',
        partyId: customerId,
        partyName: selectedCustomer?.name || 'Customer',
        date: invoiceDate,
        amountBDT: amountPaidBDT,
        paymentMethod: paymentMethod === 'Cash' ? 'Cash' : 'BEFTN / RTGS',
        bankAccountId: paymentMethod === 'Cash' ? 'acc-003' : 'acc-001',
        bankAccountName:
          paymentMethod === 'Cash'
            ? 'Khatunganj Central Depot Cash Box'
            : 'Eastern Bank PLC - Operations A/C',
        referenceNumber: `INIT-DEP-${invoiceNumber}`,
        allocatedInvoiceOrImportId: newInvoice.id,
        allocatedReference: invoiceNumber,
        notes: `Initial down payment for invoice ${invoiceNumber}`,
        status: 'Completed',
      })
    }

    dispatch(triggerDataRefresh())
    toast.success(`Sales Invoice ${invoiceNumber} created! Stock deducted from depot.`)
    navigate(`/sales/${newInvoice.id}`)
  }

  return (
    <form onSubmit={handleSubmitInvoice} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/sales')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#202833]">Create Sales Invoice</h2>
            <p className="text-xs text-[#697586]">
              Issue domestic delivery challan and invoice with automatic inventory deduction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/sales')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Receipt className="h-3.5 w-3.5 mr-1" />
            Issue Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Delivery Details</CardTitle>
              <CardDescription>Select dealer and delivery schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Customer</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomer && (
                    <div className="text-[11px] text-[#697586] flex justify-between pt-1">
                      <span>Credit Limit: {formatBDT(selectedCustomer.creditLimitBDT)}</span>
                      <span>Outstanding Due: {formatBDT(selectedCustomer.outstandingDueBDT)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Delivery Challan #</Label>
                  <Input
                    value={deliveryChallanNo}
                    onChange={(e) => setDeliveryChallanNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label required>Payment Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fertilizer Line Items</CardTitle>
                <CardDescription>Select products, packaging units, and contract pricing</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-8 text-xs text-[#526B83]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Line Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculatedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#DCE2E8] bg-[#F8FAFC] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#526B83]">
                      Line Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-[#991B1B] hover:text-[#DC2626] text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <Label required>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(val) => handleUpdateItem(index, 'productId', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (Avail: {p.stockMT} MT)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 text-[11px] text-[#697586]">
                        <span>Available in Depot:</span>
                        <strong className="text-[#202833]">{item.availableStockMT} MT</strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label required>Unit Price (BDT)</Label>
                      <Input
                        type="number"
                        value={item.unitPriceBDT}
                        onChange={(e) =>
                          handleUpdateItem(index, 'unitPriceBDT', Number(e.target.value))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label required>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(index, 'quantity', Number(e.target.value))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label required>Unit</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(val: any) => handleUpdateItem(index, 'unit', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                          <SelectItem value="BAG">BAG (50kg Bag)</SelectItem>
                          <SelectItem value="KG">KG (Kilogram)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Discount (BDT)</Label>
                      <Input
                        type="number"
                        value={item.discountBDT}
                        onChange={(e) =>
                          handleUpdateItem(index, 'discountBDT', Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Line Total</Label>
                      <div className="h-9 px-3 flex items-center font-mono font-bold text-xs bg-white border border-[#DCE2E8] rounded-lg text-[#202833]">
                        {formatBDT(item.totalBDT)}
                      </div>
                    </div>
                  </div>

                  {item.quantityInMT > item.availableStockMT && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[11px] text-[#991B1B]">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Requested quantity ({item.quantityInMT} MT) exceeds available depot stock (
                        {item.availableStockMT} MT).
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Notes & Special Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Transport truck registration numbers, weighing scale certificate, packaging conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Calculation & Payment Summary */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-[#CBD5E1] shadow-sm">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#DCE2E8] pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#202833]">
                <Receipt className="h-4 w-4 text-[#526B83]" />
                Invoice Totals & Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#697586]">Gross Subtotal:</span>
                  <span className="font-mono font-medium">{formatBDT(subtotalBDT)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#697586]">Line Discounts:</span>
                  <span className="font-mono text-[#991B1B]">
                    {totalItemDiscountBDT > 0 ? `-${formatBDT(totalItemDiscountBDT)}` : '৳ 0'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#697586]">Advance Income Tax (AIT):</span>
                  <Input
                    type="number"
                    value={taxBDT}
                    onChange={(e) => setTaxBDT(Number(e.target.value))}
                    className="w-28 h-7 text-xs font-mono text-right"
                  />
                </div>
                <div className="flex justify-between py-2 font-semibold text-base border-t border-[#DCE2E8] pt-2">
                  <span className="text-[#202833]">Grand Total:</span>
                  <span className="font-mono text-[#526B83]">{formatBDT(totalAmountBDT)}</span>
                </div>
              </div>

              {/* Payment Fields */}
              <div className="pt-2 border-t border-[#F1F5F9] space-y-3 text-xs">
                <div className="space-y-1.5">
                  <Label>Initial Amount Paid (BDT)</Label>
                  <Input
                    type="number"
                    value={amountPaidBDT}
                    onChange={(e) => setAmountPaidBDT(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(val: any) => setPaymentMethod(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer (BEFTN / RTGS)</SelectItem>
                      <SelectItem value="Cheque">Bank Cheque</SelectItem>
                      <SelectItem value="Cash">Cash Deposit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DCE2E8] flex justify-between items-center">
                  <span className="font-semibold text-xs text-[#202833]">Outstanding Due:</span>
                  <span className="font-mono font-bold text-sm text-[#991B1B]">
                    {formatBDT(amountDueBDT)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#526B83] hover:bg-[#3E5367] text-white"
              >
                Confirm & Issue Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
