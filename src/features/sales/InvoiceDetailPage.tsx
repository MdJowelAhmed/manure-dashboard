import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Printer,
  Receipt,
  Banknote,
  RotateCcw,
  CheckCircle,
  Building,
  Calendar,
  FileText,
  Warehouse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const invoice = mockRepo.getSalesInvoiceById(id || '')
  const company = mockRepo.getCompanySettings()

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice Not Found"
        description="The requested sales invoice could not be found."
        actionLabel="Return to Sales"
        onAction={() => navigate('/sales')}
      />
    )
  }

  const customer = mockRepo.getCustomerById(invoice.customerId)

  return (
    <div className="space-y-6">
      {/* Top Controls Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/sales')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold font-mono text-[#202833]">
                {invoice.invoiceNumber}
              </h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-[#697586]">
              Customer: {invoice.customerName} • Challan: {invoice.deliveryChallanNo}
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
            Print / Export PDF
          </Button>
          {invoice.amountDueBDT > 0 && (
            <Button
              size="sm"
              onClick={() => navigate('/payments/new')}
              className="text-xs h-8 bg-[#0F766E] hover:bg-[#0D655E] text-white"
            >
              <Banknote className="h-3.5 w-3.5 mr-1" />
              Record Collection Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 shadow-xs space-y-6 print-card">
        {/* Invoice Letterhead */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#DCE2E8]">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#526B83] text-white flex items-center justify-center font-bold text-sm">
                M
              </div>
              <h3 className="text-lg font-bold text-[#202833]">{company.companyName}</h3>
            </div>
            <p className="text-xs text-[#697586] mt-1 max-w-sm">
              {company.headOfficeAddress}
            </p>
            <div className="text-[11px] text-[#697586] mt-1 space-x-3">
              <span>BIN: {company.binNumber}</span>
              <span>TIN: {company.tinNumber}</span>
              <span>Trade Lic: {company.tradeLicense}</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              COMMERCIAL SALES INVOICE
            </span>
            <div className="text-xl font-bold font-mono text-[#202833] mt-0.5">
              {invoice.invoiceNumber}
            </div>
            <div className="text-xs text-[#697586] mt-1 space-y-0.5">
              <div>Invoice Date: <strong className="text-[#202833]">{formatDate(invoice.invoiceDate)}</strong></div>
              <div>Due Date: <strong className="text-[#202833]">{formatDate(invoice.dueDate)}</strong></div>
              <div>Delivery Challan: <strong className="font-mono text-[#202833]">{invoice.deliveryChallanNo}</strong></div>
            </div>
          </div>
        </div>

        {/* Bill To & Dispatch Depot Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE2E8] space-y-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#94A3B8]">
              Bill To / Consignee:
            </span>
            <h4 className="font-semibold text-sm text-[#202833]">{invoice.customerName}</h4>
            <p className="text-[#697586]">{customer?.address || invoice.customerDistrict}</p>
            <div className="text-[#697586] pt-1">
              <span>Contact: {customer?.contactPerson}</span> • <span>Phone: {customer?.phone}</span>
            </div>
            {customer?.tradeLicenseNo && (
              <div className="text-[11px] text-[#697586]">
                Trade Lic: {customer.tradeLicenseNo}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE2E8] space-y-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#94A3B8]">
              Dispatch Warehouse & Logistics:
            </span>
            <h4 className="font-semibold text-sm text-[#202833]">{company.warehouseName}</h4>
            <p className="text-[#697586]">{company.warehouseAddress}</p>
            <div className="text-[#697586] pt-1">
              <span>Warehouse Status: Stock Deducted & Dispatched</span>
            </div>
            <div className="text-[11px] text-[#697586]">
              Payment Terms: {invoice.paymentMethod || 'Bank Transfer / RTGS'}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-lg border border-[#DCE2E8] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Product Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Unit Price (BDT)</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total Amount (BDT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((it, idx) => (
                <TableRow key={it.id}>
                  <TableCell className="text-xs text-[#697586] font-mono">{idx + 1}</TableCell>
                  <TableCell className="font-medium text-xs text-[#202833]">
                    {it.productName}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">
                    {it.quantity}
                  </TableCell>
                  <TableCell className="text-xs text-[#697586]">{it.unit}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ৳ {it.unitPriceBDT.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#697586]">
                    {it.discountBDT > 0 ? `৳ ${it.discountBDT.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-[#202833]">
                    {formatBDT(it.totalBDT)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Invoice Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
          <div className="max-w-md text-xs text-[#697586] space-y-1">
            <span className="font-semibold text-[#202833]">Notes / Declarations:</span>
            <p className="leading-relaxed">
              {invoice.notes ||
                'Fertilizer delivered in original importer bags. Please verify bag count and quality upon gate pass clearance. Outstanding dues are payable via Eastern Bank PLC RTGS.'}
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#697586]">Subtotal:</span>
              <span className="font-mono font-medium">{formatBDT(invoice.subtotalBDT)}</span>
            </div>
            {invoice.discountBDT > 0 && (
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#697586]">Discount:</span>
                <span className="font-mono text-[#991B1B]">-{formatBDT(invoice.discountBDT)}</span>
              </div>
            )}
            {invoice.taxBDT > 0 && (
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#697586]">Advance Tax (AIT):</span>
                <span className="font-mono font-medium">{formatBDT(invoice.taxBDT)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm font-bold border-t border-[#DCE2E8]">
              <span className="text-[#202833]">Grand Total (BDT):</span>
              <span className="font-mono text-[#526B83]">{formatBDT(invoice.totalAmountBDT)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-[#F1F5F9] text-[#166534]">
              <span>Amount Paid:</span>
              <span className="font-mono font-bold">{formatBDT(invoice.amountPaidBDT)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm font-bold text-[#991B1B]">
              <span>Remaining Due:</span>
              <span className="font-mono">{formatBDT(invoice.amountDueBDT)}</span>
            </div>
          </div>
        </div>

        {/* Linked Double-Entry Journal Entry Box (Shown on screen) */}
        <div className="pt-6 border-t border-[#DCE2E8] no-print space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#202833] flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#526B83]" />
              Linked Accounting Entries (Automated Journal)
            </span>
            <span className="text-[11px] text-[#697586]">Source: Sales Invoice Posting</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#DCE2E8] bg-[#F8FAFC]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit (BDT)</TableHead>
                  <TableHead className="text-right">Credit (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-xs">
                    1100 - Accounts Receivable ({invoice.customerName})
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatBDT(invoice.totalAmountBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">—</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-xs">
                    4010 - Domestic Fertilizer Sales
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">—</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatBDT(invoice.totalAmountBDT)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Signature Line for Print */}
        <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs text-[#697586] print-only hidden">
          <div>
            <div className="border-t border-[#CBD5E1] pt-1">Received in Good Condition (Customer)</div>
          </div>
          <div>
            <div className="border-t border-[#CBD5E1] pt-1">Authorized Signatory (Meridian Business)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
