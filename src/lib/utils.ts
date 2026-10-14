import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in Bangladeshi Taka (BDT)
 * e.g. ৳ 1,250,000 or BDT 1,250,000
 */
export function formatBDT(amount: number, options: { showSymbol?: boolean; decimals?: number } = {}) {
  const { showSymbol = true, decimals = 0 } = options
  
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)

  return showSymbol ? `৳ ${formatted}` : formatted
}

/**
 * Format standard date
 */
export function formatDate(dateStringOrDate: string | Date | undefined, formatStr = 'dd MMM yyyy') {
  if (!dateStringOrDate) return '—'
  try {
    const d = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}

/**
 * Format numeric metric with abbreviation (k, M, Cr for Bangladesh)
 */
export function formatCompactBDT(amount: number) {
  if (Math.abs(amount) >= 10000000) {
    return `৳ ${(amount / 10000000).toFixed(2)} Cr`
  }
  if (Math.abs(amount) >= 100000) {
    return `৳ ${(amount / 100000).toFixed(2)} Lac`
  }
  if (Math.abs(amount) >= 1000) {
    return `৳ ${(amount / 1000).toFixed(1)}k`
  }
  return formatBDT(amount)
}
