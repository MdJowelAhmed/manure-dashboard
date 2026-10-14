import { describe, it, expect } from 'vitest'
import { formatBDT, formatCompactBDT, formatDate } from '@/lib/utils'

describe('Formatting Utilities', () => {
  it('formats Bangladeshi Taka (BDT) with currency symbol and commas', () => {
    expect(formatBDT(1250000)).toBe('৳ 1,250,000')
    expect(formatBDT(0)).toBe('৳ 0')
    expect(formatBDT(50000, { showSymbol: false })).toBe('50,000')
  })

  it('formats compact BDT notations for enterprise KPI cards', () => {
    expect(formatCompactBDT(15000000)).toBe('৳ 1.50 Cr') // 1.5 Crore
    expect(formatCompactBDT(500000)).toBe('৳ 5.00 Lac') // 5 Lac
    expect(formatCompactBDT(50000)).toBe('৳ 50.0k')
  })

  it('formats dates consistently', () => {
    expect(formatDate('2026-03-15')).toBe('15 Mar 2026')
    expect(formatDate(undefined)).toBe('—')
  })
})
