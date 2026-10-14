import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Ship,
  PackageCheck,
  Boxes,
  FileSpreadsheet,
  Receipt,
  RotateCcw,
  Users,
  Building2,
  Banknote,
  WalletCards,
  Landmark,
  Scale,
  BookOpen,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  FileText,
  BadgePercent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleSidebar, setMobileSidebarOpen } from '@/store/uiSlice'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Trade & Logistics',
    items: [
      { title: 'Import Shipments', href: '/imports', icon: Ship, badge: 'Active' },
      { title: 'Purchase Orders', href: '/purchase-orders', icon: FileSpreadsheet },
      { title: 'Goods Receipts (GRN)', href: '/goods-receipts', icon: PackageCheck },
      { title: 'Inventory & Stock', href: '/inventory', icon: Boxes },
      { title: 'Stock Movements', href: '/inventory/movements', icon: Warehouse },
      { title: 'Stock Adjustments', href: '/inventory/adjustments', icon: BadgePercent },
    ],
  },
  {
    label: 'Sales & Distribution',
    items: [
      { title: 'Sales Invoices', href: '/sales', icon: Receipt },
      { title: 'Sales Returns', href: '/sales-returns', icon: RotateCcw },
      { title: 'Customers', href: '/customers', icon: Users },
      { title: 'Suppliers', href: '/suppliers', icon: Building2 },
    ],
  },
  {
    label: 'Treasury & Expense',
    items: [
      { title: 'Payments & Receipts', href: '/payments', icon: Banknote },
      { title: 'Cash & Bank Accounts', href: '/cash-bank', icon: Landmark },
      { title: 'Operating Expenses', href: '/expenses', icon: WalletCards },
    ],
  },
  {
    label: 'Double-Entry Accounting',
    items: [
      { title: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: Scale },
      { title: 'Journal Entries', href: '/accounting/journals', icon: BookOpen },
      { title: 'General Ledger', href: '/accounting/general-ledger', icon: FileText },
      { title: 'Trial Balance', href: '/accounting/trial-balance', icon: Scale },
      { title: 'Accounting Periods', href: '/accounting/periods', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Intelligence & Compliance',
    items: [
      { title: 'Financial Reports', href: '/reports', icon: PieChart },
      { title: 'Company Settings', href: '/settings', icon: Settings },
    ],
  },
]

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#DCE2E8] bg-white text-[#202833] transition-all duration-300 select-none z-30 shrink-0 h-screen sticky top-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#DCE2E8]">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-[#526B83] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              M
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-sm tracking-tight text-[#202833] leading-tight truncate">
                Meridian Business
              </span>
              <span className="text-[11px] text-[#697586] truncate">
                Fertilizer Import & Sales
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-9 w-9 rounded-lg bg-[#526B83] text-white flex items-center justify-center font-bold text-base shadow-sm">
            M
          </div>
        )}

        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-[#DCE2E8] text-[#697586] hover:bg-[#F1F5F9] hover:text-[#202833] transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links with custom scrollbar */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <h4 className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {group.label}
              </h4>
            )}
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    item.href !== '/inventory' &&
                    item.href !== '/accounting' &&
                    item.href !== '/reports' &&
                    location.pathname.startsWith(item.href))

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => dispatch(setMobileSidebarOpen(false))}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-[#EBF0F5] text-[#202833] font-semibold'
                        : 'text-[#526B83] hover:text-[#202833] hover:bg-[#F8FAFC]'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-[#526B83]' : 'text-[#697586] group-hover:text-[#202833]'
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Fixed Depot Notice / Single Warehouse Badge */}
      <div className="p-3 border-t border-[#DCE2E8] bg-[#F8FAFC]">
        {!collapsed ? (
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-[#DCE2E8]">
            <Warehouse className="h-4 w-4 text-[#526B83] mt-0.5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-[#202833] truncate">
                Khatunganj Central Depot
              </span>
              <span className="text-[10px] text-[#697586] truncate">
                Chattogram • 15,000 MT
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center py-1 text-[#526B83]"
            title="Khatunganj Central Depot (15,000 MT)"
          >
            <Warehouse className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  )
}
