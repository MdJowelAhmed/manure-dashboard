import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Printer,
  Ship,
  Banknote,
  Globe,
  Mail,
  Phone,
  Landmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const SupplierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const supplier = mockRepo.getSupplierById(id || '')
  const company = mockRepo.getCompanySettings()

  if (!supplier) {
    return (
      <EmptyState
        title="Supplier Not Found"
        description="The requested international supplier was not found."
        actionLabel="Return to Suppliers"
        onAction={() => navigate('/suppliers')}
      />
    )
  }

  const imports = mockRepo.getImports().filter((imp) => imp.supplierId === supplier.id)
  const payments = mockRepo.getPayments().filter((p) => p.partyId === supplier.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/suppliers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#0F172A]">{supplier.name}</h2>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EBF0F5] text-[#334155] border border-[#CBD5E1]">
                {supplier.country}
              </span>
            </div>
            <p className="text-xs text-[#334155]">
              Code: {supplier.code} • Terms: {supplier.paymentTerms}
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
            Print Vendor Statement
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/imports/new')}
            className="text-xs h-8 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Ship className="h-3.5 w-3.5 mr-1" />
            New Import Consignment
          </Button>
          {supplier.balanceDueBDT > 0 && (
            <Button
              size="sm"
              onClick={() => navigate('/payments/new')}
              className="text-xs h-8 bg-[#0F766E] hover:bg-[#0D655E] text-white"
            >
              <Banknote className="h-3.5 w-3.5 mr-1" />
              Disburse Payment
            </Button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Import Contract Value</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(supplier.totalImportedBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">{imports.length} Shipments Contracted</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Payments Settled (L/C & TT)</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(supplier.totalPaidBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">Disbursed through banking lines</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Outstanding Trade Payable</span>
            <div className="text-xl font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(supplier.balanceDueBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">Sight L/C liability pending settlement</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shipments" className="space-y-4">
        <TabsList className="no-print">
          <TabsTrigger value="shipments">Import Consignments ({imports.length})</TabsTrigger>
          <TabsTrigger value="payments">Disbursements & L/C Settlements ({payments.length})</TabsTrigger>
          <TabsTrigger value="banking">Bank Details & SWIFT</TabsTrigger>
        </TabsList>

        {/* Tab 1: Imports */}
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Shipments from {supplier.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Import Ref</TableHead>
                    <TableHead>BL / Vessel</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Arrival Date</TableHead>
                    <TableHead className="text-right">Total Landed Cost</TableHead>
                    <TableHead className="text-right">Payable Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports.map((imp) => (
                    <TableRow
                      key={imp.id}
                      className="cursor-pointer hover:bg-[#F8FAFC]"
                      onClick={() => navigate(`/imports/${imp.id}`)}
                    >
                      <TableCell className="font-mono font-medium text-[#526B83]">
                        {imp.importReference}
                      </TableCell>
                      <TableCell className="text-xs">
                        {imp.vesselName}
                        <div className="text-[10px] text-[#334155]">BL: {imp.billOfLadingNo}</div>
                      </TableCell>
                      <TableCell>{formatDate(imp.orderDate)}</TableCell>
                      <TableCell>{formatDate(imp.expectedArrivalDate)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {formatBDT(imp.totalImportCostBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[#991B1B]">
                        {imp.balanceDueBDT > 0 ? formatBDT(imp.balanceDueBDT) : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={imp.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payments Disbursed to {supplier.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Issuing Bank Account</TableHead>
                    <TableHead>L/C Settlement Ref</TableHead>
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

        {/* Tab 3: Banking & SWIFT */}
        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>International Banking & Beneficiary Credentials</CardTitle>
              <CardDescription>SWIFT codes and overseas settlement accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[#334155]">Overseas Bank Details & SWIFT:</span>
                  <div className="font-mono font-semibold text-[#0F172A]">{supplier.bankDetails}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[#334155]">Payment Terms:</span>
                  <div className="font-medium text-[#0F172A]">{supplier.paymentTerms}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
                <div className="space-y-1">
                  <span className="text-[#334155]">Contact Person:</span>
                  <div className="font-medium text-[#0F172A]">{supplier.contactPerson}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[#334155]">Official Contact:</span>
                  <div className="font-mono text-[#0F172A]">{supplier.email} • {supplier.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
