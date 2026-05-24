import type { MapCoordinates } from '@/types'

/**
 * Parses map coordinates from common API shapes:
 * - latitude / longitude (or lat / lng) on the record
 * - map_coordinates / coordinates object or GeoJSON [lng, lat] array
 */
export function extractMapCoordinates(raw: Record<string, unknown>): MapCoordinates | null {
  const topLevel = readLatLng(raw.latitude ?? raw.lat, raw.longitude ?? raw.lng)
  if (topLevel) return topLevel

  const nested = raw.map_coordinates ?? raw.coordinates
  if (nested == null) return null

  if (Array.isArray(nested)) {
    return parseCoordinateArray(nested)
  }

  if (typeof nested === 'object') {
    const obj = nested as Record<string, unknown>
    return readLatLng(obj.latitude ?? obj.lat, obj.longitude ?? obj.lng)
  }

  return null
}

function readLatLng(lat: unknown, lng: unknown): MapCoordinates | null {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { latitude: lat, longitude: lng }
}

/** GeoJSON order is [longitude, latitude]; [lat, lng] also seen in some APIs */
function parseCoordinateArray(pair: unknown[]): MapCoordinates | null {
  if (pair.length < 2) return null
  const a = pair[0]
  const b = pair[1]
  if (typeof a !== 'number' || typeof b !== 'number') return null

  if (Math.abs(a) > 90) {
    return readLatLng(b, a)
  }
  if (Math.abs(b) > 90) {
    return readLatLng(a, b)
  }

  return readLatLng(a, b)
}
