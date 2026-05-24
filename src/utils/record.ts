import type { AnalyticsRecord } from '@/types'
import { formatCoordinates } from './format'

/** Display label for a record — coordinates when no location name exists */
export function getRecordDisplayLabel(record: AnalyticsRecord): string {
  if (record.location?.trim()) return record.location.trim()
  return formatCoordinates(record.latitude, record.longitude)
}

export function getRecordKey(record: AnalyticsRecord, index: number): string {
  return (
    record.id ??
    `${record.latitude ?? 'na'}-${record.longitude ?? 'na'}-${record.date_detected}-${index}`
  )
}
