import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Banknote, Plus, Landmark, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { PaymentRecord } from '@/types'
import { formatBDT, formatDate } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const PaymentsListPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const payments = mockRepo.getPayments()

  const receipts = payments.filter((p) => p.paymentType === 'Customer Receipt')
  const disbursements = payments.filter((p) => p.paymentType === 'Supplier Payment')

  const totalReceipts = receipts.reduce((s, p) => s + p.amountBDT, 0)
  const totalDisbursed = disbursements.reduce((s, p) => s + p.amountBDT, 0)

  const columns: ColumnDef<PaymentRecord>[] = [
    {
      accessorKey: 'paymentNumber',
      header: 'Voucher #',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('paymentNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'paymentType',
      header: 'Transaction Type',
      cell: ({ row }) => {
        const type = row.getValue('paymentType') as string
        const isReceipt = type === 'Customer Receipt'
        return (
          <div className="flex items-center gap-1.5">
            {isReceipt ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                <ArrowDownLeft className="h-3 w-3" />
                Customer Receipt
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                <ArrowUpRight className="h-3 w-3" />
                Supplier Payment
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'partyName',
      header: 'Party (Dealer / Supplier)',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-[#0F172A]">
          {row.getValue('partyName')}
        </span>
      ),
    },
    {
      accessorKey: 'amountBDT',
      header: 'Amount (BDT)',
      cell: ({ row }) => {
        const isReceipt = row.original.paymentType === 'Customer Receipt'
        return (
          <span
            className={`font-mono font-bold text-xs text-right block ${
              isReceipt ? 'text-[#166534]' : 'text-[#0F172A]'
            }`}
          >
            {isReceipt ? `+${formatBDT(row.original.amountBDT)}` : `-${formatBDT(row.original.amountBDT)}`}
          </span>
        )
      },
    },
    {
      accessorKey: 'bankAccountName',
      header: 'Bank / Cash Account',
      cell: ({ row }) => (
        <span className="text-xs text-[#334155] truncate max-w-[180px] block">
          {row.getValue('bankAccountName')}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => (
        <span className="text-xs text-[#0F172A]">{row.getValue('paymentMethod')}</span>
      ),
    },
    {
      accessorKey: 'allocatedReference',
      header: 'Allocated Ref',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#526B83]">
          {row.getValue('allocatedReference') || 'Unallocated'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Payments, Receipts & Treasury</h2>
          <p className="text-xs text-[#334155]">
            Customer invoice collections, supplier import disbursements, and banking vouchers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/cash-bank')}
            className="text-xs h-9"
          >
            <Landmark className="h-3.5 w-3.5 mr-1 text-[#526B83]" />
            Cash & Bank Balances
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/payments/new')}
            className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Record Payment / Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Customer Collections (Inflow)</span>
            <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
              {formatBDT(totalReceipts)}
            </div>
            <span className="text-[11px] text-[#334155]">{receipts.length} Receipt Vouchers</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Supplier Disbursements (Outflow)</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {formatBDT(totalDisbursed)}
            </div>
            <span className="text-[11px] text-[#334155]">{disbursements.length} L/C Settlements</span>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search vouchers by reference, party, account..."
      />
    </div>
  )
}
