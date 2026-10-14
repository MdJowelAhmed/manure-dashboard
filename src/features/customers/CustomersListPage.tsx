import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Users, Plus, Eye, Banknote, FileText } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { Customer } from '@/types'
import { formatBDT } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const customers = mockRepo.getCustomers()

  const totalSales = customers.reduce((sum, c) => sum + c.totalSalesBDT, 0)
  const totalPaid = customers.reduce((sum, c) => sum + c.totalPaidBDT, 0)
  const totalDue = customers.reduce((sum, c) => sum + c.outstandingDueBDT, 0)

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'code',
      header: 'Customer Code',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('code')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Dealer / Company Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#202833]">{row.original.name}</span>
          <span className="text-[11px] text-[#697586]">{row.original.district}</span>
        </div>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person & Phone',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span className="text-[#202833]">{row.original.contactPerson}</span>
          <span className="text-[11px] text-[#697586] font-mono">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalSalesBDT',
      header: 'Total Sales (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-xs text-[#202833] text-right block">
          {formatBDT(row.original.totalSalesBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'totalPaidBDT',
      header: 'Total Paid (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-xs text-[#166534] text-right block">
          {formatBDT(row.original.totalPaidBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'outstandingDueBDT',
      header: 'Outstanding Due (BDT)',
      cell: ({ row }) => {
        const due = row.original.outstandingDueBDT
        return (
          <span
            className={`font-mono font-bold text-xs text-right block ${
              due > 0 ? 'text-[#991B1B]' : 'text-[#697586]'
            }`}
          >
            {due > 0 ? formatBDT(due) : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'overdueStatus',
      header: 'Credit Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('overdueStatus')} />,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => navigate(`/customers/${row.original.id}`)}
          >
            <Eye className="h-3 w-3 mr-1 text-[#526B83]" />
            Statement
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Customer Directory & Dealer Ledgers</h2>
          <p className="text-xs text-[#697586]">
            Domestic fertilizer distributors, dealers, regional cooperatives, and credit limits
          </p>
        </div>
        <Button
          onClick={() => navigate('/customers/new')}
          className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Customer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Cumulative Dealer Sales</span>
            <div className="text-xl font-bold font-mono text-[#202833] mt-0.5">
              {formatBDT(totalSales)}
            </div>
            <span className="text-[11px] text-[#697586]">{customers.length} Registered Dealers</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Collections Received</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(totalPaid)}
            </div>
            <span className="text-[11px] text-[#697586]">Settled via banking channels</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#697586]">Total Outstanding Due</span>
            <div className="text-xl font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(totalDue)}
            </div>
            <span className="text-[11px] text-[#697586]">Trade debtor receivables</span>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers by name, code, district, contact..."
      />
    </div>
  )
}
