import dayjs from 'dayjs'
import type { Severity } from '@/types'
import type { BadgeVariants } from '@/components/ui/badge'

export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatDate(value: string): string {
  return dayjs(value).format('MMM D, YYYY')
}

/** ISO `created_at` from GET /get-road-report */
export function formatCreatedAt(value: string): string {
  if (!value) return '—'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('MMM D, YYYY h:mm A') : value
}

/** Badge style for Low / Medium / High / Critical. */
export function riskLevelBadgeVariant(riskLevel: string): BadgeVariants['variant'] {
  const normalized = riskLevel.toLowerCase()
  if (normalized === 'critical') return 'danger'
  if (normalized === 'high') return 'danger'
  if (normalized === 'medium') return 'warning'
  if (normalized === 'low') return 'success'
  return 'secondary'
}

/** Map marker / legend color for Low / Medium / High / Critical. */
export function riskLevelColor(riskLevel: string): string {
  const normalized = riskLevel.toLowerCase()
  if (normalized === 'critical') return '#b91c1c'
  if (normalized === 'high') return '#ef4444'
  if (normalized === 'medium') return '#f59e0b'
  if (normalized === 'low') return '#10b981'
  return '#64748b'
}

/** Upload/detection result severity (Minor / Moderate / Severe). */
export function severityBadgeVariant(severity: string): BadgeVariants['variant'] {
  const normalized = severity.toLowerCase()
  if (normalized === 'severe') return 'danger'
  if (normalized === 'moderate') return 'warning'
  if (normalized === 'minor') return 'success'
  return 'secondary'
}

/** @deprecated Use riskLevelColor for dashboard map */
export const severityColor = riskLevelColor

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
