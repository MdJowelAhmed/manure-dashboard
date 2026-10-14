import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Building2, Plus, Eye, Ship, Banknote } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { Supplier } from '@/types'
import { formatBDT } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const SuppliersListPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const suppliers = mockRepo.getSuppliers()

  const totalImported = suppliers.reduce((sum, s) => sum + s.totalImportedBDT, 0)
  const totalPaid = suppliers.reduce((sum, s) => sum + s.totalPaidBDT, 0)
  const totalDue = suppliers.reduce((sum, s) => sum + s.balanceDueBDT, 0)

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'code',
      header: 'Supplier Code',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('code')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Supplier / Manufacturer',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#0F172A]">{row.original.name}</span>
          <span className="text-[11px] text-[#334155]">{row.original.country}</span>
        </div>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: 'Key Contact & Email',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span className="text-[#0F172A]">{row.original.contactPerson}</span>
          <span className="text-[11px] text-[#334155]">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'paymentTerms',
      header: 'Payment Terms',
      cell: ({ row }) => (
        <span className="text-xs text-[#0F172A]">{row.getValue('paymentTerms')}</span>
      ),
    },
    {
      accessorKey: 'totalImportedBDT',
      header: 'Total Procured (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-xs text-[#0F172A] text-right block">
          {formatBDT(row.original.totalImportedBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'totalPaidBDT',
      header: 'Settled to Date (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-xs text-[#166534] text-right block">
          {formatBDT(row.original.totalPaidBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'balanceDueBDT',
      header: 'Outstanding Payable',
      cell: ({ row }) => {
        const due = row.original.balanceDueBDT
        return (
          <span
            className={`font-mono font-bold text-xs text-right block ${
              due > 0 ? 'text-[#991B1B]' : 'text-[#334155]'
            }`}
          >
            {due > 0 ? formatBDT(due) : '—'}
          </span>
        )
      },
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
            onClick={() => navigate(`/suppliers/${row.original.id}`)}
          >
            <Eye className="h-3 w-3 mr-1 text-[#526B83]" />
            Ledger
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Global Fertilizer Suppliers</h2>
          <p className="text-xs text-[#334155]">
            International manufacturers (SABIC, QAFCO, OCP, Sinofert) and letter of credit terms
          </p>
        </div>
        <Button
          onClick={() => navigate('/suppliers/new')}
          className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Procurement Volume</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(totalImported)}
            </div>
            <span className="text-[11px] text-[#334155]">{suppliers.length} International Vendors</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Settled via Banking L/Cs</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(totalPaid)}
            </div>
            <span className="text-[11px] text-[#334155]">Disbursed to date</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Outstanding Trade Payable</span>
            <div className="text-xl font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(totalDue)}
            </div>
            <span className="text-[11px] text-[#334155]">L/C Usance & sight liabilities</span>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search suppliers by name, country, code..."
      />
    </div>
  )
}
