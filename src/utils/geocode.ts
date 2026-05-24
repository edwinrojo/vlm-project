import type { AnalyticsRecord } from '@/types'

/** Coordinates come from the API; validation runs in parseApiCoordinates */
export function resolveRecordCoordinates(record: AnalyticsRecord): AnalyticsRecord {
  return record
}

/** Records with validated map coordinates (excludes placeholders and out-of-region GPS). */
export function getMappableRecords(records: AnalyticsRecord[]): AnalyticsRecord[] {
  return records.filter(
    (r) =>
      r.coordinate_status === 'valid' &&
      r.latitude != null &&
      r.longitude != null,
  )
}

export function countRecordsByCoordinateSource(records: AnalyticsRecord[]) {
  const mappable = getMappableRecords(records)
  const fromApi = mappable.filter((r) => r.coordinate_source === 'api').length
  const invalid = records.filter((r) => r.coordinate_status === 'invalid').length
  const unmapped = records.length - mappable.length - invalid
  return { fromApi, fromLookup: 0, unmapped, invalid }
}
