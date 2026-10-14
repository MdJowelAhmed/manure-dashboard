import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { SlidersHorizontal, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockRepo } from '@/services/mockRepository'
import { StockAdjustment } from '@/types'
import { formatDate, formatBDT } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const StockAdjustmentsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const adjustments = mockRepo.getStockAdjustments()
  const products = mockRepo.getProducts()

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [adjustmentType, setAdjustmentType] = useState<
    'Physical Surplus' | 'Physical Deficit' | 'Moisture / Bag Damage' | 'Repacking Loss'
  >('Repacking Loss')
  const [quantityMT, setQuantityMT] = useState(-5)
  const [reason, setReason] = useState('')
  const [approvedBy, setApprovedBy] = useState('Director of Operations: A. S. M. Faruq')

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast.error('Please specify a detailed audit reason for this adjustment.')
      return
    }

    const prod = products.find((p) => p.id === productId)
    if (!prod) return

    mockRepo.saveStockAdjustment({
      id: `adj-${Date.now()}`,
      adjustmentNumber: `ADJ-2026-0${adjustments.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      productId: prod.id,
      productName: prod.name,
      adjustmentType,
      quantityMT,
      unitCostBDT: prod.landedCostPerMT,
      reason,
      approvedBy,
    })

    dispatch(triggerDataRefresh())
    setModalOpen(false)
    toast.success(`Stock adjustment posted! ${prod.name} inventory updated by ${quantityMT} MT.`)
  }

  const columns: ColumnDef<StockAdjustment>[] = [
    {
      accessorKey: 'adjustmentNumber',
      header: 'Adjustment #',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('adjustmentNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => (
        <span className="font-medium text-xs text-[#0F172A]">
          {row.getValue('productName')}
        </span>
      ),
    },
    {
      accessorKey: 'adjustmentType',
      header: 'Adjustment Type',
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F5F9] border border-[#DCE2E8]">
          {row.getValue('adjustmentType')}
        </span>
      ),
    },
    {
      accessorKey: 'quantityMT',
      header: 'Variance (MT)',
      cell: ({ row }) => {
        const qty = row.original.quantityMT
        return (
          <span
            className={`font-mono font-bold text-xs ${
              qty > 0 ? 'text-[#166534]' : 'text-[#991B1B]'
            }`}
          >
            {qty > 0 ? `+${qty}` : qty} MT
          </span>
        )
      },
    },
    {
      id: 'costImpact',
      header: 'Financial Impact',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#334155]">
          {formatBDT(Math.abs(row.original.quantityMT * row.original.unitCostBDT))}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Audit Reason',
      cell: ({ row }) => (
        <span className="text-xs text-[#334155] max-w-[250px] truncate block">
          {row.getValue('reason')}
        </span>
      ),
    },
    {
      accessorKey: 'approvedBy',
      header: 'Approved By',
      cell: ({ row }) => (
        <span className="text-[11px] text-[#475569]">{row.getValue('approvedBy')}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Stock Adjustments & Variance Reconciliations</h2>
          <p className="text-xs text-[#334155]">
            Record physical stock count reconciliations, bagging dust losses, and moisture adjustments
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Stock Adjustment
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={adjustments}
        searchPlaceholder="Search adjustments by product, reason, reference..."
      />

      {/* New Adjustment Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveAdjustment}>
            <DialogHeader>
              <DialogTitle>Post Warehouse Stock Adjustment</DialogTitle>
              <DialogDescription>
                Audited variance will adjust available physical stock at Khatunganj Central Depot and create a journal entry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label required>Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (Current: {p.stockMT} MT)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label required>Adjustment Type</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(val: any) => {
                    setAdjustmentType(val)
                    if (val === 'Physical Surplus' && quantityMT < 0) {
                      setQuantityMT(Math.abs(quantityMT))
                    } else if (val !== 'Physical Surplus' && quantityMT > 0) {
                      setQuantityMT(-Math.abs(quantityMT))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Repacking Loss">Repacking Loss (Bulk Bagging)</SelectItem>
                    <SelectItem value="Physical Deficit">Physical Audit Deficit</SelectItem>
                    <SelectItem value="Moisture / Bag Damage">Moisture / Bag Damage</SelectItem>
                    <SelectItem value="Physical Surplus">Physical Count Surplus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label required>Quantity Variance (MT)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={quantityMT}
                  onChange={(e) => setQuantityMT(Number(e.target.value))}
                  required
                />
                <span className="text-[11px] text-[#334155]">
                  Enter negative for reduction (e.g. -5 MT), positive for addition (e.g. +2 MT).
                </span>
              </div>

              <div className="space-y-1.5">
                <Label required>Audit Justification / Reason</Label>
                <Textarea
                  placeholder="Explain why variance occurred (e.g. scale calibration discrepancy, rainfall damage)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label required>Approved Authority</Label>
                <Input
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  required
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
                Post Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
