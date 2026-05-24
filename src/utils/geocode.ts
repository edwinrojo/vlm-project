import type { AnalyticsRecord } from '@/types'

/** Coordinates come from the API; no location-name lookup needed for live data */
export function resolveRecordCoordinates(record: AnalyticsRecord): AnalyticsRecord {
  return record
}

export function getMappableRecords(records: AnalyticsRecord[]): AnalyticsRecord[] {
  return records.filter((r) => r.latitude != null && r.longitude != null)
}

export function countRecordsByCoordinateSource(records: AnalyticsRecord[]) {
  const mappable = getMappableRecords(records)
  const fromApi = mappable.filter((r) => r.coordinate_source === 'api').length
  const unmapped = records.length - mappable.length
  return { fromApi, fromLookup: 0, unmapped }
}
