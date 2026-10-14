import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Building2, Ship } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const PayablesAgingPage: React.FC = () => {
  const navigate = useNavigate()
  const suppliers = mockRepo.getSuppliers()
  const imports = mockRepo.getImports()
  const company = mockRepo.getCompanySettings()

  const totalPayable = suppliers.reduce((s, sup) => s + sup.balanceDueBDT, 0)
  const totalSettled = suppliers.reduce((s, sup) => s + sup.totalPaidBDT, 0)

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
            <h2 className="text-xl font-bold text-[#0F172A]">Accounts Payable (A/P) Schedule</h2>
            <p className="text-xs text-[#334155]">
              Trade supplier liabilities, import L/C usance maturities, and banking commitments
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
            Print Payables Schedule
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE2E8] p-6 sm:p-8 print-card space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#DCE2E8]">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">{company.companyName}</h3>
            <p className="text-xs text-[#334155]">{company.headOfficeAddress}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526B83]">
              TRADE PAYABLES SCHEDULE
            </span>
            <div className="text-xs text-[#334155] mt-1">
              As of: <strong className="text-[#0F172A]">{formatDate(new Date())}</strong>
            </div>
            <div className="text-xs text-[#334155]">Foreign Currency L/Cs Valued in BDT</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead>Supplier Code</TableHead>
              <TableHead>Exporter / Manufacturer</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>L/C Payment Terms</TableHead>
              <TableHead className="text-right">Total Contract (BDT)</TableHead>
              <TableHead className="text-right">Settled to Date</TableHead>
              <TableHead className="text-right">Outstanding Payable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((sup) => (
              <TableRow key={sup.id}>
                <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                  {sup.code}
                </TableCell>
                <TableCell className="font-semibold text-xs text-[#0F172A]">
                  {sup.name}
                </TableCell>
                <TableCell className="text-xs text-[#334155]">{sup.country}</TableCell>
                <TableCell className="text-xs text-[#0F172A]">{sup.paymentTerms}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatBDT(sup.totalImportedBDT)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-[#166534]">
                  {formatBDT(sup.totalPaidBDT)}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-xs text-[#991B1B]">
                  {sup.balanceDueBDT > 0 ? formatBDT(sup.balanceDueBDT) : '৳ 0'}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8] text-xs">
              <TableCell colSpan={4} className="text-right">Total Trade Payables Due:</TableCell>
              <TableCell className="text-right font-mono font-bold">
                {formatBDT(suppliers.reduce((s, sup) => s + sup.totalImportedBDT, 0))}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[#166534]">
                {formatBDT(totalSettled)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-sm text-[#991B1B]">
                {formatBDT(totalPayable)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
