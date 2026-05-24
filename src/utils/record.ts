import type { AnalyticsRecord } from '@/types'
import { formatRecordCoordinates } from './coordinates'

/** Primary line for map popups and labels */
export function getRecordDisplayLabel(record: AnalyticsRecord): string {
  if (record.file_name?.trim()) return record.file_name.trim()
  if (record.damage_classification?.trim()) return record.damage_classification.trim()
  const coords = formatRecordCoordinates(record)
  if (coords !== '—') return coords
  return `Report ${record.id}`
}

/** Combined recommendation text for table / popups */
export function formatRecordRecommendation(record: AnalyticsRecord): string {
  const parts: string[] = []

  if (
    record.recommendation_action?.trim() &&
    record.recommendation_action.toLowerCase() !== 'not applicable'
  ) {
    parts.push(record.recommendation_action.trim())
  }

  const urgency =
    record.recommendation_urgency_levels.length > 0
      ? record.recommendation_urgency_levels.join(', ')
      : record.recommendation_urgency?.trim()

  if (urgency && urgency.toLowerCase() !== 'n/a') {
    parts.push(`Urgency: ${urgency}`)
  }

  if (parts.length > 0) return parts.join('. ')

  return record.recommendation_disclaimer?.trim() || '—'
}

export function getRecordKey(record: AnalyticsRecord, index: number): string {
  return (
    record.id ??
    `${record.latitude ?? 'na'}-${record.longitude ?? 'na'}-${record.created_at}-${index}`
  )
}
