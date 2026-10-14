import { describe, it, expect } from 'vitest'
import { calculateLandedCost, computeFinancialSummary } from '@/lib/calculations'
import { mockRepo } from '@/services/mockRepository'

describe('Fertilizer Business Financial & Landed Cost Calculations', () => {
  it('calculates weight-allocated landed cost accurately', () => {
    const items = [
      { orderedQuantityMT: 2000, fobPriceBDT: 37975 },
    ]
    const costs = {
      oceanFreightBDT: 9800000,
      marineInsuranceBDT: 850000,
      customsDutyAssessmentBDT: 5400000,
      portHandlingChargesBDT: 2100000,
      clearingAgentCommissionBDT: 1100000,
      inlandTransportDepotBDT: 1800000,
    }

    const result = calculateLandedCost(items, costs, 'weight')

    expect(result.totalOrderedMT).toBe(2000)
    expect(result.totalFobBDT).toBe(75950000)
    expect(result.ancillaryCostsBDT).toBe(21050000)
    expect(result.totalLandedCostBDT).toBe(97000000)
    expect(result.averageLandedPerMT).toBe(48500)
    expect(result.allocatedItems[0].landedCostPer50kgBag).toBe(Math.round(48500 / 20))
  })

  it('guarantees that the Balance Sheet is in equilibrium (Assets = Liabilities + Equity)', () => {
    const summary = computeFinancialSummary()

    expect(summary.totalAssetsBDT).toBeGreaterThan(0)
    expect(summary.totalLiabilitiesBDT).toBeGreaterThan(0)
    expect(summary.totalEquityBDT).toBeGreaterThan(0)

    const liabilitiesAndEquity = summary.totalLiabilitiesBDT + summary.totalEquityBDT
    const diff = Math.abs(summary.totalAssetsBDT - liabilitiesAndEquity)

    // Verify difference is negligible (within rounding of mock records)
    expect(diff).toBeLessThan(1000)
    expect(summary.isBalanceSheetBalanced).toBe(true)
  })

  it('strictly validates double-entry balancing on manual journal entries', () => {
    // Unbalanced entry (debit != credit)
    const unbalancedResult = mockRepo.saveJournalEntry({
      id: 'test-unbalanced',
      entryNumber: 'TEST-001',
      date: '2026-03-31',
      source: 'Manual Journal',
      reference: 'TEST-REF',
      description: 'Testing unbalanced rejection',
      status: 'Posted',
      totalDebitBDT: 100000,
      totalCreditBDT: 50000,
      lines: [
        { id: 'l1', accountCode: '1020', accountName: 'Eastern Bank', debitBDT: 100000, creditBDT: 0 },
        { id: 'l2', accountCode: '3010', accountName: 'Capital', debitBDT: 0, creditBDT: 50000 },
      ],
    })

    expect(unbalancedResult.success).toBe(false)
    expect(unbalancedResult.error).toContain('Journal entry must be balanced')

    // Balanced entry (debit === credit)
    const balancedResult = mockRepo.saveJournalEntry({
      id: 'test-balanced',
      entryNumber: 'TEST-002',
      date: '2026-03-31',
      source: 'Manual Journal',
      reference: 'TEST-REF-2',
      description: 'Testing balanced acceptance',
      status: 'Posted',
      totalDebitBDT: 100000,
      totalCreditBDT: 100000,
      lines: [
        { id: 'l1', accountCode: '1020', accountName: 'Eastern Bank', debitBDT: 100000, creditBDT: 0 },
        { id: 'l2', accountCode: '3010', accountName: 'Capital', debitBDT: 0, creditBDT: 100000 },
      ],
    })

    expect(balancedResult.success).toBe(true)
  })
})
