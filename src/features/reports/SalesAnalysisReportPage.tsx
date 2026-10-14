import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const SalesAnalysisReportPage: React.FC = () => {
  const navigate = useNavigate()
  const invoices = mockRepo.getSalesInvoices()
  const products = mockRepo.getProducts()
  const customers = mockRepo.getCustomers()
  const company = mockRepo.getCompanySettings()

  // Aggregate sales by product
  const salesByProduct: Record<string, { name: string; quantityMT: number; totalBDT: number }> = {}
  products.forEach((p) => {
    salesByProduct[p.id] = { name: p.name, quantityMT: 0, totalBDT: 0 }
  })

  invoices.forEach((inv) => {
    inv.items.forEach((it) => {
      if (salesByProduct[it.productId]) {
        salesByProduct[it.productId].quantityMT += it.quantityInMT
        salesByProduct[it.productId].totalBDT += it.totalBDT
      }
    })
  })

  const totalSalesVolumeBDT = invoices.reduce((s, i) => s + i.totalAmountBDT, 0)
  const totalVolumeMT = Object.values(salesByProduct).reduce((s, p) => s + p.quantityMT, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#202833]">Domestic Sales Analysis Report</h2>
            <p className="text-xs text-[#697586]">
              Volume distribution by fertilizer product, regional dealer networks, and revenue metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print Sales Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#202833]">{company.companyName}</h3>
            <p className="text-xs text-[#697586]">{company.headOfficeAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              COMMODITY SALES PERFORMANCE
            </span>
            <div className="text-xs text-[#697586] mt-1">
              For Period: <strong>FY 2025 – 2026</strong>
            </div>
            <div className="text-xs text-[#697586]">Unit of Measurement: Metric Ton (MT) & BDT</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead>Commodity Title</TableHead>
              <TableHead className="text-right">Volume Dispatched (MT)</TableHead>
              <TableHead className="text-right">Average Realized Price / MT</TableHead>
              <TableHead className="text-right">Total Revenue (BDT)</TableHead>
              <TableHead className="text-right">Sales Share %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(salesByProduct)
              .filter((p) => p.quantityMT > 0)
              .map((prod, idx) => {
                const avgPrice = prod.quantityMT > 0 ? Math.round(prod.totalBDT / prod.quantityMT) : 0
                const share = totalSalesVolumeBDT > 0 ? (prod.totalBDT / totalSalesVolumeBDT) * 100 : 0
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-xs text-[#202833]">{prod.name}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
                      {prod.quantityMT.toLocaleString()} MT
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ৳ {avgPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-[#202833]">
                      {formatBDT(prod.totalBDT)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#697586]">
                      {share.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                )
              })}

            <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8] text-xs">
              <TableCell className="text-right">Total Domestic Dispatches:</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">
                {totalVolumeMT.toLocaleString()} MT
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-mono font-bold text-sm text-[#0F766E]">
                {formatBDT(totalSalesVolumeBDT)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">100.0%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
