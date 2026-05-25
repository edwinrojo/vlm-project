import exifr from 'exifr'
import type { DetectionCoordinates } from '@/types'

function isFiniteWgs84(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/** EXIF often stores swapped lat/lng when copied from API-style fields. */
function trySwapIfNeeded(lat: number, lng: number): [number, number] {
  if (lat >= 115 && lat <= 130 && lng >= 4 && lng <= 22) {
    return [lng, lat]
  }
  return [lat, lng]
}

function normalizeGps(lat: number, lng: number): DetectionCoordinates | null {
  if (!isFiniteWgs84(lat, lng) && isFiniteWgs84(lng, lat)) {
    ;[lat, lng] = [lng, lat]
  }
  if (!isFiniteWgs84(lat, lng)) return null

  ;[lat, lng] = trySwapIfNeeded(lat, lng)
  if (lat === 0 && lng === 0) return null

  return { lat, lon: lng }
}

/**
 * Read GPS coordinates from JPEG/JPG EXIF (and some PNG metadata).
 * Returns null when metadata is missing or invalid.
 */
export async function extractGpsFromImage(
  file: File,
): Promise<DetectionCoordinates | null> {
  try {
    const gps = await exifr.gps(file)
    if (
      !gps ||
      typeof gps.latitude !== 'number' ||
      typeof gps.longitude !== 'number'
    ) {
      return null
    }
    return normalizeGps(gps.latitude, gps.longitude)
  } catch {
    return null
  }
}
