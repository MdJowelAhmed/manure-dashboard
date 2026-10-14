import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Receipt, Eye, Printer, RotateCcw, Banknote } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { SalesInvoice } from '@/types'
import { formatBDT, formatDate } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const SalesListPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const invoices = mockRepo.getSalesInvoices()

  const totalSales = invoices.reduce((s, i) => s + i.totalAmountBDT, 0)
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaidBDT, 0)
  const totalDue = invoices.reduce((s, i) => s + i.amountDueBDT, 0)
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length

  const columns: ColumnDef<SalesInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('invoiceNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer / District',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#0F172A]">{row.original.customerName}</span>
          <span className="text-[11px] text-[#334155]">{row.original.customerDistrict}</span>
        </div>
      ),
    },
    {
      accessorKey: 'invoiceDate',
      header: 'Invoice Date',
      cell: ({ row }) => formatDate(row.getValue('invoiceDate')),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const item = row.original
        return (
          <span className={item.status === 'Overdue' ? 'text-[#991B1B] font-medium' : ''}>
            {formatDate(item.dueDate)}
          </span>
        )
      },
    },
    {
      id: 'items',
      header: 'Delivered Items',
      cell: ({ row }) => {
        const items = row.original.items
        return (
          <div className="flex flex-col text-xs">
            {items.map((it) => (
              <span key={it.id}>
                {it.productName.split(' (')[0]}: <strong>{it.quantity} {it.unit}</strong>
              </span>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmountBDT',
      header: 'Total (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#0F172A] text-right block">
          {formatBDT(row.original.totalAmountBDT)}
        </span>
      ),
    },
    {
      accessorKey: 'amountDueBDT',
      header: 'Outstanding Due',
      cell: ({ row }) => {
        const due = row.original.amountDueBDT
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
      accessorKey: 'status',
      header: 'Payment Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const inv = row.original
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => navigate(`/sales/${inv.id}`)}
              title="View Invoice & Print"
            >
              <Eye className="h-3.5 w-3.5 text-[#526B83]" />
            </Button>
            {inv.amountDueBDT > 0 && (
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => navigate('/payments/new')}
                title="Record Receipt"
              >
                <Banknote className="h-3.5 w-3.5 text-[#0F766E]" />
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
          <h2 className="text-xl font-bold text-[#0F172A]">Domestic Sales Invoices</h2>
          <p className="text-xs text-[#334155]">
            Fertilizer distribution delivery challans, billing, payment status, and receivables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/sales-returns')}
            className="text-xs h-9"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Sales Returns
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/sales/new')}
            className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Sales Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Billed Volume</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(totalSales)}
            </div>
            <span className="text-[11px] text-[#334155]">{invoices.length} Invoices Issued</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Collections Received</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(totalPaid)}
            </div>
            <span className="text-[11px] text-[#334155]">Deposited to Eastern Bank Ops</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Outstanding Receivables</span>
            <div className="text-xl font-bold font-mono text-[#991B1B] mt-0.5">
              {formatBDT(totalDue)}
            </div>
            <span className="text-[11px] text-[#334155]">Dealers and regional distributors</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Overdue Accounts</span>
            <div className="text-xl font-bold font-mono text-[#B45309] mt-0.5">
              {overdueCount} Invoices
            </div>
            <span className="text-[11px] text-[#334155]">Exceeded payment credit window</span>
          </CardContent>
        </Card>
      </div>

      {/* Invoices DataTable */}
      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Search invoices by customer, number, district..."
      />
    </div>
  )
}
