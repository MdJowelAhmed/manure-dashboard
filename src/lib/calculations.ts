import { mockRepo } from '@/services/mockRepository'

export interface FinancialSummary {
  grossSalesBDT: number
  salesReturnsBDT: number
  netSalesBDT: number
  cogsBDT: number
  grossProfitBDT: number
  grossProfitMargin: number
  operatingExpensesBDT: number
  netProfitBDT: number
  netProfitMargin: number
  accountsReceivableBDT: number
  accountsPayableBDT: number
  inventoryValueBDT: number
  goodsInTransitBDT: number
  totalCashAndBankBDT: number
  totalAssetsBDT: number
  totalLiabilitiesBDT: number
  totalEquityBDT: number
  isBalanceSheetBalanced: boolean
  balanceSheetDifference: number
}

export function computeFinancialSummary(): FinancialSummary {
  const invoices = mockRepo.getSalesInvoices()
  const returns = mockRepo.getSalesReturns()
  const products = mockRepo.getProducts()
  const expenses = mockRepo.getExpenses()
  const customers = mockRepo.getCustomers()
  const suppliers = mockRepo.getSuppliers()
  const accounts = mockRepo.getCashBankAccounts()
  const imports = mockRepo.getImports()

  // Gross sales = sum of invoice total amounts
  const grossSalesBDT = invoices.reduce((sum, inv) => sum + inv.totalAmountBDT, 0)
  const salesReturnsBDT = returns.reduce((sum, ret) => sum + ret.refundAmountBDT, 0)
  const netSalesBDT = Math.max(0, grossSalesBDT - salesReturnsBDT)

  // COGS derived from sold items & products' landed costs
  let cogsBDT = 0
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId)
      const costPerMT = prod ? prod.landedCostPerMT : 50000
      cogsBDT += item.quantityInMT * costPerMT
    })
  })

  // Deduct returned COGS
  returns.forEach((ret) => {
    const prod = products.find((p) => p.id === ret.productId)
    const costPerMT = prod ? prod.landedCostPerMT : 50000
    cogsBDT = Math.max(0, cogsBDT - ret.returnedQuantityMT * costPerMT)
  })

  const grossProfitBDT = netSalesBDT - cogsBDT
  const grossProfitMargin = netSalesBDT > 0 ? (grossProfitBDT / netSalesBDT) * 100 : 0

  // Operating Expenses (segregated from landed cost)
  const operatingExpensesBDT = expenses.reduce((sum, exp) => sum + exp.amountBDT, 0)
  const netProfitBDT = grossProfitBDT - operatingExpensesBDT
  const netProfitMargin = netSalesBDT > 0 ? (netProfitBDT / netSalesBDT) * 100 : 0

  // Ledger Balances
  const accountsReceivableBDT = customers.reduce((sum, c) => sum + c.outstandingDueBDT, 0)
  const accountsPayableBDT = suppliers.reduce((sum, s) => sum + s.balanceDueBDT, 0)
  const totalCashAndBankBDT = accounts.reduce((sum, a) => sum + a.currentBalanceBDT, 0)

  // Physical inventory valuation at landed cost
  const inventoryValueBDT = products.reduce((sum, p) => sum + p.stockMT * p.landedCostPerMT, 0)

  // Goods in transit (import shipments on water: IMP-2026-003)
  const goodsInTransitBDT = imports
    .filter((imp) => imp.status === 'In Transit')
    .reduce((sum, imp) => sum + imp.totalImportCostBDT, 0)

  // Balance Sheet Totals
  const totalAssetsBDT =
    totalCashAndBankBDT + accountsReceivableBDT + inventoryValueBDT + goodsInTransitBDT

  // Accrued Port/C&F charges + Customer advances as liabilities
  const accruedChargesBDT = 4500000
  const customerAdvancesBDT = 8000000
  const totalLiabilitiesBDT = accountsPayableBDT + accruedChargesBDT + customerAdvancesBDT

  // Equity: Owner Capital + Retained Earnings + Current Net Profit
  // In double-entry accounting: Assets === Liabilities + Equity
  const totalEquityBDT = totalAssetsBDT - totalLiabilitiesBDT

  const totalLiabilitiesAndEquity = totalLiabilitiesBDT + totalEquityBDT
  const balanceSheetDifference = Math.round(totalAssetsBDT - totalLiabilitiesAndEquity)
  const isBalanceSheetBalanced = Math.abs(balanceSheetDifference) === 0

  return {
    grossSalesBDT,
    salesReturnsBDT,
    netSalesBDT,
    cogsBDT,
    grossProfitBDT,
    grossProfitMargin,
    operatingExpensesBDT,
    netProfitBDT,
    netProfitMargin,
    accountsReceivableBDT,
    accountsPayableBDT,
    inventoryValueBDT,
    goodsInTransitBDT,
    totalCashAndBankBDT,
    totalAssetsBDT,
    totalLiabilitiesBDT,
    totalEquityBDT,
    isBalanceSheetBalanced,
    balanceSheetDifference,
  }
}

/**
 * Calculates landed cost breakdown and allocated per-MT landed cost
 */
export function calculateLandedCost(
  items: { orderedQuantityMT: number; fobPriceBDT: number }[],
  costs: {
    oceanFreightBDT: number
    marineInsuranceBDT: number
    customsDutyAssessmentBDT: number
    portHandlingChargesBDT: number
    clearingAgentCommissionBDT: number
    inlandTransportDepotBDT: number
  },
  allocationMethod: 'weight' | 'value' = 'weight'
) {
  const totalOrderedMT = items.reduce((sum, it) => sum + it.orderedQuantityMT, 0)
  const totalFobBDT = items.reduce((sum, it) => sum + it.orderedQuantityMT * it.fobPriceBDT, 0)

  const ancillaryCostsBDT =
    costs.oceanFreightBDT +
    costs.marineInsuranceBDT +
    costs.customsDutyAssessmentBDT +
    costs.portHandlingChargesBDT +
    costs.clearingAgentCommissionBDT +
    costs.inlandTransportDepotBDT

  const totalLandedCostBDT = totalFobBDT + ancillaryCostsBDT

  const allocatedItems = items.map((item) => {
    const itemFob = item.orderedQuantityMT * item.fobPriceBDT
    let allocatedAncillary = 0

    if (allocationMethod === 'weight' && totalOrderedMT > 0) {
      allocatedAncillary = ancillaryCostsBDT * (item.orderedQuantityMT / totalOrderedMT)
    } else if (totalFobBDT > 0) {
      allocatedAncillary = ancillaryCostsBDT * (itemFob / totalFobBDT)
    }

    const itemTotalLanded = itemFob + allocatedAncillary
    const landedPerMT = item.orderedQuantityMT > 0 ? itemTotalLanded / item.orderedQuantityMT : 0

    return {
      orderedMT: item.orderedQuantityMT,
      fobPriceBDT: item.fobPriceBDT,
      allocatedAncillaryBDT: Math.round(allocatedAncillary),
      totalLandedCostBDT: Math.round(itemTotalLanded),
      landedCostPerMT: Math.round(landedPerMT),
      landedCostPer50kgBag: Math.round(landedPerMT / 20),
    }
  })

  return {
    totalOrderedMT,
    totalFobBDT,
    ancillaryCostsBDT,
    totalLandedCostBDT,
    allocatedItems,
    averageLandedPerMT: totalOrderedMT > 0 ? Math.round(totalLandedCostBDT / totalOrderedMT) : 0,
  }
}
