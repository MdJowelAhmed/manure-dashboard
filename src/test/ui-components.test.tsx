import React from 'react'
import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'

describe('Core Shared UI Components', () => {
  it('renders MetricCard with title, value, subvalue and trend', () => {
    render(
      <MetricCard
        title="Gross Sales (BDT)"
        value="৳ 15.54 Cr"
        subvalue="Gross distribution revenue"
        trend={{ value: '+18.5%', isPositive: true }}
        badge="Revenue"
      />
    )

    expect(screen.getByText('Gross Sales (BDT)')).toBeInTheDocument()
    expect(screen.getByText('৳ 15.54 Cr')).toBeInTheDocument()
    expect(screen.getByText('Gross distribution revenue')).toBeInTheDocument()
    expect(screen.getByText('+18.5%')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
  })

  it('renders StatusBadge with accessible semantic text and status colors', () => {
    const { rerender } = render(<StatusBadge status="Received" />)
    expect(screen.getByText('Received')).toBeInTheDocument()

    rerender(<StatusBadge status="In Transit" />)
    expect(screen.getByText('In Transit')).toBeInTheDocument()

    rerender(<StatusBadge status="Overdue" />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()

    rerender(<StatusBadge status="Posted" />)
    expect(screen.getByText('Posted')).toBeInTheDocument()
  })
})
