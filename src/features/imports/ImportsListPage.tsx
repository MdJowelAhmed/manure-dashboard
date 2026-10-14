import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Ship, Eye, Calculator, PackageCheck, Download } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { ImportShipment } from '@/types'
import { formatBDT, formatDate } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const ImportsListPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const imports = mockRepo.getImports()

  const totalImportCost = imports.reduce((sum, imp) => sum + imp.totalImportCostBDT, 0)
  const totalPaid = imports.reduce((sum, imp) => sum + imp.totalPaidBDT, 0)
  const totalDue = imports.reduce((sum, imp) => sum + imp.balanceDueBDT, 0)
  const activeShipments = imports.filter(
    (imp) => imp.status === 'In Transit' || imp.status === 'Ordered' || imp.status === 'Partially Received'
  ).length

  const columns: ColumnDef<ImportShipment>[] = [
    {
      accessorKey: 'importReference',
      header: 'Import Ref',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83]">
          {row.getValue('importReference')}
        </span>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier & Country',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[#0F172A]">{item.supplierName}</span>
            <span className="text-[11px] text-[#334155]">BL: {item.billOfLadingNo}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'vesselName',
      header: 'Vessel / Dates',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col">
            <span className="text-xs text-[#0F172A]">{item.vesselName}</span>
            <span className="text-[11px] text-[#334155]">
              Order: {formatDate(item.orderDate)} • ETA: {formatDate(item.expectedArrivalDate)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'itemsSummary',
      header: 'Commodity & Quantity',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col">
            {item.items.map((it) => (
              <span key={it.id} className="text-xs">
                {it.productName}: <strong className="font-mono">{it.orderedQuantityMT} MT</strong>
              </span>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalImportCostBDT',
      header: 'Total Landed Cost',
      cell: ({ row }) => (
        <div className="flex flex-col text-right font-mono">
          <span className="font-semibold text-[#0F172A]">
            {formatBDT(row.original.totalImportCostBDT)}
          </span>
          <span className="text-[10px] text-[#334155]">
            Due: {formatBDT(row.original.balanceDueBDT)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Shipment Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => navigate(`/imports/${item.id}`)}
              title="View Details"
            >
              <Eye className="h-3.5 w-3.5 text-[#526B83]" />
            </Button>
            {item.status !== 'Received' && item.status !== 'Cost Finalized' && (
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => navigate('/goods-receipts')}
                title="Receive Stock (GRN)"
              >
                <PackageCheck className="h-3.5 w-3.5 text-[#0F766E]" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Import Shipments & Procurement</h2>
          <p className="text-xs text-[#334155]">
            Manage international supplier orders, customs clearing, landed cost allocations, and port arrivals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/imports/new')}
            className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Import Consignment
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Procurement Volume</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(totalImportCost)}
            </div>
            <span className="text-[11px] text-[#334155]">{imports.length} Consignments Total</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Supplier Dues Payable</span>
            <div className="text-xl font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(totalDue)}
            </div>
            <span className="text-[11px] text-[#334155]">L/C & usance sight obligations</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Payments Disbursed</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(totalPaid)}
            </div>
            <span className="text-[11px] text-[#334155]">Via Eastern Bank & IBBL L/Cs</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Active Pipeline</span>
            <div className="text-xl font-bold font-mono text-[#526B83] mt-0.5">
              {activeShipments} Shipments
            </div>
            <span className="text-[11px] text-[#334155]">In transit or undergoing customs</span>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={imports}
        searchPlaceholder="Search imports by reference, supplier, BL..."
      />
    </div>
  )
}
