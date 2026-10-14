import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  Boxes,
  Plus,
  Warehouse,
  TrendingDown,
  ArrowUpDown,
  Eye,
  SlidersHorizontal,
  BadgeAlert,
  ArrowUpRight,
} from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MetricCard } from '@/components/shared/MetricCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { mockRepo } from '@/services/mockRepository'
import { Product } from '@/types'
import { formatBDT, formatCompactBDT } from '@/lib/utils'
import { useAppSelector } from '@/store'

export const InventoryOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const products = mockRepo.getProducts()
  const movements = mockRepo.getInventoryMovements()

  const totalStockMT = products.reduce((sum, p) => sum + p.stockMT, 0)
  const totalValuationBDT = products.reduce((sum, p) => sum + p.stockMT * p.landedCostPerMT, 0)
  const lowStockCount = products.filter((p) => p.stockMT <= p.reorderLevelMT).length

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#526B83] text-xs">
          {row.getValue('sku')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product Name & Category',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#0F172A]">{row.original.name}</span>
          <span className="text-[11px] text-[#334155]">{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: 'stockMT',
      header: 'Available Stock',
      cell: ({ row }) => {
        const item = row.original
        const bags = item.stockMT * (1000 / item.kgPerBag)
        return (
          <div className="flex flex-col text-right">
            <span className="font-mono font-bold text-sm text-[#0F172A]">
              {item.stockMT.toLocaleString()} MT
            </span>
            <span className="text-[11px] text-[#334155]">
              {Math.round(bags).toLocaleString()} Bags ({item.kgPerBag}kg)
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'landedCostPerMT',
      header: 'Landed Unit Cost',
      cell: ({ row }) => (
        <div className="flex flex-col text-right font-mono">
          <span className="font-medium text-xs text-[#0F172A]">
            ৳ {row.original.landedCostPerMT.toLocaleString()} / MT
          </span>
          <span className="text-[10px] text-[#334155]">
            ৳ {Math.round(row.original.landedCostPerMT / (1000 / row.original.kgPerBag)).toLocaleString()} / Bag
          </span>
        </div>
      ),
    },
    {
      id: 'valuation',
      header: 'Total Valuation (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm text-[#526B83] text-right block">
          {formatBDT(row.original.stockMT * row.original.landedCostPerMT)}
        </span>
      ),
    },
    {
      accessorKey: 'reorderLevelMT',
      header: 'Reorder Level',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#334155] text-right block">
          {row.getValue('reorderLevelMT')} MT
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
            onClick={() => navigate(`/inventory/products/${row.original.id}`)}
          >
            <Eye className="h-3 w-3 mr-1 text-[#526B83]" />
            Details
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Warehouse Inventory Management</h2>
          <p className="text-xs text-[#334155]">
            Stock levels, unit conversion matrices (MT / Bag / KG), and landed-cost valuation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory/adjustments')}
            className="text-xs h-9"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-[#526B83]" />
            Stock Adjustments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory/movements')}
            className="text-xs h-9"
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-[#526B83]" />
            Movement History
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/inventory/products/new')}
            className="text-xs h-9 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Warehouse Info Card & KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#FFFFFF] border-[#DCE2E8]">
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Fixed Storage Facility</span>
            <div className="text-base font-bold text-[#0F172A] mt-0.5 truncate">
              Khatunganj Central Depot
            </div>
            <span className="text-[11px] text-[#334155]">
              Capacity: 15,000 MT • Chattogram
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Physical Stock</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] mt-0.5">
              {totalStockMT.toLocaleString()} MT
            </div>
            <span className="text-[11px] text-[#334155]">
              Occupancy: {((totalStockMT / 15000) * 100).toFixed(1)}% of shed capacity
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Total Inventory Valuation</span>
            <div className="text-xl font-bold font-mono text-[#526B83] mt-0.5">
              {formatBDT(totalValuationBDT)}
            </div>
            <span className="text-[11px] text-[#334155]">Capitalized landed cost basis</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-[#334155]">Safety Stock Alerts</span>
            <div className="text-xl font-bold font-mono text-[#B45309] mt-0.5">
              {lowStockCount} Products
            </div>
            <span className="text-[11px] text-[#334155]">At or below reorder threshold</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Products DataTable */}
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products by SKU, name, category..."
      />
    </div>
  )
}
