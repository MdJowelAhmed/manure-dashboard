import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Receipt,
  Ship,
  Boxes,
  Banknote,
  WalletCards,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Scale,
  PackageCheck,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { computeFinancialSummary } from '@/lib/calculations'
import { formatBDT, formatCompactBDT, formatDate } from '@/lib/utils'
import { useAppSelector } from '@/store'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshCount = useAppSelector((state) => state.ui.refreshCount)
  const dateRange = useAppSelector((state) => state.ui.dateRange)

  // Retrieve current mock records
  const summary = computeFinancialSummary()
  const products = mockRepo.getProducts()
  const invoices = mockRepo.getSalesInvoices()
  const imports = mockRepo.getImports()
  const payments = mockRepo.getPayments()
  const lowStockProducts = products.filter((p) => p.stockMT <= p.reorderLevelMT)
  const dueInvoices = invoices.filter((i) => i.amountDueBDT > 0 && i.status !== 'Paid')

  // Believable monthly trends data (consistent with current totals)
  const monthlyData = [
    { month: 'Oct 25', sales: 18500000, expenses: 1950000, cogs: 14200000 },
    { month: 'Nov 25', sales: 24200000, expenses: 2100000, cogs: 18800000 },
    { month: 'Dec 25', sales: 31000000, expenses: 2250000, cogs: 24100000 },
    { month: 'Jan 26', sales: 38500000, expenses: 2300000, cogs: 29800000 },
    { month: 'Feb 26', sales: 57800000, expenses: 2450000, cogs: 44900000 },
    { month: 'Mar 26', sales: summary.grossSalesBDT - 96000000, expenses: summary.operatingExpensesBDT / 3, cogs: 45000000 },
  ]

  // Product stock distribution for chart
  const stockChartData = products.map((p) => ({
    name: p.name.split(' (')[0],
    stockMT: p.stockMT,
    valueLacs: Math.round((p.stockMT * p.landedCostPerMT) / 100000),
  }))

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-[#DCE2E8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#202833]">
              Business Operations Overview
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
              Operational • Active FY 25-26
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Sole Depot: Khatunganj Central Depot • International procurement & domestic distribution
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/sales/new')}
            className="text-xs h-8 bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Sales Invoice
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/imports/new')}
            className="text-xs h-8"
          >
            <Ship className="h-3.5 w-3.5 text-[#526B83]" />
            New Import
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/goods-receipts')}
            className="text-xs h-8"
          >
            <PackageCheck className="h-3.5 w-3.5 text-[#0F766E]" />
            Receive Stock
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/payments/new')}
            className="text-xs h-8"
          >
            <Banknote className="h-3.5 w-3.5 text-[#202833]" />
            Record Payment
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/expenses/new')}
            className="text-xs h-8"
          >
            <WalletCards className="h-3.5 w-3.5 text-[#697586]" />
            Record Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <MetricCard
          title="Total Sales (BDT)"
          value={formatCompactBDT(summary.netSalesBDT)}
          subvalue={`Gross: ${formatCompactBDT(summary.grossSalesBDT)}`}
          icon={Receipt}
          badge="Revenue"
        />
        <MetricCard
          title="Gross Profit"
          value={formatCompactBDT(summary.grossProfitBDT)}
          subvalue={`${summary.grossProfitMargin.toFixed(1)}% margin`}
          icon={TrendingUp}
          trend={{ value: `+${summary.grossProfitMargin.toFixed(1)}%`, isPositive: true }}
        />
        <MetricCard
          title="Operating Expenses"
          value={formatCompactBDT(summary.operatingExpensesBDT)}
          subvalue="Rent, Payroll & Ops"
          icon={WalletCards}
        />
        <MetricCard
          title="Accounts Receivable"
          value={formatCompactBDT(summary.accountsReceivableBDT)}
          subvalue="From local dealers"
          icon={Banknote}
          badge="A/R"
        />
        <MetricCard
          title="Accounts Payable"
          value={formatCompactBDT(summary.accountsPayableBDT)}
          subvalue="Supplier L/C dues"
          icon={Ship}
          badge="A/P"
        />
        <MetricCard
          title="Inventory Value"
          value={formatCompactBDT(summary.inventoryValueBDT)}
          subvalue="Landed cost basis"
          icon={Boxes}
          badge="Stock"
        />
      </div>

      {/* Secondary Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-[#DCE2E8] bg-white flex items-center justify-between">
          <div>
            <span className="text-xs text-[#697586]">Net Operating Profit</span>
            <div className="text-lg font-bold font-mono text-[#166534]">
              {formatBDT(summary.netProfitBDT)}
            </div>
            <span className="text-[11px] text-[#697586]">
              Net Margin: {summary.netProfitMargin.toFixed(1)}%
            </span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE2E8] bg-white flex items-center justify-between">
          <div>
            <span className="text-xs text-[#697586]">Total Liquid Bank & Cash</span>
            <div className="text-lg font-bold font-mono text-[#202833]">
              {formatBDT(summary.totalCashAndBankBDT)}
            </div>
            <span className="text-[11px] text-[#697586]">Eastern Bank & IBBL A/Cs</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1D4ED8]">
            <Banknote className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE2E8] bg-white flex items-center justify-between">
          <div>
            <span className="text-xs text-[#697586]">Trial Balance & Ledger Health</span>
            <div className="text-lg font-bold font-mono text-[#0F766E] flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5" />
              <span>Balanced (0.00 Diff)</span>
            </div>
            <span className="text-[11px] text-[#697586]">Double-entry integrity checked</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 text-[#526B83]"
            onClick={() => navigate('/accounting/trial-balance')}
          >
            View
          </Button>
        </div>
      </div>

      {/* Charts Section: Sales vs Expenses + Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Sales vs. Landed Cost & Expenses</CardTitle>
              <CardDescription>
                Monthly revenue trend vs. procurement cost and operating expenses (in BDT)
              </CardDescription>
            </div>
            <span className="text-xs text-[#697586] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
              6-Month Trend
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#697586', fontSize: 11 }}
                    axisLine={{ stroke: '#DCE2E8' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `৳ ${(val / 1000000).toFixed(0)}M`}
                    tick={{ fill: '#697586', fontSize: 11 }}
                    axisLine={{ stroke: '#DCE2E8' }}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatBDT(Number(value)), '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DCE2E8',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="sales" name="Sales (BDT)" fill="#526B83" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cogs" name="COGS (Landed Cost)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Operating Expenses" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock by Product Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Stock by Product (MT)</CardTitle>
            <CardDescription>
              Current available warehouse inventory at Khatunganj
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stockChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" tick={{ fill: '#697586', fontSize: 10 }} unit=" MT" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={75}
                    tick={{ fill: '#202833', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} MT`, 'Available Stock']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DCE2E8',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="stockMT" fill="#0F766E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Tables Grid: Invoices & Imports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Sales Invoices</CardTitle>
              <CardDescription>Latest dealer orders and collection status</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#526B83]"
              onClick={() => navigate('/sales')}
            >
              View All <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total (BDT)</TableHead>
                  <TableHead className="text-right">Due (BDT)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 5).map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer hover:bg-[#F8FAFC]"
                    onClick={() => navigate(`/sales/${inv.id}`)}
                  >
                    <TableCell className="font-mono font-medium text-[#526B83]">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium text-[#202833] max-w-[150px] truncate">
                      {inv.customerName}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatBDT(inv.totalAmountBDT)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[#991B1B]">
                      {inv.amountDueBDT > 0 ? formatBDT(inv.amountDueBDT) : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Import Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Import Shipments & Pipeline</CardTitle>
              <CardDescription>International bulk procurement tracking</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#526B83]"
              onClick={() => navigate('/imports')}
            >
              View All <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Import Ref</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Vessel / Arrival</TableHead>
                  <TableHead className="text-right">Landed Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.slice(0, 5).map((imp) => (
                  <TableRow
                    key={imp.id}
                    className="cursor-pointer hover:bg-[#F8FAFC]"
                    onClick={() => navigate(`/imports/${imp.id}`)}
                  >
                    <TableCell className="font-mono font-medium text-[#526B83]">
                      {imp.importReference}
                    </TableCell>
                    <TableCell className="font-medium text-[#202833] max-w-[140px] truncate">
                      {imp.supplierName}
                    </TableCell>
                    <TableCell className="text-xs text-[#697586]">
                      {imp.vesselName}
                      <div className="text-[10px] text-[#94A3B8]">
                        Exp: {formatDate(imp.expectedArrivalDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatBDT(imp.totalImportCostBDT)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={imp.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Due Payments & Low Stock Alerts Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Due Receivables */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#B45309]" />
              <span>Outstanding Customer Receivables ({dueInvoices.length} Dues)</span>
            </CardTitle>
            <CardDescription>
              Invoices requiring collection follow-up or payment recording
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Outstanding Due</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dueInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-medium text-xs">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-[#202833]">
                      {inv.customerName}
                    </TableCell>
                    <TableCell className="text-xs text-[#697586]">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[#991B1B]">
                      {formatBDT(inv.amountDueBDT)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px] px-2"
                        onClick={() => navigate('/payments/new')}
                      >
                        Collect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[#B45309]" />
              <span>Inventory Reorder Status ({lowStockProducts.length} Alert)</span>
            </CardTitle>
            <CardDescription>
              Products at or approaching minimum safety stock thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                    <TableCell className="font-medium text-xs text-[#202833]">
                      {prod.name}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {prod.stockMT} MT
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#697586]">
                      {prod.reorderLevelMT} MT
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={prod.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
