import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Ship, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const ImportCostsReportPage: React.FC = () => {
  const navigate = useNavigate()
  const imports = mockRepo.getImports()
  const company = mockRepo.getCompanySettings()

  let totalFob = 0
  let totalFreight = 0
  let totalInsurance = 0
  let totalDuty = 0
  let totalPort = 0
  let totalClearing = 0
  let totalInland = 0
  let grandLanded = 0

  imports.forEach((imp) => {
    totalFob += imp.costBreakdown.purchaseFobBDT
    totalFreight += imp.costBreakdown.oceanFreightBDT
    totalInsurance += imp.costBreakdown.marineInsuranceBDT
    totalDuty += imp.costBreakdown.customsDutyAssessmentBDT
    totalPort += imp.costBreakdown.portHandlingChargesBDT
    totalClearing += imp.costBreakdown.clearingAgentCommissionBDT
    totalInland += imp.costBreakdown.inlandTransportDepotBDT
    grandLanded += imp.totalImportCostBDT
  })

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
            <h2 className="text-xl font-bold text-[#202833]">Import Landed Cost Allocation Analysis</h2>
            <p className="text-xs text-[#697586]">
              Capitalized procurement costs: FOB purchase, ocean freight, marine insurance, customs, and port charges
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
            Print Cost Report
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
              LANDED COST ALLOCATION ANALYSIS
            </span>
            <div className="text-xs text-[#697586] mt-1">
              For Period: <strong>FY 2025 – 2026</strong>
            </div>
            <div className="text-xs text-[#697586]">Allocation Basis: Weight (Metric Tons)</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead>Consignment</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">FOB (BDT)</TableHead>
              <TableHead className="text-right">Ocean Freight</TableHead>
              <TableHead className="text-right">Insurance</TableHead>
              <TableHead className="text-right">Duty (NBR)</TableHead>
              <TableHead className="text-right">Port (CPA)</TableHead>
              <TableHead className="text-right">C&F & Inland</TableHead>
              <TableHead className="text-right">Total Landed</TableHead>
              <TableHead className="text-right">Landed / MT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((imp) => {
              const it = imp.items[0]
              const totalAncillary =
                imp.costBreakdown.clearingAgentCommissionBDT +
                imp.costBreakdown.inlandTransportDepotBDT
              return (
                <TableRow key={imp.id}>
                  <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                    {imp.importReference}
                  </TableCell>
                  <TableCell className="text-xs text-[#202833] max-w-[120px] truncate">
                    {imp.supplierName.split(' ')[0]}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatBDT(imp.costBreakdown.purchaseFobBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatBDT(imp.costBreakdown.oceanFreightBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatBDT(imp.costBreakdown.marineInsuranceBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatBDT(imp.costBreakdown.customsDutyAssessmentBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatBDT(imp.costBreakdown.portHandlingChargesBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatBDT(totalAncillary)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-[#202833]">
                    {formatBDT(imp.totalImportCostBDT)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-[#0F766E]">
                    ৳ {it ? it.finalLandedCostPerMT.toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
              )
            })}

            <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8] text-xs">
              <TableCell colSpan={2} className="text-right">
                Procurement Cost Totals:
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(totalFob)}</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(totalFreight)}</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(totalInsurance)}</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(totalDuty)}</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">{formatBDT(totalPort)}</TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">
                {formatBDT(totalClearing + totalInland)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-sm text-[#0F766E]">
                {formatBDT(grandLanded)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
