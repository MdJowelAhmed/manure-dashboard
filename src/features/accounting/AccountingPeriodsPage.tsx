import React from 'react'
import { FileSpreadsheet, CheckCircle, Lock, Calendar, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export const AccountingPeriodsPage: React.FC = () => {
  const periods = [
    {
      id: 'fy-25-26',
      name: 'FY 2025 – 2026',
      startDate: '01 Jul 2025',
      endDate: '30 Jun 2026',
      status: 'Open / Current',
      audited: 'In Progress (Interim Review)',
      taxFiling: 'Advance Tax Deposited',
      notes: 'Active financial year accepting daily journal vouchers and sales entries.',
    },
    {
      id: 'fy-24-25',
      name: 'FY 2024 – 2025',
      startDate: '01 Jul 2024',
      endDate: '30 Jun 2025',
      status: 'Closed',
      audited: 'Audited by Rahman Rahman Huq CA',
      taxFiling: 'NBR Tax Return Filed (Acknowledged)',
      notes: 'Final books locked. Retained earnings transferred to opening balance.',
    },
    {
      id: 'fy-23-24',
      name: 'FY 2023 – 2024',
      startDate: '01 Jul 2023',
      endDate: '30 Jun 2024',
      status: 'Closed',
      audited: 'Audited by Rahman Rahman Huq CA',
      taxFiling: 'Assessment Completed',
      notes: 'Historical statutory financial statements archived.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202833]">Fiscal Years & Accounting Periods</h2>
          <p className="text-xs text-[#697586]">
            Bangladesh tax year cycle (01 July – 30 June) and annual book closing controls
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounting Periods Schedule</CardTitle>
          <CardDescription>
            Fiscal reporting periods, book closure locks, and statutory audit completion
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Period Window</TableHead>
                <TableHead>Period Status</TableHead>
                <TableHead>Statutory Audit</TableHead>
                <TableHead>Tax Filing (NBR)</TableHead>
                <TableHead>Ledger Lock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-xs text-[#202833]">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-xs text-[#697586]">
                    {p.startDate} — {p.endDate}
                  </TableCell>
                  <TableCell>
                    {p.status === 'Open / Current' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                        Open / Current
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#DCE2E8]">
                        Closed
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-[#202833]">{p.audited}</TableCell>
                  <TableCell className="text-xs text-[#697586]">{p.taxFiling}</TableCell>
                  <TableCell>
                    {p.status === 'Closed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#991B1B]">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#166534]">
                        <CheckCircle className="h-3 w-3" /> Unlocked
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
