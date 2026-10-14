import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

// Features
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ImportsListPage } from '@/features/imports/ImportsListPage'
import { NewImportPage } from '@/features/imports/NewImportPage'
import { ImportDetailPage } from '@/features/imports/ImportDetailPage'
import { PurchaseOrdersPage } from '@/features/imports/PurchaseOrdersPage'
import { GoodsReceiptsPage } from '@/features/imports/GoodsReceiptsPage'
import { InventoryOverviewPage } from '@/features/inventory/InventoryOverviewPage'
import { NewProductPage } from '@/features/inventory/NewProductPage'
import { ProductDetailPage } from '@/features/inventory/ProductDetailPage'
import { StockMovementsPage } from '@/features/inventory/StockMovementsPage'
import { StockAdjustmentsPage } from '@/features/inventory/StockAdjustmentsPage'
import { SalesListPage } from '@/features/sales/SalesListPage'
import { NewInvoicePage } from '@/features/sales/NewInvoicePage'
import { InvoiceDetailPage } from '@/features/sales/InvoiceDetailPage'
import { SalesReturnsPage } from '@/features/sales/SalesReturnsPage'
import { CustomersListPage } from '@/features/customers/CustomersListPage'
import { NewCustomerPage } from '@/features/customers/NewCustomerPage'
import { CustomerDetailPage } from '@/features/customers/CustomerDetailPage'
import { SuppliersListPage } from '@/features/suppliers/SuppliersListPage'
import { NewSupplierPage } from '@/features/suppliers/NewSupplierPage'
import { SupplierDetailPage } from '@/features/suppliers/SupplierDetailPage'
import { PaymentsListPage } from '@/features/payments/PaymentsListPage'
import { NewPaymentPage } from '@/features/payments/NewPaymentPage'
import { CashBankPage } from '@/features/payments/CashBankPage'
import { ExpensesListPage } from '@/features/expenses/ExpensesListPage'
import { ChartOfAccountsPage } from '@/features/accounting/ChartOfAccountsPage'
import { JournalsListPage } from '@/features/accounting/JournalsListPage'
import { NewJournalEntryPage } from '@/features/accounting/NewJournalEntryPage'
import { GeneralLedgerPage } from '@/features/accounting/GeneralLedgerPage'
import { TrialBalancePage } from '@/features/accounting/TrialBalancePage'
import { AccountingPeriodsPage } from '@/features/accounting/AccountingPeriodsPage'
import { ReportsHubPage } from '@/features/reports/ReportsHubPage'
import { ProfitLossPage } from '@/features/reports/ProfitLossPage'
import { BalanceSheetPage } from '@/features/reports/BalanceSheetPage'
import { CashFlowPage } from '@/features/reports/CashFlowPage'
import { InventoryValuationReportPage } from '@/features/reports/InventoryValuationReportPage'
import { ReceivablesAgingPage } from '@/features/reports/ReceivablesAgingPage'
import { PayablesAgingPage } from '@/features/reports/PayablesAgingPage'
import { SalesAnalysisReportPage } from '@/features/reports/SalesAnalysisReportPage'
import { ImportCostsReportPage } from '@/features/reports/ImportCostsReportPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Import & Procurement */}
          <Route path="imports" element={<ImportsListPage />} />
          <Route path="imports/new" element={<NewImportPage />} />
          <Route path="imports/:id" element={<ImportDetailPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="goods-receipts" element={<GoodsReceiptsPage />} />

          {/* Inventory */}
          <Route path="inventory" element={<InventoryOverviewPage />} />
          <Route path="inventory/products" element={<InventoryOverviewPage />} />
          <Route path="inventory/products/new" element={<NewProductPage />} />
          <Route path="inventory/products/:id" element={<ProductDetailPage />} />
          <Route path="inventory/movements" element={<StockMovementsPage />} />
          <Route path="inventory/adjustments" element={<StockAdjustmentsPage />} />

          {/* Sales */}
          <Route path="sales" element={<SalesListPage />} />
          <Route path="sales/new" element={<NewInvoicePage />} />
          <Route path="sales/:id" element={<InvoiceDetailPage />} />
          <Route path="sales-returns" element={<SalesReturnsPage />} />

          {/* Customers & Suppliers */}
          <Route path="customers" element={<CustomersListPage />} />
          <Route path="customers/new" element={<NewCustomerPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="suppliers" element={<SuppliersListPage />} />
          <Route path="suppliers/new" element={<NewSupplierPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />

          {/* Treasury, Cash & Expenses */}
          <Route path="payments" element={<PaymentsListPage />} />
          <Route path="payments/new" element={<NewPaymentPage />} />
          <Route path="cash-bank" element={<CashBankPage />} />
          <Route path="expenses" element={<ExpensesListPage />} />
          <Route path="expenses/new" element={<ExpensesListPage />} />

          {/* Double-Entry Accounting */}
          <Route path="accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
          <Route path="accounting/journals" element={<JournalsListPage />} />
          <Route path="accounting/journals/new" element={<NewJournalEntryPage />} />
          <Route path="accounting/general-ledger" element={<GeneralLedgerPage />} />
          <Route path="accounting/trial-balance" element={<TrialBalancePage />} />
          <Route path="accounting/periods" element={<AccountingPeriodsPage />} />

          {/* Reports */}
          <Route path="reports" element={<ReportsHubPage />} />
          <Route path="reports/profit-loss" element={<ProfitLossPage />} />
          <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
          <Route path="reports/cash-flow" element={<CashFlowPage />} />
          <Route path="reports/inventory-valuation" element={<InventoryValuationReportPage />} />
          <Route path="reports/receivables" element={<ReceivablesAgingPage />} />
          <Route path="reports/payables" element={<PayablesAgingPage />} />
          <Route path="reports/sales" element={<SalesAnalysisReportPage />} />
          <Route path="reports/import-costs" element={<ImportCostsReportPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
