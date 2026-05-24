import type { MapAreaBounds } from '@/types/filters'
import type { AnalyticsRecord } from '@/types'
import dayjs from 'dayjs'

export function filterByDateRange(
  records: AnalyticsRecord[],
  enabled: boolean,
  dateFrom: string,
  dateTo: string,
): AnalyticsRecord[] {
  if (!enabled) return records

  return records.filter((record) => {
    const date = dayjs(record.date_detected)
    if (!date.isValid()) return false
    if (dateFrom && date.isBefore(dayjs(dateFrom), 'day')) return false
    if (dateTo && date.isAfter(dayjs(dateTo), 'day')) return false
    return true
  })
}

export function filterBySeverity(
  records: AnalyticsRecord[],
  severities: string[],
): AnalyticsRecord[] {
  if (severities.length === 0) return records
  const normalized = severities.map((s) => s.toLowerCase())
  return records.filter((r) => normalized.includes(r.severity.toLowerCase()))
}

export function filterByConfidence(
  records: AnalyticsRecord[],
  min: number,
  max: number,
): AnalyticsRecord[] {
  return records.filter((r) => r.confidence >= min && r.confidence <= max)
}

export function filterByMapArea(
  records: AnalyticsRecord[],
  bounds: MapAreaBounds | null,
): AnalyticsRecord[] {
  if (!bounds) return records

  return records.filter((record) => {
    if (record.latitude == null || record.longitude == null) return false
    const { latitude: lat, longitude: lng } = record
    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    )
  })
}

export function boundsToMapArea(bounds: {
  getSouth: () => number
  getNorth: () => number
  getWest: () => number
  getEast: () => number
}): MapAreaBounds {
  return {
    south: bounds.getSouth(),
    north: bounds.getNorth(),
    west: bounds.getWest(),
    east: bounds.getEast(),
  }
}

export function mapAreaToLatLngBounds(area: MapAreaBounds) {
  return [
    [area.south, area.west],
    [area.north, area.east],
  ] as [[number, number], [number, number]]
}
