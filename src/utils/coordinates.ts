import { MAP_DEFAULT_CENTER } from '@/constants/map'
import type { AnalyticsRecord } from '@/types'
import type { CoordinateValidationStatus } from '@/types/coordinates'

/** Davao City + nearby highway corridor (WGS84) */
export const DAVAO_MAP_BOUNDS = {
  minLat: 6.75,
  maxLat: 7.35,
  minLng: 125.42,
  maxLng: 125.78,
} as const

/** Wider Philippines bounds when validating highway data */
export const PHILIPPINES_MAP_BOUNDS = {
  minLat: 4,
  maxLat: 21.5,
  minLng: 116,
  maxLng: 127,
} as const

export interface ParsedApiCoordinates {
  source_latitude: number | null
  source_longitude: number | null
  latitude?: number
  longitude?: number
  status: CoordinateValidationStatus
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function inBounds(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): boolean {
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  )
}

function isFiniteWgs84(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/** Common API mistake: lat/lng fields swapped (e.g. lat=125.6, lng=7.07). */
function trySwapPhilippines(lat: number, lng: number): [number, number] {
  if (lat >= 115 && lat <= 130 && lng >= 4 && lng <= 22) {
    return [lng, lat]
  }
  return [lat, lng]
}

function isPlaceholder(lat: number, lng: number): boolean {
  if (lat === 0 && lng === 0) return true
  // Obvious test integers outside Davao (111/222/321 pattern from sample API)
  if (Number.isInteger(lat) && Number.isInteger(lng)) {
    if (lat > 21 || lng > 127 || lat < 4) return true
    if (!inBounds(lat, lng, PHILIPPINES_MAP_BOUNDS)) return true
  }
  return false
}

/**
 * Parse latitude/longitude from GET /get-road-report.
 * Preserves raw API numbers; only sets map coordinates when valid for Davao/PH.
 */
export function parseApiCoordinates(raw: Record<string, unknown>): ParsedApiCoordinates {
  const source_latitude = coerceNumber(raw.latitude ?? raw.lat)
  const source_longitude = coerceNumber(raw.longitude ?? raw.lng)

  if (source_latitude == null || source_longitude == null) {
    return { source_latitude, source_longitude, status: 'missing' }
  }

  let lat = source_latitude
  let lng = source_longitude

  if (!isFiniteWgs84(lat, lng) && isFiniteWgs84(lng, lat)) {
    ;[lat, lng] = [lng, lat]
  }

  if (!isFiniteWgs84(lat, lng)) {
    return { source_latitude, source_longitude, status: 'invalid' }
  }

  ;[lat, lng] = trySwapPhilippines(lat, lng)

  if (isPlaceholder(lat, lng)) {
    return { source_latitude, source_longitude, status: 'invalid' }
  }

  if (!inBounds(lat, lng, PHILIPPINES_MAP_BOUNDS)) {
    return { source_latitude, source_longitude, status: 'invalid' }
  }

  return {
    source_latitude,
    source_longitude,
    latitude: lat,
    longitude: lng,
    status: 'valid',
  }
}

export function formatRecordCoordinates(record: AnalyticsRecord): string {
  const lat = record.source_latitude ?? record.latitude
  const lng = record.source_longitude ?? record.longitude

  if (lat == null || lng == null) return '—'

  const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`

  if (record.coordinate_status === 'invalid') {
    return `${text} (invalid GPS)`
  }
  if (record.coordinate_status === 'valid' && record.latitude != null && record.longitude != null) {
    return text
  }
  return text
}

export function getMapDefaultCenter(): [number, number] {
  return MAP_DEFAULT_CENTER
}
