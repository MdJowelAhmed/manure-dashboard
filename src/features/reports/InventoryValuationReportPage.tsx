import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const InventoryValuationReportPage: React.FC = () => {
  const navigate = useNavigate()
  const products = mockRepo.getProducts()
  const company = mockRepo.getCompanySettings()

  const totalStockMT = products.reduce((s, p) => s + p.stockMT, 0)
  const totalValuationBDT = products.reduce((s, p) => s + p.stockMT * p.landedCostPerMT, 0)

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
            <h2 className="text-xl font-bold text-[#0F172A]">Inventory Valuation Report</h2>
            <p className="text-xs text-[#334155]">
              Capitalized landed cost asset valuation of physical stocks held at Khatunganj Central Depot
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
            Print Valuation Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">{company.companyName}</h3>
            <p className="text-xs text-[#334155]">{company.headOfficeAddress}</p>
            <p className="text-[11px] text-[#334155] mt-0.5">
              Depot: {company.warehouseName} ({company.warehouseAddress})
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              INVENTORY VALUATION STATEMENT
            </span>
            <div className="text-xs text-[#334155] mt-1">
              As of: <strong className="text-[#0F172A]">{formatDate(new Date())}</strong>
            </div>
            <div className="text-xs text-[#334155]">Valuation Basis: Capitalized Landed Cost</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead>SKU</TableHead>
              <TableHead>Commodity Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Available (MT)</TableHead>
              <TableHead className="text-right">50kg Bags</TableHead>
              <TableHead className="text-right">Landed Cost / MT</TableHead>
              <TableHead className="text-right">Landed Cost / Bag</TableHead>
              <TableHead className="text-right">Total Valuation (BDT)</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const bags = p.stockMT * (1000 / p.kgPerBag)
              const itemValuation = p.stockMT * p.landedCostPerMT
              const share = totalValuationBDT > 0 ? (itemValuation / totalValuationBDT) * 100 : 0
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                    {p.sku}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-[#0F172A]">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-xs text-[#334155]">{p.category}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">
                    {p.stockMT.toLocaleString()} MT
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#334155]">
                    {Math.round(bags).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ৳ {p.landedCostPerMT.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#334155]">
                    ৳ {Math.round(p.landedCostPerMT / (1000 / p.kgPerBag)).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-[#0F172A]">
                    {formatBDT(itemValuation)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#334155]">
                    {share.toFixed(1)}%
                  </TableCell>
                </TableRow>
              )
            })}
            <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8]">
              <TableCell colSpan={3} className="text-right text-xs">
                Depot Inventory Valuation Total:
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">
                {totalStockMT.toLocaleString()} MT
              </TableCell>
              <TableCell colSpan={3}></TableCell>
              <TableCell className="text-right font-mono font-bold text-sm text-[#0F766E]">
                {formatBDT(totalValuationBDT)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">100.0%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
