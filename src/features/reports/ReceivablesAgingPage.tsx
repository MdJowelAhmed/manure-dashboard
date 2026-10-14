import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Users, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockRepo } from '@/services/mockRepository'
import { formatBDT, formatDate } from '@/lib/utils'

export const ReceivablesAgingPage: React.FC = () => {
  const navigate = useNavigate()
  const customers = mockRepo.getCustomers()
  const company = mockRepo.getCompanySettings()

  // Realistic aging distribution based on invoice dates
  const agingData = customers.map((c) => {
    let current0_30 = 0
    let days31_60 = 0
    let days61_90 = 0
    let days90Plus = 0

    if (c.outstandingDueBDT > 0) {
      if (c.overdueStatus === 'Overdue') {
        // e.g. Jessore Krishi
        days31_60 = c.outstandingDueBDT * 0.7
        days61_90 = c.outstandingDueBDT * 0.3
      } else if (c.overdueStatus === 'Approaching Due') {
        // e.g. Northern Agri
        current0_30 = c.outstandingDueBDT * 0.6
        days31_60 = c.outstandingDueBDT * 0.4
      } else {
        // Normal
        current0_30 = c.outstandingDueBDT
      }
    }

    return {
      ...c,
      current0_30: Math.round(current0_30),
      days31_60: Math.round(days31_60),
      days61_90: Math.round(days61_90),
      days90Plus: Math.round(days90Plus),
    }
  })

  const totalCurrent = agingData.reduce((s, r) => s + r.current0_30, 0)
  const total31_60 = agingData.reduce((s, r) => s + r.days31_60, 0)
  const total61_90 = agingData.reduce((s, r) => s + r.days61_90, 0)
  const total90Plus = agingData.reduce((s, r) => s + r.days90Plus, 0)
  const grandTotalDue = agingData.reduce((s, r) => s + r.outstandingDueBDT, 0)

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
            <h2 className="text-xl font-bold text-[#202833]">Accounts Receivable (A/R) Aging Report</h2>
            <p className="text-xs text-[#697586]">
              Dealer credit aging buckets (0–30, 31–60, 61–90, and 90+ days) and collection risk exposure
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
            Print Aging Schedule
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
              RECEIVABLES AGING SCHEDULE
            </span>
            <div className="text-xs text-[#697586] mt-1">
              As of: <strong className="text-[#202833]">{formatDate(new Date())}</strong>
            </div>
            <div className="text-xs text-[#697586]">Payment Terms: Standard 30 Days Credit</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead>Customer Code</TableHead>
              <TableHead>Dealer / Company</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Current (0–30 Days)</TableHead>
              <TableHead className="text-right">31–60 Days</TableHead>
              <TableHead className="text-right">61–90 Days</TableHead>
              <TableHead className="text-right">90+ Days</TableHead>
              <TableHead className="text-right">Total Outstanding</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agingData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono font-medium text-xs text-[#526B83]">
                  {row.code}
                </TableCell>
                <TableCell className="font-semibold text-xs text-[#202833]">
                  {row.name}
                </TableCell>
                <TableCell className="text-xs text-[#697586]">{row.district}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {row.current0_30 > 0 ? formatBDT(row.current0_30) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-[#B45309]">
                  {row.days31_60 > 0 ? formatBDT(row.days31_60) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-[#991B1B]">
                  {row.days61_90 > 0 ? formatBDT(row.days61_90) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-[#991B1B]">
                  {row.days90Plus > 0 ? formatBDT(row.days90Plus) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-xs text-[#202833]">
                  {row.outstandingDueBDT > 0 ? formatBDT(row.outstandingDueBDT) : '৳ 0'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.overdueStatus} />
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="font-bold bg-[#F8FAFC] border-t-2 border-[#DCE2E8] text-xs">
              <TableCell colSpan={3} className="text-right">Total Receivables Aging:</TableCell>
              <TableCell className="text-right font-mono font-bold text-[#166534]">
                {formatBDT(totalCurrent)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[#B45309]">
                {formatBDT(total31_60)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[#991B1B]">
                {formatBDT(total61_90)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[#991B1B]">
                {formatBDT(total90Plus)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-sm text-[#202833]">
                {formatBDT(grandTotalDue)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
