import dayjs from 'dayjs'
import type { Severity } from '@/types'
import type { BadgeVariants } from '@/components/ui/badge'

export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatDate(value: string): string {
  return dayjs(value).format('MMM D, YYYY')
}

export function severityBadgeVariant(severity: string): BadgeVariants['variant'] {
  const normalized = severity.toLowerCase()
  if (normalized === 'severe') return 'danger'
  if (normalized === 'moderate') return 'warning'
  if (normalized === 'minor') return 'success'
  return 'secondary'
}

export function severityColor(severity: string): string {
  const normalized = severity.toLowerCase()
  if (normalized === 'severe') return '#ef4444'
  if (normalized === 'moderate') return '#f59e0b'
  if (normalized === 'minor') return '#10b981'
  return '#64748b'
}

export function isSeverity(value: string): value is Severity {
  return ['Minor', 'Moderate', 'Severe'].includes(value)
}

export function formatCoordinates(latitude?: number, longitude?: number): string {
  if (latitude == null || longitude == null) return '—'
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
