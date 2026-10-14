import React, { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  RotateCcw,
  Plus,
  Calendar,
  Building,
  UserCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/store'
import { setMobileSidebarOpen, setDateRange, DateRangePreset, triggerDataRefresh } from '@/store/uiSlice'
import { mockRepo } from '@/services/mockRepository'
import { toast } from 'sonner'

export const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const dateRange = useAppSelector((state) => state.ui.dateRange)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Compute clean breadcrumbs from pathname
  const pathParts = location.pathname.split('/').filter(Boolean)
  const pageTitle = pathParts.length > 0
    ? pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Dashboard'

  const handleResetData = () => {
    mockRepo.resetAllData()
    dispatch(triggerDataRefresh())
    setResetDialogOpen(false)
    toast.success('Prototype data restored to initial baseline successfully!')
    // reload to ensure clean state
    window.location.reload()
  }

  const datePresets: { id: DateRangePreset; label: string }[] = [
    { id: 'this_month', label: 'March 2026' },
    { id: 'last_month', label: 'February 2026' },
    { id: 'this_quarter', label: 'Q1 2026 (Jan–Mar)' },
    { id: 'fy_2025_2026', label: 'FY 2025–2026' },
    { id: 'all', label: 'All Records' },
  ]

  const activePresetLabel = datePresets.find((p) => p.id === dateRange)?.label || 'All Records'

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#DCE2E8] bg-white px-4 md:px-6 shadow-xs select-none">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => dispatch(setMobileSidebarOpen(true))}
          >
            <Menu className="h-5 w-5 text-[#526B83]" />
          </Button>

          <div className="flex flex-col">
            <nav className="flex items-center gap-1.5 text-[11px] text-[#334155]">
              <Link to="/dashboard" className="hover:text-[#0F172A] transition-colors">
                Meridian
              </Link>
              {pathParts.map((part, index) => {
                const isLast = index === pathParts.length - 1
                const href = `/${pathParts.slice(0, index + 1).join('/')}`
                const label = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                return (
                  <React.Fragment key={href}>
                    <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
                    {isLast ? (
                      <span className="font-medium text-[#0F172A]">{label}</span>
                    ) : (
                      <Link to={href} className="hover:text-[#0F172A] transition-colors">
                        {label}
                      </Link>
                    )}
                  </React.Fragment>
                )
              })}
            </nav>
            <h1 className="text-base font-semibold text-[#0F172A] leading-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Date context, quick actions, owner profile */}
        <div className="flex items-center gap-2.5">
          {/* Prototype disclaimer pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F5F9] border border-[#DCE2E8] text-[11px] text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]"></span>
            <span>Interactive Prototype • BDT Currency</span>
          </div>

          {/* Date Context Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex text-xs h-8 gap-1.5 border-[#DCE2E8] font-normal">
                <Calendar className="h-3.5 w-3.5 text-[#526B83]" />
                <span>{activePresetLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Accounting Date Context</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {datePresets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => dispatch(setDateRange(preset.id))}
                  className={dateRange === preset.id ? 'font-semibold bg-[#F1F5F9]' : ''}
                >
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Create Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 gap-1 text-xs bg-[#526B83] hover:bg-[#3E5367]">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Transaction</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/sales/new')}>
                New Sales Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/imports/new')}>
                New Import Shipment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/payments/new')}>
                Record Payment / Receipt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/expenses/new')}>
                Record Operating Expense
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/accounting/journals/new')}>
                Post Manual Journal Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Baseline Data Button */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setResetDialogOpen(true)}
            title="Reset prototype demo data"
            className="text-[#334155] hover:text-[#B91C1C]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Owner Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 border-l border-[#DCE2E8] cursor-pointer outline-none">
                <div className="h-8 w-8 rounded-full bg-[#EBF0F5] border border-[#CBD5E1] text-[#334155] flex items-center justify-center font-semibold text-xs">
                  AF
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#0F172A] leading-none">
                    A. S. M. Faruq
                  </span>
                  <span className="text-[10px] text-[#334155] leading-tight">
                    Owner • Meridian
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0F172A]">A. S. M. Faruq</span>
                  <span className="text-[11px] text-[#334155]">faruq@meridian-bd.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Building className="h-3.5 w-3.5 mr-2 text-[#526B83]" />
                Company Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/accounting/chart-of-accounts')}>
                <UserCheck className="h-3.5 w-3.5 mr-2 text-[#526B83]" />
                Chart of Accounts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setResetDialogOpen(true)} className="text-[#B91C1C]">
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Reset Demo Baseline Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Prototype Data</DialogTitle>
            <DialogDescription>
              This will restore all products, imports, sales invoices, payments, journals, and
              account balances back to the initial baseline mock dataset. Any unsaved demo edits will be discarded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetData}>
              Reset Baseline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
