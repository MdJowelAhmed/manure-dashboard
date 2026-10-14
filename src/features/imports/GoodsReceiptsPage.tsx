import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { PackageCheck, Plus, Warehouse, Eye } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockRepo } from '@/services/mockRepository'
import { GoodsReceipt } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

interface FlatGRN extends GoodsReceipt {
  importRef: string
  supplierName: string
}

export const GoodsReceiptsPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const imports = mockRepo.getImports()

  // Flatten all GRNs from imports
  const allGrns: FlatGRN[] = []
  imports.forEach((imp) => {
    imp.goodsReceipts.forEach((gr) => {
      allGrns.push({
        ...gr,
        importRef: imp.importReference,
        supplierName: imp.supplierName,
      })
    })
  })

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImportId, setSelectedImportId] = useState(imports[0]?.id || '')
  const [receivedMT, setReceivedMT] = useState(500)
  const [shortageMT, setShortageMT] = useState(0)
  const [damagedMT, setDamagedMT] = useState(0)
  const [shedLocation, setShedLocation] = useState('Khatunganj Central Depot - Shed A')
  const [notes, setNotes] = useState('')

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImportId) {
      toast.error('Please select an import consignment.')
      return
    }
    if (receivedMT <= 0) {
      toast.error('Please enter a valid received quantity in MT.')
      return
    }

    mockRepo.addGoodsReceipt({
      id: `gr-${Date.now()}`,
      receiptNumber: `GRN-2026-0${allGrns.length + 1}`,
      importId: selectedImportId,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedMT,
      shortageMT,
      damagedMT,
      warehouseLocation: shedLocation,
      receivedBy: 'Depot In-Charge: Md. Saiful Islam',
      notes: notes || 'Stock received and stacked in Khatunganj godown.',
    })

    dispatch(triggerDataRefresh())
    setModalOpen(false)
    toast.success(`Goods Receipt registered! ${receivedMT} MT added to inventory stock.`)
  }

  const columns: ColumnDef<FlatGRN>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'GRN Number',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83]">
          {row.getValue('receiptNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'importRef',
      header: 'Import Consignment',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-medium text-[#202833]">
            {row.original.importRef}
          </span>
          <span className="text-[11px] text-[#697586]">{row.original.supplierName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'receivedDate',
      header: 'Receipt Date',
      cell: ({ row }) => formatDate(row.getValue('receivedDate')),
    },
    {
      accessorKey: 'receivedMT',
      header: 'Received (MT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[#166534]">
          {row.getValue('receivedMT')} MT
        </span>
      ),
    },
    {
      accessorKey: 'shortageMT',
      header: 'Shortage (MT)',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#991B1B]">
          {row.original.shortageMT > 0 ? `${row.original.shortageMT} MT` : '0 MT'}
        </span>
      ),
    },
    {
      accessorKey: 'warehouseLocation',
      header: 'Warehouse Shed',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-[#202833]">
          <Warehouse className="h-3.5 w-3.5 text-[#526B83]" />
          <span>{row.getValue('warehouseLocation')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'receivedBy',
      header: 'Received By',
      cell: ({ row }) => (
        <span className="text-xs text-[#697586]">{row.getValue('receivedBy')}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => navigate(`/imports/${row.original.importId}`)}
          >
            <Eye className="h-3 w-3 mr-1 text-[#526B83]" />
            View Import
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Goods Receipt Notes (GRN)</h2>
          <p className="text-xs text-[#697586]">
            Physical warehouse discharge logs and stock intake at Khatunganj Central Depot
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="text-xs h-9 bg-[#0F766E] hover:bg-[#0D655E] text-white"
        >
          <PackageCheck className="h-3.5 w-3.5 mr-1" />
          Register Goods Receipt
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={allGrns}
        searchPlaceholder="Search goods receipts by GRN, import ref, supplier..."
      />

      {/* New GRN Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateGRN}>
            <DialogHeader>
              <DialogTitle>Receive Import Stock into Depot</DialogTitle>
              <DialogDescription>
                Record verified physical arrival and weighing into Khatunganj Central Depot
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label required>Select Import Consignment</Label>
                <Select value={selectedImportId} onValueChange={setSelectedImportId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consignment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {imports.map((imp) => (
                      <SelectItem key={imp.id} value={imp.id}>
                        {imp.importReference} — {imp.supplierName} ({imp.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  <Label>Sea Shortage (MT)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={shortageMT}
                    onChange={(e) => setShortageMT(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Damaged Bags (MT)</Label>
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
                <Label>Notes</Label>
                <Input
                  placeholder="e.g. Discharged via lighter vessel, quality sample checked"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                className="bg-[#0F766E] hover:bg-[#0D655E] text-white"
              >
                Save Receipt & Update Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
