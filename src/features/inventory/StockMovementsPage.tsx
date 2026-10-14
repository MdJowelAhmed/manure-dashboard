import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Warehouse } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { mockRepo } from '@/services/mockRepository'
import { InventoryMovement } from '@/types'
import { formatDate } from '@/lib/utils'

export const StockMovementsPage: React.FC = () => {
  const movements = mockRepo.getInventoryMovements()

  const columns: ColumnDef<InventoryMovement>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{formatDate(row.getValue('date'))}</span>
      ),
    },
    {
      accessorKey: 'productName',
      header: 'Fertilizer Product',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-[#202833]">
          {row.getValue('productName')}
        </span>
      ),
    },
    {
      accessorKey: 'movementType',
      header: 'Movement Type',
      cell: ({ row }) => {
        const type = row.getValue('movementType') as string
        const isIntake = type === 'Import Receipt' || type === 'Sales Return'
        return (
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              isIntake
                ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
            }`}
          >
            {type}
          </span>
        )
      },
    },
    {
      accessorKey: 'reference',
      header: 'Reference #',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#526B83]">{row.getValue('reference')}</span>
      ),
    },
    {
      accessorKey: 'quantityMT',
      header: 'Quantity (MT)',
      cell: ({ row }) => {
        const qty = row.original.quantityMT
        return (
          <span
            className={`font-mono font-bold text-xs ${
              qty >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
            }`}
          >
            {qty >= 0 ? `+${qty}` : qty} MT
          </span>
        )
      },
    },
    {
      accessorKey: 'balanceAfterMT',
      header: 'Balance After (MT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#202833]">
          {row.getValue('balanceAfterMT')} MT
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Movement Details',
      cell: ({ row }) => (
        <span className="text-xs text-[#697586]">{row.getValue('notes') || '—'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Inventory Stock Movements</h2>
          <p className="text-xs text-[#697586]">
            Immutable chronological audit log of physical stock intake, delivery dispatch, and adjustments
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={movements}
        searchPlaceholder="Search movements by product, ref, type..."
      />
    </div>
  )
}
