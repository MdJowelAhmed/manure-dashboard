import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Printer,
  Receipt,
  Banknote,
  RotateCcw,
  Building,
  Phone,
  Mail,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customer = mockRepo.getCustomerById(id || '')
  const company = mockRepo.getCompanySettings()

  if (!customer) {
    return (
      <EmptyState
        title="Customer Not Found"
        description="The requested dealer does not exist in the database."
        actionLabel="Return to Customers"
        onAction={() => navigate('/customers')}
      />
    )
  }

  const invoices = mockRepo
    .getSalesInvoices()
    .filter((inv) => inv.customerId === customer.id)

  const payments = mockRepo
    .getPayments()
    .filter((p) => p.partyId === customer.id)

  const returns = mockRepo
    .getSalesReturns()
    .filter((r) => r.customerId === customer.id)

  // Build unified customer running ledger
  interface LedgerEntry {
    date: string
    ref: string
    particulars: string
    debitBDT: number // invoice amounts (increase due)
    creditBDT: number // payment & returns (decrease due)
    balanceBDT: number
  }

  const ledgerRaw: { date: string; ref: string; particulars: string; debit: number; credit: number }[] = []
  invoices.forEach((inv) => {
    ledgerRaw.push({
      date: inv.invoiceDate,
      ref: inv.invoiceNumber,
      particulars: `Sales Invoice - ${inv.items.map((it) => `${it.quantity} ${it.unit} ${it.productName}`).join(', ')}`,
      debit: inv.totalAmountBDT,
      credit: 0,
    })
  })

  payments.forEach((p) => {
    ledgerRaw.push({
      date: p.date,
      ref: p.paymentNumber,
      particulars: `Payment Received (${p.paymentMethod}) - Ref: ${p.referenceNumber}`,
      debit: 0,
      credit: p.amountBDT,
    })
  })

  returns.forEach((r) => {
    ledgerRaw.push({
      date: r.returnDate,
      ref: r.returnNumber,
      particulars: `Sales Return Credit Note - ${r.productName} (${r.returnedQuantityMT} MT)`,
      debit: 0,
      credit: r.refundAmountBDT,
    })
  })

  // Sort chronological
  ledgerRaw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let currentBalance = 0
  const ledgerEntries: LedgerEntry[] = ledgerRaw.map((entry) => {
    currentBalance += entry.debit - entry.credit
    return {
      date: entry.date,
      ref: entry.ref,
      particulars: entry.particulars,
      debitBDT: entry.debit,
      creditBDT: entry.credit,
      balanceBDT: currentBalance,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header (No print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/customers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#0F172A]">{customer.name}</h2>
              <StatusBadge status={customer.overdueStatus} />
            </div>
            <p className="text-xs text-[#334155]">
              Code: {customer.code} • District: {customer.district} • Trade Lic: {customer.tradeLicenseNo}
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
            Print Ledger Statement
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/sales/new')}
            className="text-xs h-8 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Receipt className="h-3.5 w-3.5 mr-1" />
            New Sales Invoice
          </Button>
          {customer.outstandingDueBDT > 0 && (
            <Button
              size="sm"
              onClick={() => navigate('/payments/new')}
              className="text-xs h-8 bg-[#0F766E] hover:bg-[#0D655E] text-white"
            >
              <Banknote className="h-3.5 w-3.5 mr-1" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Invoiced Volume</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(customer.totalSalesBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">{invoices.length} Invoices Issued</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Paid to Date</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(customer.totalPaidBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">Settled via bank transfers</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Outstanding Due Balance</span>
            <div className="text-xl font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(customer.outstandingDueBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">Credit Limit: {formatBDT(customer.creditLimitBDT)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Credit Utilization</span>
            <div className="text-xl font-bold font-mono text-[#526B83] mt-0.5">
              {((customer.outstandingDueBDT / customer.creditLimitBDT) * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-[#334155]">Of authorized credit ceiling</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="statement" className="space-y-4">
        <TabsList className="no-print">
          <TabsTrigger value="statement">Customer Ledger Statement</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Receipts & Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
          <TabsTrigger value="details">Company & Contact Info</TabsTrigger>
        </TabsList>

        {/* Tab 1: Printable Ledger Statement */}
        <TabsContent value="statement" className="space-y-4">
          <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
            {/* Statement Header */}
            <div className="flex justify-between items-start pb-6 border-b border-[#DCE2E8]">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">{company.companyName}</h3>
                <p className="text-xs text-[#334155]">{company.headOfficeAddress}</p>
                <p className="text-[11px] text-[#334155] mt-1">
                  Khatunganj Central Depot • Phone: {company.phone}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
                  STATEMENT OF ACCOUNT
                </span>
                <div className="text-sm font-bold text-[#0F172A] mt-1">{customer.name}</div>
                <div className="text-xs text-[#334155]">Code: {customer.code}</div>
                <div className="text-xs text-[#334155]">
                  As of: <strong className="text-[#0F172A]">{formatDate(new Date())}</strong>
                </div>
              </div>
            </div>

            {/* Statement Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC]">
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Particulars</TableHead>
                  <TableHead className="text-right">Debit (BDT)</TableHead>
                  <TableHead className="text-right">Credit (BDT)</TableHead>
                  <TableHead className="text-right">Balance Due (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-mono text-xs font-medium text-[#526B83]">
                      {entry.ref}
                    </TableCell>
                    <TableCell className="text-xs text-[#0F172A] max-w-[320px]">
                      {entry.particulars}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {entry.debitBDT > 0 ? formatBDT(entry.debitBDT) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#166534]">
                      {entry.creditBDT > 0 ? formatBDT(entry.creditBDT) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-[#0F172A]">
                      {formatBDT(entry.balanceBDT)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8]">
                  <TableCell colSpan={3} className="text-right">Closing Outstanding Balance Due:</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatBDT(customer.totalSalesBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-[#166534]">
                    {formatBDT(customer.totalPaidBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm text-[#991B1B]">
                    {formatBDT(customer.outstandingDueBDT)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices Issued to {customer.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-[#F8FAFC]"
                      onClick={() => navigate(`/sales/${inv.id}`)}
                    >
                      <TableCell className="font-mono font-medium text-[#526B83]">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {formatBDT(inv.totalAmountBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[#166534]">
                        {formatBDT(inv.amountPaidBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[#991B1B]">
                        {inv.amountDueBDT > 0 ? formatBDT(inv.amountDueBDT) : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment & Collection Receipts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Bank Ref #</TableHead>
                    <TableHead className="text-right">Amount (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-medium text-[#526B83]">
                        {p.paymentNumber}
                      </TableCell>
                      <TableCell>{formatDate(p.date)}</TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell className="text-xs text-[#334155]">{p.bankAccountName}</TableCell>
                      <TableCell className="font-mono text-xs">{p.referenceNumber}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-[#166534]">
                        {formatBDT(p.amountBDT)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Details */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Contact & Registration Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[#334155]">Business Address:</span>
                  <div className="font-medium text-[#0F172A]">{customer.address}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[#334155]">District / Region:</span>
                  <div className="font-medium text-[#0F172A]">{customer.district}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
                <div className="space-y-1">
                  <span className="text-[#334155]">Trade License #:</span>
                  <div className="font-mono text-[#0F172A]">{customer.tradeLicenseNo}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[#334155]">Credit Limit:</span>
                  <div className="font-mono font-bold text-[#0F172A]">
                    {formatBDT(customer.creditLimitBDT)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
