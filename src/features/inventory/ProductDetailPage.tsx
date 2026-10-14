import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  TrendingUp,
  RotateCcw,
  Scale,
  Calendar,
  Layers,
  FileText,
  Warehouse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = mockRepo.getProductById(id || '')

  if (!product) {
    return (
      <EmptyState
        title="Product Not Found"
        description="The requested fertilizer product was not found in the catalog."
        actionLabel="Return to Inventory"
        onAction={() => navigate('/inventory')}
      />
    )
  }

  // Filter movements for this product
  const movements = mockRepo
    .getInventoryMovements()
    .filter((m) => m.productId === product.id)

  // Filter invoices containing this product
  const invoices = mockRepo
    .getSalesInvoices()
    .filter((inv) => inv.items.some((it) => it.productId === product.id))

  // Filter imports containing this product
  const imports = mockRepo
    .getImports()
    .filter((imp) => imp.items.some((it) => it.productId === product.id))

  // Unit conversion metrics
  const bags = product.stockMT * (1000 / product.kgPerBag)
  const kg = product.stockMT * 1000
  const grossMargin = product.sellingPricePerMT - product.landedCostPerMT
  const marginPercent =
    product.sellingPricePerMT > 0 ? (grossMargin / product.sellingPricePerMT) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#202833]">{product.name}</h2>
              <StatusBadge status={product.status} />
            </div>
            <p className="text-xs text-[#697586]">
              SKU: {product.sku} • Category: {product.category} • Origin: {product.originCountry}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory/adjustments')}
            className="text-xs h-8"
          >
            Adjust Stock
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/sales/new')}
            className="text-xs h-8 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stock & Unit Conversion Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Available Physical Stock</span>
            <div className="text-xl font-bold font-mono text-[#202833] mt-0.5">
              {product.stockMT.toLocaleString()} MT
            </div>
            <span className="text-[11px] text-[#697586]">
              Reorder Threshold: {product.reorderLevelMT} MT
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Standard Bag Count</span>
            <div className="text-xl font-bold font-mono text-[#0F766E] mt-0.5">
              {Math.round(bags).toLocaleString()} Bags
            </div>
            <span className="text-[11px] text-[#697586]">
              {product.kgPerBag} kg bag specification
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Landed Cost per MT</span>
            <div className="text-xl font-bold font-mono text-[#202833] mt-0.5">
              ৳ {product.landedCostPerMT.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#697586]">
              ৳ {Math.round(product.landedCostPerMT / (1000 / product.kgPerBag)).toLocaleString()} / Bag
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Domestic Selling Price</span>
            <div className="text-xl font-bold font-mono text-[#526B83] mt-0.5">
              ৳ {product.sellingPricePerMT.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#166534] font-medium">
              Margin: +{marginPercent.toFixed(1)}% (৳ {grossMargin.toLocaleString()} / MT)
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="conversions">Unit Conversion Matrix</TabsTrigger>
          <TabsTrigger value="imports">Import History</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
        </TabsList>

        {/* Tab 1: Stock Movements */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movement Ledger & Stock Balance</CardTitle>
              <CardDescription>
                Chronological audit trail of intake, dispatches, adjustments, and returns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {movements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Movement Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Quantity (MT)</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs">{formatDate(m.date)}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-xs text-[#202833]">
                            {m.movementType}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#526B83]">
                          {m.reference}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold text-xs ${
                            m.quantityMT >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                          }`}
                        >
                          {m.quantityMT >= 0 ? `+${m.quantityMT}` : m.quantityMT} MT
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-xs">
                          {m.balanceAfterMT} MT
                        </TableCell>
                        <TableCell className="text-xs text-[#697586]">{m.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-xs text-[#697586]">
                  No logged movements for this product.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Unit Conversion Matrix */}
        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Conversion Rules (Metric Ton • Bag • Kilogram)</CardTitle>
              <CardDescription>
                System conversion rules applied during sales invoice creation and warehouse dispatch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#DCE2E8] bg-[#F8FAFC]">
                  <span className="text-xs text-[#697586] block">Base Accounting Unit</span>
                  <div className="text-xl font-bold text-[#202833] mt-1">1 Metric Ton (MT)</div>
                  <p className="text-xs text-[#697586] mt-2">
                    Official base unit stored in ledger, imports, and bulk valuation.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#DCE2E8] bg-[#F8FAFC]">
                  <span className="text-xs text-[#697586] block">Bag Size Specification</span>
                  <div className="text-xl font-bold text-[#202833] mt-1">
                    {product.kgPerBag} KG / Bag
                  </div>
                  <p className="text-xs text-[#697586] mt-2">
                    1 MT = {1000 / product.kgPerBag} standard packaged bags.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#DCE2E8] bg-[#F8FAFC]">
                  <span className="text-xs text-[#697586] block">Weight in Kilograms</span>
                  <div className="text-xl font-bold text-[#202833] mt-1">1,000 KG / MT</div>
                  <p className="text-xs text-[#697586] mt-2">
                    Total current stock equivalent: {kg.toLocaleString()} KG.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Import History */}
        <TabsContent value="imports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>International Import Consignments</CardTitle>
              <CardDescription>Procurement shipments that supplied this commodity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Import Ref</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Arrival Date</TableHead>
                    <TableHead className="text-right">Ordered (MT)</TableHead>
                    <TableHead className="text-right">Landed Cost / MT</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports.map((imp) => {
                    const it = imp.items.find((x) => x.productId === product.id)
                    return (
                      <TableRow
                        key={imp.id}
                        className="cursor-pointer hover:bg-[#F8FAFC]"
                        onClick={() => navigate(`/imports/${imp.id}`)}
                      >
                        <TableCell className="font-mono font-medium text-[#526B83]">
                          {imp.importReference}
                        </TableCell>
                        <TableCell>{imp.supplierName}</TableCell>
                        <TableCell>{formatDate(imp.expectedArrivalDate)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {it?.orderedQuantityMT || 0} MT
                        </TableCell>
                        <TableCell className="text-right font-mono text-[#0F766E] font-medium">
                          ৳ {it?.finalLandedCostPerMT.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={imp.status} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Sales History */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Invoices & Domestic Distribution</CardTitle>
              <CardDescription>Recent dealer dispatches for this commodity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate / MT</TableHead>
                    <TableHead className="text-right">Total (BDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const it = inv.items.find((x) => x.productId === product.id)
                    return (
                      <TableRow
                        key={inv.id}
                        className="cursor-pointer hover:bg-[#F8FAFC]"
                        onClick={() => navigate(`/sales/${inv.id}`)}
                      >
                        <TableCell className="font-mono font-medium text-[#526B83]">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{inv.customerName}</TableCell>
                        <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {it?.quantityInMT || 0} MT
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ৳ {it?.unitPriceBDT.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#202833]">
                          {formatBDT(it?.totalBDT || 0)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
