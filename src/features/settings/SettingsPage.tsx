import React, { useState } from 'react'
import {
  Settings,
  Building,
  Warehouse,
  Scale,
  Calendar,
  RotateCcw,
  ShieldCheck,
  FileText,
  Download,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockRepo } from '@/services/mockRepository'
import { CompanySettings } from '@/types'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const currentSettings = mockRepo.getCompanySettings()
  const auditLogs = mockRepo.getAuditLogs()

  const [form, setForm] = useState<CompanySettings>(currentSettings)

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setForm({ ...form, [field]: value })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    mockRepo.saveCompanySettings(form)
    dispatch(triggerDataRefresh())
    toast.success('Company settings and parameters updated successfully!')
  }

  const handleExportJSON = () => {
    const data = {
      company: mockRepo.getCompanySettings(),
      products: mockRepo.getProducts(),
      suppliers: mockRepo.getSuppliers(),
      customers: mockRepo.getCustomers(),
      imports: mockRepo.getImports(),
      invoices: mockRepo.getSalesInvoices(),
      accounts: mockRepo.getCashBankAccounts(),
      journals: mockRepo.getJournalEntries(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meridian-business-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Prototype data exported as JSON backup!')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">System & Enterprise Settings</h2>
          <p className="text-xs text-[#334155]">
            Company profile, warehouse configurations, accounting period parameters, and audit trails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1 text-[#526B83]" />
            Export JSON Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="warehouse">Depot Configuration</TabsTrigger>
          <TabsTrigger value="accounting">Accounting Parameters</TabsTrigger>
          <TabsTrigger value="audit">System Audit Trail ({auditLogs.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Business Entity & Legal Identification</CardTitle>
                <CardDescription>
                  Bangladeshi trade license, BIN, TIN, and commercial credentials printed on invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label required>Company Legal Name</Label>
                    <Input
                      value={form.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label required>Brand Trading Name</Label>
                    <Input
                      value={form.tradingName}
                      onChange={(e) => handleChange('tradingName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label required>Trade License #</Label>
                    <Input
                      value={form.tradeLicense}
                      onChange={(e) => handleChange('tradeLicense', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label required>Business Identification (BIN)</Label>
                    <Input
                      value={form.binNumber}
                      onChange={(e) => handleChange('binNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label required>Tax Identification (TIN)</Label>
                    <Input
                      value={form.tinNumber}
                      onChange={(e) => handleChange('tinNumber', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label required>Corporate Head Office Address</Label>
                  <Input
                    value={form.headOfficeAddress}
                    onChange={(e) => handleChange('headOfficeAddress', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label required>Telephone / Mobile</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label required>Operations Email</Label>
                    <Input
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#526B83] hover:bg-[#3E5367] text-white text-xs h-9"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save Profile Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Warehouse Info */}
        <TabsContent value="warehouse">
          <Card>
            <CardHeader>
              <CardTitle>Central Storage Depot Configuration</CardTitle>
              <CardDescription>
                Fixed single warehouse facility specifications for bulk fertilizer intake and discharge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Warehouse Facility Name</Label>
                  <Input value={form.warehouseName} disabled className="bg-[#F8FAFC]" />
                </div>
                <div className="space-y-1.5">
                  <Label>Maximum Storage Capacity</Label>
                  <Input
                    value={`${form.warehouseCapacityMT.toLocaleString()} Metric Tons (MT)`}
                    disabled
                    className="bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Physical Depot Address</Label>
                <Input value={form.warehouseAddress} disabled className="bg-[#F8FAFC]" />
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE2E8] space-y-2">
                <h4 className="font-semibold text-xs text-[#0F172A]">
                  Single Warehouse Architectural Notice
                </h4>
                <p className="text-xs text-[#334155] leading-relaxed">
                  Per the business requirements, Meridian operates a centralized distribution model through
                  Khatunganj Central Depot. Multi-warehouse routing and stock transfer workflows are intentionally
                  omitted to maintain an uncluttered enterprise finance interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Accounting */}
        <TabsContent value="accounting">
          <Card>
            <CardHeader>
              <CardTitle>Accounting Standards & Unit Conversions</CardTitle>
              <CardDescription>Base currency, fiscal year, and bag conversion ratios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Base Currency</Label>
                  <Input value="BDT — Bangladeshi Taka (৳)" disabled className="bg-[#F8FAFC]" />
                </div>
                <div className="space-y-1.5">
                  <Label>Current Financial Year</Label>
                  <Input value={form.financialYear} disabled className="bg-[#F8FAFC]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Sales Invoice Prefix</Label>
                  <Input value={form.invoicePrefix} disabled className="bg-[#F8FAFC]" />
                </div>
                <div className="space-y-1.5">
                  <Label>Import Consignment Prefix</Label>
                  <Input value={form.importPrefix} disabled className="bg-[#F8FAFC]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE2E8] space-y-2">
                <h4 className="font-semibold text-xs text-[#0F172A]">Standard Unit Conversions</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 bg-white rounded border border-[#DCE2E8]">1 MT = 1,000 KG</div>
                  <div className="p-2 bg-white rounded border border-[#DCE2E8]">1 MT = 20 Bags (50kg)</div>
                  <div className="p-2 bg-white rounded border border-[#DCE2E8]">1 MT = 40 Bags (25kg)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Audit Trail */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>System Audit & Action Logs</CardTitle>
              <CardDescription>
                Chronological security trail of all transaction postings, stock adjustments, and settings changes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Activity Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-[#334155]">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-[#0F172A]">{log.user}</TableCell>
                      <TableCell className="text-xs">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F1F5F9] border border-[#DCE2E8]">
                          {log.module}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-[#526B83]">{log.action}</TableCell>
                      <TableCell className="text-xs text-[#334155]">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
