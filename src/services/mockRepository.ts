import {
  Product,
  Supplier,
  Customer,
  ImportShipment,
  SalesInvoice,
  SalesReturn,
  CashBankAccount,
  PaymentRecord,
  ExpenseRecord,
  InventoryMovement,
  StockAdjustment,
  Account,
  JournalEntry,
  AuditLog,
  CompanySettings,
  GoodsReceipt,
} from '@/types'
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_IMPORTS,
  INITIAL_SALES_INVOICES,
  INITIAL_SALES_RETURNS,
  INITIAL_CASH_BANK_ACCOUNTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_COMPANY_SETTINGS,
} from '@/mocks/mockData'
import { getStoredItem, setStoredItem, clearStoredPrototypeData } from './storageAdapter'

class MockRepository {
  // Products
  getProducts(): Product[] {
    return getStoredItem('products', INITIAL_PRODUCTS)
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id)
  }

  saveProduct(product: Product): void {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === product.id)
    if (index >= 0) {
      products[index] = product
    } else {
      products.unshift(product)
    }
    setStoredItem('products', products)
    this.addAuditLog('Product Saved', 'Inventory', `Saved product: ${product.name} (${product.sku})`)
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return getStoredItem('suppliers', INITIAL_SUPPLIERS)
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.getSuppliers().find((s) => s.id === id)
  }

  saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers()
    const index = list.findIndex((s) => s.id === supplier.id)
    if (index >= 0) {
      list[index] = supplier
    } else {
      list.unshift(supplier)
    }
    setStoredItem('suppliers', list)
    this.addAuditLog('Supplier Saved', 'Suppliers', `Saved supplier: ${supplier.name}`)
  }

  // Customers
  getCustomers(): Customer[] {
    return getStoredItem('customers', INITIAL_CUSTOMERS)
  }

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id)
  }

  saveCustomer(customer: Customer): void {
    const list = this.getCustomers()
    const index = list.findIndex((c) => c.id === customer.id)
    if (index >= 0) {
      list[index] = customer
    } else {
      list.unshift(customer)
    }
    setStoredItem('customers', list)
    this.addAuditLog('Customer Saved', 'Customers', `Saved customer: ${customer.name}`)
  }

  // Imports
  getImports(): ImportShipment[] {
    return getStoredItem('imports', INITIAL_IMPORTS)
  }

  getImportById(id: string): ImportShipment | undefined {
    return this.getImports().find((imp) => imp.id === id)
  }

  saveImport(shipment: ImportShipment): void {
    const list = this.getImports()
    const index = list.findIndex((i) => i.id === shipment.id)
    if (index >= 0) {
      list[index] = shipment
    } else {
      list.unshift(shipment)
    }
    setStoredItem('imports', list)
    this.addAuditLog('Import Updated', 'Imports', `Saved import shipment: ${shipment.importReference}`)
  }

  addGoodsReceipt(receipt: GoodsReceipt): void {
    const shipment = this.getImportById(receipt.importId)
    if (!shipment) return

    shipment.goodsReceipts.push(receipt)
    const totalReceivedMT = shipment.goodsReceipts.reduce((sum, gr) => sum + gr.receivedMT, 0)
    const totalOrderedMT = shipment.items.reduce((sum, item) => sum + item.orderedQuantityMT, 0)

    if (totalReceivedMT >= totalOrderedMT) {
      shipment.status = 'Received'
    } else if (totalReceivedMT > 0) {
      shipment.status = 'Partially Received'
    }

    this.saveImport(shipment)

    // Update product stock and movement
    if (shipment.items.length > 0) {
      const mainItem = shipment.items[0]
      const product = this.getProductById(mainItem.productId)
      if (product) {
        product.stockMT += receipt.receivedMT
        if (product.stockMT > product.reorderLevelMT) {
          product.status = 'In Stock'
        }
        this.saveProduct(product)

        this.addInventoryMovement({
          id: `mov-${Date.now()}`,
          date: receipt.receivedDate,
          productId: product.id,
          productName: product.name,
          movementType: 'Import Receipt',
          reference: `${receipt.receiptNumber} (${shipment.importReference})`,
          quantityMT: receipt.receivedMT,
          balanceAfterMT: product.stockMT,
          unitCostBDT: mainItem.finalLandedCostPerMT || product.landedCostPerMT,
          notes: receipt.notes || `Stock received from ${shipment.supplierName}`,
        })
      }
    }
  }

  // Sales Invoices
  getSalesInvoices(): SalesInvoice[] {
    return getStoredItem('salesInvoices', INITIAL_SALES_INVOICES)
  }

  getSalesInvoiceById(id: string): SalesInvoice | undefined {
    return this.getSalesInvoices().find((inv) => inv.id === id)
  }

  saveSalesInvoice(invoice: SalesInvoice): void {
    const list = this.getSalesInvoices()
    const index = list.findIndex((i) => i.id === invoice.id)
    const isNew = index < 0

    if (isNew) {
      list.unshift(invoice)
      // Deduct stock for new invoices
      invoice.items.forEach((item) => {
        const prod = this.getProductById(item.productId)
        if (prod) {
          prod.stockMT = Math.max(0, prod.stockMT - item.quantityInMT)
          if (prod.stockMT <= 0) {
            prod.status = 'Out of Stock'
          } else if (prod.stockMT <= prod.reorderLevelMT) {
            prod.status = 'Low Stock'
          }
          this.saveProduct(prod)

          this.addInventoryMovement({
            id: `mov-${Date.now()}-${Math.random()}`,
            date: invoice.invoiceDate,
            productId: prod.id,
            productName: prod.name,
            movementType: 'Sales Delivery',
            reference: `${invoice.deliveryChallanNo || invoice.invoiceNumber}`,
            quantityMT: -item.quantityInMT,
            balanceAfterMT: prod.stockMT,
            unitCostBDT: prod.landedCostPerMT,
            notes: `Dispatched to ${invoice.customerName}`,
          })
        }
      })

      // Update customer balance
      const customer = this.getCustomerById(invoice.customerId)
      if (customer) {
        customer.totalSalesBDT += invoice.totalAmountBDT
        customer.outstandingDueBDT += invoice.amountDueBDT
        this.saveCustomer(customer)
      }
    } else {
      list[index] = invoice
    }

    setStoredItem('salesInvoices', list)
    this.addAuditLog(
      isNew ? 'Created Sales Invoice' : 'Updated Sales Invoice',
      'Sales',
      `Invoice: ${invoice.invoiceNumber} (${invoice.customerName}) - ৳ ${invoice.totalAmountBDT.toLocaleString()}`
    )
  }

  // Sales Returns
  getSalesReturns(): SalesReturn[] {
    return getStoredItem('salesReturns', INITIAL_SALES_RETURNS)
  }

  saveSalesReturn(ret: SalesReturn): void {
    const list = this.getSalesReturns()
    list.unshift(ret)
    setStoredItem('salesReturns', list)

    // Restock product if marked restocked
    if (ret.restocked) {
      const prod = this.getProductById(ret.productId)
      if (prod) {
        prod.stockMT += ret.returnedQuantityMT
        this.saveProduct(prod)

        this.addInventoryMovement({
          id: `mov-ret-${Date.now()}`,
          date: ret.returnDate,
          productId: prod.id,
          productName: prod.name,
          movementType: 'Sales Return',
          reference: ret.returnNumber,
          quantityMT: ret.returnedQuantityMT,
          balanceAfterMT: prod.stockMT,
          unitCostBDT: prod.landedCostPerMT,
          notes: `Returned: ${ret.reason}`,
        })
      }
    }

    // Update customer outstanding balance
    const customer = this.getCustomerById(ret.customerId)
    if (customer) {
      customer.outstandingDueBDT = Math.max(0, customer.outstandingDueBDT - ret.refundAmountBDT)
      this.saveCustomer(customer)
    }

    this.addAuditLog('Sales Return Processed', 'Sales', `Return ${ret.returnNumber} for ${ret.customerName}`)
  }

  // Payments & Cash/Bank
  getCashBankAccounts(): CashBankAccount[] {
    return getStoredItem('cashBankAccounts', INITIAL_CASH_BANK_ACCOUNTS)
  }

  getPayments(): PaymentRecord[] {
    return getStoredItem('payments', INITIAL_PAYMENTS)
  }

  savePayment(payment: PaymentRecord): void {
    const payments = this.getPayments()
    payments.unshift(payment)
    setStoredItem('payments', payments)

    // Update bank account balance
    const accounts = this.getCashBankAccounts()
    const account = accounts.find((a) => a.id === payment.bankAccountId)
    if (account) {
      if (payment.paymentType === 'Customer Receipt') {
        account.currentBalanceBDT += payment.amountBDT
      } else {
        account.currentBalanceBDT -= payment.amountBDT
      }
      setStoredItem('cashBankAccounts', accounts)
    }

    // If allocated to customer invoice
    if (payment.paymentType === 'Customer Receipt' && payment.allocatedInvoiceOrImportId) {
      const inv = this.getSalesInvoiceById(payment.allocatedInvoiceOrImportId)
      if (inv) {
        inv.amountPaidBDT += payment.amountBDT
        inv.amountDueBDT = Math.max(0, inv.totalAmountBDT - inv.amountPaidBDT)
        inv.status = inv.amountDueBDT === 0 ? 'Paid' : 'Partially Paid'
        this.saveSalesInvoice(inv)
      }
      const customer = this.getCustomerById(payment.partyId)
      if (customer) {
        customer.totalPaidBDT += payment.amountBDT
        customer.outstandingDueBDT = Math.max(0, customer.outstandingDueBDT - payment.amountBDT)
        this.saveCustomer(customer)
      }
    }

    // If allocated to supplier import bill
    if (payment.paymentType === 'Supplier Payment' && payment.allocatedInvoiceOrImportId) {
      const imp = this.getImportById(payment.allocatedInvoiceOrImportId)
      if (imp) {
        imp.totalPaidBDT += payment.amountBDT
        imp.balanceDueBDT = Math.max(0, imp.totalImportCostBDT - imp.totalPaidBDT)
        this.saveImport(imp)
      }
      const supplier = this.getSupplierById(payment.partyId)
      if (supplier) {
        supplier.totalPaidBDT += payment.amountBDT
        supplier.balanceDueBDT = Math.max(0, supplier.balanceDueBDT - payment.amountBDT)
        this.saveSupplier(supplier)
      }
    }

    this.addAuditLog(
      'Payment Recorded',
      'Payments',
      `${payment.paymentType}: ৳ ${payment.amountBDT.toLocaleString()} (${payment.partyName})`
    )
  }

  // Operating Expenses
  getExpenses(): ExpenseRecord[] {
    return getStoredItem('expenses', INITIAL_EXPENSES)
  }

  saveExpense(expense: ExpenseRecord): void {
    const list = this.getExpenses()
    list.unshift(expense)
    setStoredItem('expenses', list)

    // Deduct from bank/cash account
    const accounts = this.getCashBankAccounts()
    const account = accounts.find((a) => a.id === expense.paymentAccountId)
    if (account) {
      account.currentBalanceBDT -= expense.amountBDT
      setStoredItem('cashBankAccounts', accounts)
    }

    this.addAuditLog(
      'Expense Recorded',
      'Expenses',
      `Expense: ${expense.category} - ৳ ${expense.amountBDT.toLocaleString()} to ${expense.payee}`
    )
  }

  // Inventory Movements & Adjustments
  getInventoryMovements(): InventoryMovement[] {
    return getStoredItem('inventoryMovements', INITIAL_INVENTORY_MOVEMENTS)
  }

  addInventoryMovement(movement: InventoryMovement): void {
    const list = this.getInventoryMovements()
    list.unshift(movement)
    setStoredItem('inventoryMovements', list)
  }

  getStockAdjustments(): StockAdjustment[] {
    return getStoredItem('stockAdjustments', INITIAL_STOCK_ADJUSTMENTS)
  }

  saveStockAdjustment(adj: StockAdjustment): void {
    const list = this.getStockAdjustments()
    list.unshift(adj)
    setStoredItem('stockAdjustments', list)

    // Update product stock
    const prod = this.getProductById(adj.productId)
    if (prod) {
      prod.stockMT += adj.quantityMT
      if (prod.stockMT <= 0) prod.status = 'Out of Stock'
      else if (prod.stockMT <= prod.reorderLevelMT) prod.status = 'Low Stock'
      else prod.status = 'In Stock'
      this.saveProduct(prod)

      this.addInventoryMovement({
        id: `mov-adj-${Date.now()}`,
        date: adj.date,
        productId: prod.id,
        productName: prod.name,
        movementType: 'Stock Adjustment',
        reference: adj.adjustmentNumber,
        quantityMT: adj.quantityMT,
        balanceAfterMT: prod.stockMT,
        unitCostBDT: adj.unitCostBDT,
        notes: `${adj.adjustmentType}: ${adj.reason}`,
      })
    }

    this.addAuditLog(
      'Stock Adjustment Created',
      'Inventory',
      `Adjustment: ${adj.adjustmentNumber} (${adj.productName}) ${adj.quantityMT > 0 ? '+' : ''}${adj.quantityMT} MT`
    )
  }

  // Chart of Accounts & Journals
  getChartOfAccounts(): Account[] {
    return getStoredItem('chartOfAccounts', INITIAL_CHART_OF_ACCOUNTS)
  }

  getJournalEntries(): JournalEntry[] {
    return getStoredItem('journalEntries', INITIAL_JOURNAL_ENTRIES)
  }

  saveJournalEntry(entry: JournalEntry): { success: boolean; error?: string } {
    // Enforce strict double entry accounting validation
    const totalDebit = entry.lines.reduce((s, l) => s + (Number(l.debitBDT) || 0), 0)
    const totalCredit = entry.lines.reduce((s, l) => s + (Number(l.creditBDT) || 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        error: `Journal entry must be balanced. Total Debits (৳ ${totalDebit.toLocaleString()}) do not match Total Credits (৳ ${totalCredit.toLocaleString()}). Difference: ৳ ${Math.abs(
          totalDebit - totalCredit
        ).toLocaleString()}`,
      }
    }

    if (entry.lines.length < 2) {
      return {
        success: false,
        error: 'Journal entry must have at least two account lines.',
      }
    }

    const list = this.getJournalEntries()
    entry.totalDebitBDT = totalDebit
    entry.totalCreditBDT = totalCredit
    list.unshift(entry)
    setStoredItem('journalEntries', list)

    this.addAuditLog(
      'Journal Entry Posted',
      'Accounting',
      `Posted Journal ${entry.entryNumber}: ${entry.description} (৳ ${totalDebit.toLocaleString()})`
    )

    return { success: true }
  }

  // Company Settings & Audit Logs
  getCompanySettings(): CompanySettings {
    return getStoredItem('companySettings', INITIAL_COMPANY_SETTINGS)
  }

  saveCompanySettings(settings: CompanySettings): void {
    setStoredItem('companySettings', settings)
    this.addAuditLog('Settings Updated', 'Settings', 'Company profile and parameters updated.')
  }

  getAuditLogs(): AuditLog[] {
    return getStoredItem('auditLogs', INITIAL_AUDIT_LOGS)
  }

  addAuditLog(action: string, module: string, details: string): void {
    const list = this.getAuditLogs()
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      user: 'Owner (Meridian Admin)',
      module,
      details,
    }
    list.unshift(newLog)
    setStoredItem('auditLogs', list.slice(0, 100))
  }

  // Reset all to pristine defaults
  resetAllData(): void {
    clearStoredPrototypeData()
  }
}

export const mockRepo = new MockRepository()
