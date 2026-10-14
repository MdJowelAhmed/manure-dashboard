import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Ship,
  PackageCheck,
  Banknote,
  FileText,
  Printer,
  Calculator,
  Calendar,
  Building,
  Anchor,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const ImportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const shipment = mockRepo.getImportById(id || '')

  // Goods Receipt Modal State
  const [grnModalOpen, setGrnModalOpen] = useState(false)
  const [receivedMT, setReceivedMT] = useState(0)
  const [shortageMT, setShortageMT] = useState(0)
  const [damagedMT, setDamagedMT] = useState(0)
  const [shedLocation, setShedLocation] = useState('Khatunganj Central Depot - Shed A')
  const [grnNotes, setGrnNotes] = useState('')

  if (!shipment) {
    return (
      <EmptyState
        title="Import Shipment Not Found"
        description="The requested import reference does not exist or has been removed."
        actionLabel="Return to Imports"
        onAction={() => navigate('/imports')}
      />
    )
  }

  const supplier = mockRepo.getSupplierById(shipment.supplierId)
  const totalReceivedMT = shipment.goodsReceipts.reduce((sum, gr) => sum + gr.receivedMT, 0)
  const totalOrderedMT = shipment.items.reduce((sum, it) => sum + it.orderedQuantityMT, 0)
  const mainItem = shipment.items[0]

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault()
    if (receivedMT <= 0) {
      toast.error('Please enter a valid received quantity in MT.')
      return
    }

    mockRepo.addGoodsReceipt({
      id: `gr-${Date.now()}`,
      receiptNumber: `GRN-2026-0${shipment.goodsReceipts.length + 3}`,
      importId: shipment.id,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedMT,
      shortageMT,
      damagedMT,
      warehouseLocation: shedLocation,
      receivedBy: 'Depot In-Charge: Md. Saiful Islam',
      notes: grnNotes || 'Discharge registered at Khatunganj Depot.',
    })

    dispatch(triggerDataRefresh())
    setGrnModalOpen(false)
    toast.success(`Received ${receivedMT} MT stock into Khatunganj Central Depot!`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/imports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold font-mono text-[#0F172A]">
                {shipment.importReference}
              </h2>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-xs text-[#334155]">
              Supplier: {shipment.supplierName} • BL: {shipment.billOfLadingNo} • Port: {shipment.dischargePort}
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
            Print Dossier
          </Button>

          {shipment.status !== 'Cost Finalized' && shipment.status !== 'Received' && (
            <Button
              size="sm"
              onClick={() => {
                setReceivedMT(Math.max(0, totalOrderedMT - totalReceivedMT))
                setGrnModalOpen(true)
              }}
              className="text-xs h-8 bg-[#0F766E] hover:bg-[#0D655E] text-white"
            >
              <PackageCheck className="h-3.5 w-3.5 mr-1" />
              Receive Stock (GRN)
            </Button>
          )}

          {shipment.balanceDueBDT > 0 && (
            <Button
              size="sm"
              onClick={() => navigate('/payments/new')}
              className="text-xs h-8 bg-[#526B83] hover:bg-[#3E5367] text-white"
            >
              <Banknote className="h-3.5 w-3.5 mr-1" />
              Record Supplier Payment
            </Button>
          )}
        </div>
      </div>

      {/* Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Landed Cost</span>
            <div className="text-lg font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(shipment.totalImportCostBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">All eligible capitalized costs</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Unit Landed Cost</span>
            <div className="text-lg font-bold font-mono text-[#0F766E] mt-0.5">
              ৳ {mainItem ? mainItem.finalLandedCostPerMT.toLocaleString() : '—'} / MT
            </div>
            <span className="text-[11px] text-[#334155]">
              ৳ {mainItem ? Math.round(mainItem.finalLandedCostPerMT / 20).toLocaleString() : '—'} / 50kg bag
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Goods Received</span>
            <div className="text-lg font-bold font-mono text-[#0F172A] mt-0.5">
              {totalReceivedMT} / {totalOrderedMT} MT
            </div>
            <span className="text-[11px] text-[#334155]">
              {totalOrderedMT > 0 ? Math.round((totalReceivedMT / totalOrderedMT) * 100) : 0}% arrived at Khatunganj
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Supplier Payable Due</span>
            <div className="text-lg font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(shipment.balanceDueBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">
              Paid: {formatBDT(shipment.totalPaidBDT)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content Sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Shipment Overview</TabsTrigger>
          <TabsTrigger value="landed-cost">Landed Cost Allocation</TabsTrigger>
          <TabsTrigger value="grn">Goods Receipts ({shipment.goodsReceipts.length})</TabsTrigger>
          <TabsTrigger value="accounting">Linked Accounting</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Commodity & Contract Items</CardTitle>
                <CardDescription>Purchased products under this bill of lading</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Contract Qty</TableHead>
                      <TableHead className="text-right">Unit Price (USD)</TableHead>
                      <TableHead className="text-right">FOB (BDT)</TableHead>
                      <TableHead className="text-right">Landed Cost / MT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipment.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium text-[#0F172A]">
                          {it.productName}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {it.orderedQuantityMT} MT
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${it.unitPriceUSD}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatBDT(it.totalFobBDT)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#0F766E]">
                          ৳ {it.finalLandedCostPerMT.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Vessel & Logistics Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Logistics & Discharge</CardTitle>
                <CardDescription>Port, vessel, and supplier details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Exporter:</span>
                  <span className="font-medium text-[#0F172A]">{shipment.supplierName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Supplier Invoice:</span>
                  <span className="font-mono">{shipment.supplierInvoiceNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Bill of Lading:</span>
                  <span className="font-mono">{shipment.billOfLadingNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Mother Vessel:</span>
                  <span className="font-medium">{shipment.vesselName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Discharge Port:</span>
                  <span className="font-medium">{shipment.dischargePort}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Expected Arrival:</span>
                  <span>{formatDate(shipment.expectedArrivalDate)}</span>
                </div>
                {shipment.actualArrivalDate && (
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#334155]">Actual Discharge:</span>
                    <span className="text-[#166534] font-medium">
                      {formatDate(shipment.actualArrivalDate)}
                    </span>
                  </div>
                )}
                {shipment.notes && (
                  <div className="pt-2">
                    <span className="text-[#334155] block mb-1">Notes:</span>
                    <p className="p-2 rounded-lg bg-[#F8FAFC] border border-[#DCE2E8] text-[11px] text-[#475569]">
                      {shipment.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Landed Cost Breakdown */}
        <TabsContent value="landed-cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capitalized Landed Cost Allocation</CardTitle>
              <CardDescription>
                Detailed itemized breakdown of costs qualifying for inventory landed valuation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cost Component</TableHead>
                      <TableHead className="text-right">Amount (BDT)</TableHead>
                      <TableHead className="text-right">Cost / MT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Contract Purchase FOB</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatBDT(shipment.costBreakdown.purchaseFobBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.purchaseFobBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ocean Freight</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBDT(shipment.costBreakdown.oceanFreightBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.oceanFreightBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Marine Cargo Insurance</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBDT(shipment.costBreakdown.marineInsuranceBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.marineInsuranceBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Customs Duty & Assessment (NBR)</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBDT(shipment.costBreakdown.customsDutyAssessmentBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.customsDutyAssessmentBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Port Handling Charges (CPA)</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBDT(shipment.costBreakdown.portHandlingChargesBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.portHandlingChargesBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>C&F Clearing Agent Commission</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBDT(shipment.costBreakdown.clearingAgentCommissionBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.clearingAgentCommissionBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Inland Transport to Khatunganj Depot</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBDT(shipment.costBreakdown.inlandTransportDepotBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ৳ {Math.round(shipment.costBreakdown.inlandTransportDepotBDT / totalOrderedMT).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-semibold bg-[#F8FAFC]">
                      <TableCell>Total Capitalized Landed Cost</TableCell>
                      <TableCell className="text-right font-mono font-bold text-[#526B83]">
                        {formatBDT(shipment.totalImportCostBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-[#0F766E]">
                        ৳ {mainItem ? mainItem.finalLandedCostPerMT.toLocaleString() : '—'} / MT
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Calculation Methodology Info */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE2E8] space-y-3">
                    <h4 className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-[#526B83]" />
                      Weight-Allocation Method Applied
                    </h4>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      For bulk fertilizer imports, freight, customs duty, port handling, and lighterage
                      charges are allocated proportionally based on physical weight (Metric Tons) discharged.
                    </p>
                    <div className="p-3 rounded-lg bg-white border border-[#DCE2E8] space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#334155]">Net Landed Rate / MT:</span>
                        <strong className="font-mono text-[#0F766E]">
                          ৳ {mainItem?.finalLandedCostPerMT.toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#334155]">Net Landed Rate / 50kg Bag:</span>
                        <strong className="font-mono text-[#0F172A]">
                          ৳ {mainItem ? Math.round(mainItem.finalLandedCostPerMT / 20).toLocaleString() : '—'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Goods Receipts (GRN) */}
        <TabsContent value="grn" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Goods Receipt History (GRN)</CardTitle>
                <CardDescription>
                  Warehouse discharge receipts, transit shortage, and bag condition reports
                </CardDescription>
              </div>
              {shipment.status !== 'Cost Finalized' && shipment.status !== 'Received' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setReceivedMT(Math.max(0, totalOrderedMT - totalReceivedMT))
                    setGrnModalOpen(true)
                  }}
                  className="h-8 text-xs bg-[#0F766E] text-white"
                >
                  <PackageCheck className="h-3.5 w-3.5 mr-1" />
                  New GRN Entry
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {shipment.goodsReceipts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN #</TableHead>
                      <TableHead>Receipt Date</TableHead>
                      <TableHead className="text-right">Received (MT)</TableHead>
                      <TableHead className="text-right">Shortage (MT)</TableHead>
                      <TableHead className="text-right">Damaged (MT)</TableHead>
                      <TableHead>Warehouse Shed</TableHead>
                      <TableHead>Receiver</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipment.goodsReceipts.map((gr) => (
                      <TableRow key={gr.id}>
                        <TableCell className="font-mono font-semibold text-[#526B83]">
                          {gr.receiptNumber}
                        </TableCell>
                        <TableCell>{formatDate(gr.receivedDate)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#166534]">
                          {gr.receivedMT} MT
                        </TableCell>
                        <TableCell className="text-right font-mono text-[#991B1B]">
                          {gr.shortageMT > 0 ? `${gr.shortageMT} MT` : '0 MT'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[#B45309]">
                          {gr.damagedMT > 0 ? `${gr.damagedMT} MT` : '0 MT'}
                        </TableCell>
                        <TableCell>{gr.warehouseLocation}</TableCell>
                        <TableCell className="text-xs text-[#334155]">{gr.receivedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <EmptyState
                    title="No Goods Receipts Logged"
                    description="This shipment is currently in pipeline or pending customs clearance at port."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Linked Accounting */}
        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linked Double-Entry Accounting Records</CardTitle>
              <CardDescription>
                Automated journal postings capitalizing inventory and booking supplier liability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border border-[#DCE2E8] bg-[#F8FAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#526B83]">
                    JRN-2026-001 (Import Landed Receipt)
                  </span>
                  <StatusBadge status="Posted" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Code & Name</TableHead>
                      <TableHead className="text-right">Debit (BDT)</TableHead>
                      <TableHead className="text-right">Credit (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        1200 - Fertilizer Inventory (Landed Cost)
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatBDT(shipment.totalImportCostBDT)}
                      </TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        2010 - Accounts Payable ({shipment.supplierName})
                      </TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatBDT(shipment.costBreakdown.purchaseFobBDT)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        1020 - Eastern Bank PLC (Freight, Duty & C&F Paid)
                      </TableCell>
                      <TableCell className="text-right font-mono">—</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatBDT(
                          shipment.totalImportCostBDT - shipment.costBreakdown.purchaseFobBDT
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goods Receipt (GRN) Dialog Modal */}
      <Dialog open={grnModalOpen} onOpenChange={setGrnModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateGRN}>
            <DialogHeader>
              <DialogTitle>Register Goods Receipt (GRN)</DialogTitle>
              <DialogDescription>
                Confirm physical arrival and weighing of stock at Khatunganj Central Depot
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label required>Received Quantity (MT)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={receivedMT}
                  onChange={(e) => setReceivedMT(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Sea-Transit Shortage (MT)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={shortageMT}
                    onChange={(e) => setShortageMT(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Damaged / Damp Stock (MT)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={damagedMT}
                    onChange={(e) => setDamagedMT(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Depot Shed Location</Label>
                <Input
                  value={shedLocation}
                  onChange={(e) => setShedLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Warehouse Inspection Notes</Label>
                <Input
                  placeholder="e.g. Discharged via lighter vessel, quality sample checked"
                  value={grnNotes}
                  onChange={(e) => setGrnNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGrnModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#0F766E] hover:bg-[#0D655E] text-white"
              >
                Confirm Receipt & Update Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
