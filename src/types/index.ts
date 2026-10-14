// Domain Types for Fertilizer Import & Local Sales Dashboard (Bangladesh Context)

export type UnitType = 'MT' | 'KG' | 'BAG'

export interface Product {
  id: string
  sku: string
  name: string
  scientificName?: string
  category: 'Nitrogen' | 'Phosphate' | 'Potassium' | 'Complex / NPK' | 'Micronutrient'
  baseUnit: 'MT'
  supportedUnits: UnitType[]
  kgPerBag: number // typically 50kg
  stockMT: number
  reorderLevelMT: number
  landedCostPerMT: number
  sellingPricePerMT: number
  description: string
  originCountry: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export interface Supplier {
  id: string
  name: string
  code: string
  country: string
  contactPerson: string
  email: string
  phone: string
  paymentTerms: string
  totalImportedBDT: number
  totalPaidBDT: number
  balanceDueBDT: number
  activeShipmentsCount: number
  bankDetails: string
}

export interface Customer {
  id: string
  name: string
  code: string
  district: string
  address: string
  contactPerson: string
  phone: string
  email: string
  tradeLicenseNo: string
  creditLimitBDT: number
  totalSalesBDT: number
  totalPaidBDT: number
  outstandingDueBDT: number
  overdueStatus: 'Normal' | 'Approaching Due' | 'Overdue'
}

export type ImportStatus =
  | 'Draft'
  | 'Ordered'
  | 'In Transit'
  | 'Partially Received'
  | 'Received'
  | 'Cost Finalized'
  | 'Cancelled'

export interface ImportItem {
  id: string
  productId: string
  productName: string
  orderedQuantityMT: number
  unitPriceUSD: number
  exchangeRateBDT: number
  fobPriceBDT: number
  totalFobBDT: number
  receivedQuantityMT: number
  allocatedCostBDT: number
  finalLandedCostPerMT: number
}

export interface ImportCostBreakdown {
  purchaseFobBDT: number
  oceanFreightBDT: number
  marineInsuranceBDT: number
  customsDutyAssessmentBDT: number // NBR
  portHandlingChargesBDT: number // CPA
  clearingAgentCommissionBDT: number // C&F
  inlandTransportDepotBDT: number
}

export interface GoodsReceipt {
  id: string
  receiptNumber: string
  importId: string
  receivedDate: string
  receivedMT: number
  shortageMT: number
  damagedMT: number
  warehouseLocation: string
  receivedBy: string
  notes?: string
}

export interface ImportShipment {
  id: string
  importReference: string
  supplierId: string
  supplierName: string
  supplierInvoiceNo: string
  billOfLadingNo: string
  orderDate: string
  shipmentDate: string
  expectedArrivalDate: string
  actualArrivalDate?: string
  status: ImportStatus
  dischargePort: string // 'Chittagong Port' | 'Mongla Port'
  vesselName: string
  items: ImportItem[]
  costBreakdown: ImportCostBreakdown
  totalImportCostBDT: number
  totalPaidBDT: number
  balanceDueBDT: number
  goodsReceipts: GoodsReceipt[]
  notes?: string
  allocationMethod: 'weight' | 'value' // weight allocation standard for bulk fertilizer
}

export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue'

export interface SalesInvoiceItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: UnitType
  quantityInMT: number
  unitPriceBDT: number
  discountBDT: number
  totalBDT: number
}

export interface SalesInvoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerDistrict: string
  invoiceDate: string
  dueDate: string
  deliveryChallanNo: string
  items: SalesInvoiceItem[]
  subtotalBDT: number
  discountBDT: number
  taxBDT: number // AIT / Advance Income Tax if applicable
  totalAmountBDT: number
  amountPaidBDT: number
  amountDueBDT: number
  paymentMethod?: 'Bank Transfer' | 'Cheque' | 'Cash'
  status: InvoiceStatus
  notes?: string
  stockDeducted: boolean
}

export interface SalesReturn {
  id: string
  returnNumber: string
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  returnDate: string
  productId: string
  productName: string
  returnedQuantityMT: number
  refundAmountBDT: number
  reason: string
  restocked: boolean
}

export interface CashBankAccount {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  branch: string
  accountType: 'Bank' | 'Cash'
  currentBalanceBDT: number
}

export type PaymentType = 'Customer Receipt' | 'Supplier Payment'

export interface PaymentRecord {
  id: string
  paymentNumber: string
  paymentType: PaymentType
  partyId: string
  partyName: string
  date: string
  amountBDT: number
  paymentMethod: 'BEFTN / RTGS' | 'Cheque' | 'Cash' | 'Bank Deposit'
  bankAccountId: string
  bankAccountName: string
  referenceNumber: string
  allocatedInvoiceOrImportId?: string
  allocatedReference?: string
  notes?: string
  status: 'Completed' | 'Pending' | 'Cancelled'
}

export interface ExpenseRecord {
  id: string
  expenseNumber: string
  date: string
  category:
    | 'Warehouse Rent & Godown Maintenance'
    | 'Staff Salaries & Allowances'
    | 'Depot Utility & Electricity'
    | 'Professional, Audit & Legal Fees'
    | 'Office Supplies & Communication'
    | 'Depot Security & Safety'
    | 'Bank Charges & Commission'
  payee: string
  amountBDT: number
  paymentAccountId: string
  paymentAccountName: string
  referenceNumber: string
  notes?: string
}

export interface InventoryMovement {
  id: string
  date: string
  productId: string
  productName: string
  movementType: 'Import Receipt' | 'Sales Delivery' | 'Stock Adjustment' | 'Sales Return'
  reference: string
  quantityMT: number // positive for additions, negative for deductions
  balanceAfterMT: number
  unitCostBDT: number
  notes?: string
}

export interface StockAdjustment {
  id: string
  adjustmentNumber: string
  date: string
  productId: string
  productName: string
  adjustmentType: 'Physical Surplus' | 'Physical Deficit' | 'Moisture / Bag Damage' | 'Repacking Loss'
  quantityMT: number
  unitCostBDT: number
  reason: string
  approvedBy: string
}

// Accounting / Double-Entry Ledger
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'

export interface Account {
  code: string
  name: string
  type: AccountType
  parentCode?: string
  balanceBDT: number
  isActive: boolean
  description: string
}

export interface JournalLine {
  id: string
  accountCode: string
  accountName: string
  debitBDT: number
  creditBDT: number
  partyRef?: string
}

export interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  source: 'Import Purchase' | 'Sales Invoice' | 'Customer Receipt' | 'Supplier Payment' | 'Operating Expense' | 'Manual Journal'
  reference: string
  description: string
  lines: JournalLine[]
  totalDebitBDT: number
  totalCreditBDT: number
  status: 'Draft' | 'Posted'
}

export interface AuditLog {
  id: string
  timestamp: string
  action: string
  user: string
  module: string
  details: string
}

export interface CompanySettings {
  companyName: string
  tradingName: string
  tradeLicense: string
  binNumber: string
  tinNumber: string
  headOfficeAddress: string
  warehouseName: string
  warehouseAddress: string
  warehouseCapacityMT: number
  phone: string
  email: string
  financialYear: string
  baseCurrency: 'BDT'
  currencySymbol: '৳'
  invoicePrefix: string
  importPrefix: string
}
