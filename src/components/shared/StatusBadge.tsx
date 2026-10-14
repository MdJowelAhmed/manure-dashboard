import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Ship,
  FileCheck,
  Package,
} from 'lucide-react'

export type StatusCategory =
  | 'Draft'
  | 'Ordered'
  | 'In Transit'
  | 'Partially Received'
  | 'Received'
  | 'Cost Finalized'
  | 'Cancelled'
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Paid'
  | 'Partially Paid'
  | 'Unpaid'
  | 'Overdue'
  | 'Approaching Due'
  | 'Normal'
  | 'Completed'
  | 'Pending'
  | 'Posted'

interface StatusBadgeProps {
  status: StatusCategory | string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    // Green / Success
    case 'Received':
    case 'Cost Finalized':
    case 'In Stock':
    case 'Paid':
    case 'Completed':
    case 'Posted':
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      )

    // Amber / Warning
    case 'Low Stock':
    case 'Partially Received':
    case 'Partially Paid':
    case 'Approaching Due':
    case 'Pending':
      return (
        <Badge variant="warning" className={className}>
          <Clock className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      )

    // Red / Danger
    case 'Out of Stock':
    case 'Overdue':
    case 'Cancelled':
      return (
        <Badge variant="danger" className={className}>
          <AlertTriangle className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      )

    // Blue / Info
    case 'In Transit':
      return (
        <Badge variant="info" className={className}>
          <Ship className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      )

    case 'Ordered':
      return (
        <Badge variant="info" className={className}>
          <Package className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      )

    // Neutral / Draft
    case 'Draft':
    case 'Unpaid':
    case 'Normal':
    default:
      return (
        <Badge variant="default" className={className}>
          <FileCheck className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      )
  }
}
