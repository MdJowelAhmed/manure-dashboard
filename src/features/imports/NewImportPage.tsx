import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ship, Calculator, Info, Plus, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockRepo } from '@/services/mockRepository'
import { ImportShipment, ImportItem } from '@/types'
import { formatBDT } from '@/lib/utils'
import { calculateLandedCost } from '@/lib/calculations'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const NewImportPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const suppliers = mockRepo.getSuppliers()
  const products = mockRepo.getProducts()

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '')
  const [importRef, setImportRef] = useState(`IMP-2026-00${mockRepo.getImports().length + 1}`)
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('')
  const [billOfLadingNo, setBillOfLadingNo] = useState('')
  const [vesselName, setVesselName] = useState('')
  const [dischargePort, setDischargePort] = useState('Chittagong Port')
  const [orderDate, setOrderDate] = useState('2026-03-15')
  const [shipmentDate, setShipmentDate] = useState('2026-03-25')
  const [expectedArrivalDate, setExpectedArrivalDate] = useState('2026-04-18')
  const [notes, setNotes] = useState('')

  // Line Items
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [orderedMT, setOrderedMT] = useState(1000)
  const [unitPriceUSD, setUnitPriceUSD] = useState(320)
  const [exchangeRateBDT, setExchangeRateBDT] = useState(122.5)

  // Ancillary Costs
  const [oceanFreight, setOceanFreight] = useState(5500000)
  const [marineInsurance, setMarineInsurance] = useState(550000)
  const [customsDuty, setCustomsDuty] = useState(3200000)
  const [portHandling, setPortHandling] = useState(1200000)
  const [clearingCommission, setClearingCommission] = useState(700000)
  const [inlandTransport, setInlandTransport] = useState(950000)

  // Derived Calculations
  const fobPriceBDT = unitPriceUSD * exchangeRateBDT
  const totalFobBDT = orderedMT * fobPriceBDT

  const landedPreview = calculateLandedCost(
    [{ orderedQuantityMT: orderedMT, fobPriceBDT }],
    {
      oceanFreightBDT: oceanFreight,
      marineInsuranceBDT: marineInsurance,
      customsDutyAssessmentBDT: customsDuty,
      portHandlingChargesBDT: portHandling,
      clearingAgentCommissionBDT: clearingCommission,
      inlandTransportDepotBDT: inlandTransport,
    },
    'weight'
  )

  const handleSaveImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) {
      toast.error('Please select an international supplier.')
      return
    }
    if (orderedMT <= 0) {
      toast.error('Please enter a valid ordered quantity in MT.')
      return
    }

    const selectedSup = suppliers.find((s) => s.id === supplierId)
    const selectedProd = products.find((p) => p.id === productId)

    const item: ImportItem = {
      id: `item-${Date.now()}`,
      productId,
      productName: selectedProd?.name || 'Bulk Fertilizer',
      orderedQuantityMT: orderedMT,
      unitPriceUSD,
      exchangeRateBDT,
      fobPriceBDT,
      totalFobBDT,
      receivedQuantityMT: 0,
      allocatedCostBDT: landedPreview.ancillaryCostsBDT,
      finalLandedCostPerMT: landedPreview.averageLandedPerMT,
    }

    const newShipment: ImportShipment = {
      id: `imp-${Date.now()}`,
      importReference: importRef || `IMP-2026-${Date.now()}`,
      supplierId,
      supplierName: selectedSup?.name || 'International Supplier',
      supplierInvoiceNo: supplierInvoiceNo || `INV-SUP-${Date.now()}`,
      billOfLadingNo: billOfLadingNo || `BL-CTG-${Date.now()}`,
      orderDate,
      shipmentDate,
      expectedArrivalDate,
      status: 'Ordered',
      dischargePort,
      vesselName: vesselName || 'M/V Ocean Carrier',
      allocationMethod: 'weight',
      items: [item],
      costBreakdown: {
        purchaseFobBDT: totalFobBDT,
        oceanFreightBDT: oceanFreight,
        marineInsuranceBDT: marineInsurance,
        customsDutyAssessmentBDT: customsDuty,
        portHandlingChargesBDT: portHandling,
        clearingAgentCommissionBDT: clearingCommission,
        inlandTransportDepotBDT: inlandTransport,
      },
      totalImportCostBDT: landedPreview.totalLandedCostBDT,
      totalPaidBDT: 0,
      balanceDueBDT: landedPreview.totalLandedCostBDT,
      goodsReceipts: [],
      notes,
    }

    mockRepo.saveImport(newShipment)
    dispatch(triggerDataRefresh())
    toast.success(`Import consignment ${newShipment.importReference} created successfully!`)
    navigate(`/imports/${newShipment.id}`)
  }

  return (
    <form onSubmit={handleSaveImport} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/imports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">New Import Consignment</h2>
            <p className="text-xs text-[#334155]">
              Record international purchase contract, shipping schedule, and eligible landed-cost breakdown
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/imports')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Ship className="h-3.5 w-3.5 mr-1" />
            Save Consignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier & Schedule</CardTitle>
              <CardDescription>International exporter and port discharge timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Supplier</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label required>Import Reference</Label>
                  <Input
                    value={importRef}
                    onChange={(e) => setImportRef(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Supplier Invoice #</Label>
                  <Input
                    placeholder="e.g. SABIC-2026-99"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bill of Lading (B/L) #</Label>
                  <Input
                    placeholder="e.g. BL-MAERSK-00129"
                    value={billOfLadingNo}
                    onChange={(e) => setBillOfLadingNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Vessel Name</Label>
                  <Input
                    placeholder="e.g. M/V Arabian Pioneer"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Order Date</Label>
                  <Input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Shipment Date</Label>
                  <Input
                    type="date"
                    value={shipmentDate}
                    onChange={(e) => setShipmentDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Expected Arrival (ETA)</Label>
                  <Input
                    type="date"
                    value={expectedArrivalDate}
                    onChange={(e) => setExpectedArrivalDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Commodity & Purchase Pricing (FOB)</CardTitle>
              <CardDescription>Product line items, contract price in USD, and converted BDT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label required>Product</Label>
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

                <div className="space-y-1.5">
                  <Label required>Contract Quantity (MT)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={orderedMT}
                    onChange={(e) => setOrderedMT(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Unit FOB Price (USD / MT)</Label>
                  <Input
                    type="number"
                    value={unitPriceUSD}
                    onChange={(e) => setUnitPriceUSD(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>USD / BDT Exchange Rate</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={exchangeRateBDT}
                    onChange={(e) => setExchangeRateBDT(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Calculated FOB Total (BDT)</Label>
                  <div className="h-9 px-3 flex items-center font-mono font-semibold text-sm bg-[#F8FAFC] border border-[#DCE2E8] rounded-lg text-[#0F172A]">
                    {formatBDT(totalFobBDT)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ancillary Landed Cost Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Eligible Landed Cost Breakdown (BDT)</CardTitle>
              <CardDescription>
                Freight, customs duty, port handling, and inland transport eligible for inventory capitalization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Ocean Freight (BDT)</Label>
                  <Input
                    type="number"
                    value={oceanFreight}
                    onChange={(e) => setOceanFreight(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Marine Cargo Insurance (BDT)</Label>
                  <Input
                    type="number"
                    value={marineInsurance}
                    onChange={(e) => setMarineInsurance(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Customs Duty & Assessment (NBR) (BDT)</Label>
                  <Input
                    type="number"
                    value={customsDuty}
                    onChange={(e) => setCustomsDuty(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Port Handling Charges (CPA) (BDT)</Label>
                  <Input
                    type="number"
                    value={portHandling}
                    onChange={(e) => setPortHandling(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>C&F Clearing Agent Commission (BDT)</Label>
                  <Input
                    type="number"
                    value={clearingCommission}
                    onChange={(e) => setClearingCommission(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Inland Transport to Central Depot (BDT)</Label>
                  <Input
                    type="number"
                    value={inlandTransport}
                    onChange={(e) => setInlandTransport(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Logistics & Cargo Notes</Label>
                <Textarea
                  placeholder="Notes on lighter vessel discharge, bagging, surveyor certificate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Transparent Landed Cost Summary Box */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-[#CBD5E1] shadow-sm">
            <CardHeader className="bg-[#F8FAFC] border-b border-[#DCE2E8] pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#0F172A]">
                <Calculator className="h-4 w-4 text-[#526B83]" />
                Landed Cost Allocation Preview
              </CardTitle>
              <CardDescription className="text-[11px]">
                Weight-allocated unit cost for inventory valuation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Base FOB Contract:</span>
                  <span className="font-mono font-medium">{formatBDT(totalFobBDT)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Ocean Freight:</span>
                  <span className="font-mono font-medium">{formatBDT(oceanFreight)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Marine Insurance:</span>
                  <span className="font-mono font-medium">{formatBDT(marineInsurance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Customs Duty (NBR):</span>
                  <span className="font-mono font-medium">{formatBDT(customsDuty)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">Port Handling (CPA):</span>
                  <span className="font-mono font-medium">{formatBDT(portHandling)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#334155]">C&F & Inland Transport:</span>
                  <span className="font-mono font-medium">
                    {formatBDT(clearingCommission + inlandTransport)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-semibold text-sm border-t border-[#DCE2E8] pt-2">
                  <span className="text-[#0F172A]">Total Landed Cost:</span>
                  <span className="font-mono text-[#526B83]">
                    {formatBDT(landedPreview.totalLandedCostBDT)}
                  </span>
                </div>
              </div>

              {/* Unit Metrics Highlight Box */}
              <div className="p-3 rounded-lg bg-[#EBF0F5] border border-[#CBD5E1] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#0F172A]">Unit Landed Cost:</span>
                  <span className="font-mono font-bold text-sm text-[#0F172A]">
                    ৳ {landedPreview.averageLandedPerMT.toLocaleString()} / MT
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#334155]">
                  <span>Equivalent per 50kg Bag:</span>
                  <span className="font-mono font-medium text-[#0F172A]">
                    ৳ {Math.round(landedPreview.averageLandedPerMT / 20).toLocaleString()} / Bag
                  </span>
                </div>
              </div>

              {/* Transparent Disclaimer Notice */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E]">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#B45309]" />
                <p>
                  <strong>Prototype Landed-Cost Notice:</strong> This preview uses a documented weight allocation method for demonstration. It illustrates landed cost roll-up into inventory without asserting a final approved statutory accounting policy.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#526B83] hover:bg-[#3E5367] text-white"
              >
                Create Import Shipment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
