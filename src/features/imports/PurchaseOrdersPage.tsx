import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, FileSpreadsheet, Eye, Ship } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { ImportShipment } from '@/types'
import { formatBDT, formatDate } from '@/lib/utils'

export const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const imports = mockRepo.getImports()

  const columns: ColumnDef<ImportShipment>[] = [
    {
      accessorKey: 'importReference',
      header: 'PO / Import Ref',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83]">
          {row.getValue('importReference')}
        </span>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#202833]">{row.original.supplierName}</span>
          <span className="text-[11px] text-[#697586]">Inv: {row.original.supplierInvoiceNo}</span>
        </div>
      ),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => formatDate(row.getValue('orderDate')),
    },
    {
      accessorKey: 'expectedArrivalDate',
      header: 'Expected Arrival (ETA)',
      cell: ({ row }) => formatDate(row.getValue('expectedArrivalDate')),
    },
    {
      id: 'orderedMT',
      header: 'Contract Quantity',
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.items.reduce((s, it) => s + it.orderedQuantityMT, 0)} MT
        </span>
      ),
    },
    {
      accessorKey: 'totalImportCostBDT',
      header: 'Contract FOB & Cost (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#202833]">
          {formatBDT(row.original.totalImportCostBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Order Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
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
            onClick={() => navigate(`/imports/${row.original.id}`)}
          >
            <Eye className="h-3 w-3 mr-1 text-[#526B83]" />
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Purchase Orders & Procurement Contracts</h2>
          <p className="text-xs text-[#697586]">
            Tracks bulk fertilizer import purchase orders placed with global manufacturers
          </p>
        </div>
        <Button
          onClick={() => navigate('/imports/new')}
          className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create Purchase Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={imports}
        searchPlaceholder="Search purchase orders..."
      />
    </div>
  )
}
