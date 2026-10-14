import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Scale, Plus, CheckCircle, ShieldCheck } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { Account, AccountType } from '@/types'
import { formatBDT } from '@/lib/utils'

export const ChartOfAccountsPage: React.FC = () => {
  const accounts = mockRepo.getChartOfAccounts()
  const [selectedType, setSelectedType] = useState<string>('ALL')

  const filtered = selectedType === 'ALL'
    ? accounts
    : accounts.filter((a) => a.type === selectedType)

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'code',
      header: 'Account Code',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#526B83]">
          {row.getValue('code')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Account Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#202833]">{row.original.name}</span>
          <span className="text-[11px] text-[#697586]">{row.original.description}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Account Classification',
      cell: ({ row }) => {
        const type = row.getValue('type') as AccountType
        const colors: Record<AccountType, string> = {
          Asset: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          Liability: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
          Equity: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
          Revenue: 'bg-[#ECFDF5] text-[#0F766E] border-[#A7F3D0]',
          Expense: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${colors[type] || ''}`}
          >
            {type}
          </span>
        )
      },
    },
    {
      accessorKey: 'balanceBDT',
      header: 'Current Balance (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#202833] text-right block">
          {formatBDT(row.getValue('balanceBDT'))}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#166534]">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Standard Chart of Accounts (COA)</h2>
          <p className="text-xs text-[#697586]">
            Full double-entry ledger classification for assets, liabilities, equity, revenue, and expenses
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
            className={`text-xs h-8 ${
              selectedType === type ? 'bg-[#526B83] text-white' : ''
            }`}
          >
            {type === 'ALL' ? 'All Accounts' : `${type}s`}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search accounts by code, name, classification..."
      />
    </div>
  )
}
