import type { AnalyticsRecord, AnalyticsRecordApiPayload, DetectionResult, Severity } from '@/types'
import { extractMapCoordinates } from './coordinates'
import { resolveRecordCoordinates } from '@/utils/geocode'

function normalizeConfidence(value: number): number {
  if (value > 1) return Math.min(value / 100, 1)
  return Math.max(0, Math.min(value, 1))
}

function titleCaseSeverity(value: string): Severity | string {
  const lower = value.toLowerCase()
  if (lower === 'minor') return 'Minor'
  if (lower === 'moderate') return 'Moderate'
  if (lower === 'severe') return 'Severe'
  return value
}

function readSuggestedRecommendation(raw: Record<string, unknown>): string {
  const value =
    raw.suggested_recommendation ??
    raw.suggestedRecommendation ??
    raw.recommendation
  return typeof value === 'string' ? value : ''
}

export function normalizeDetectionResult(raw: DetectionResult): DetectionResult {
  const coords = extractMapCoordinates(raw as unknown as Record<string, unknown>)
  const rawRecord = raw as unknown as Record<string, unknown>

  return {
    damage_detected: Boolean(raw.damage_detected),
    damage_type: raw.damage_type ?? 'Unknown',
    severity: titleCaseSeverity(String(raw.severity ?? 'Minor')),
    confidence: normalizeConfidence(Number(raw.confidence ?? 0)),
    recommendation:
      raw.recommendation || readSuggestedRecommendation(rawRecord) || '',
    ...(coords
      ? { latitude: coords.latitude, longitude: coords.longitude }
      : {}),
  }
}

export function normalizeAnalyticsRecord(
  raw: AnalyticsRecordApiPayload | Record<string, unknown>,
  index: number,
): AnalyticsRecord {
  const payload = raw as AnalyticsRecordApiPayload
  const rawRecord = raw as Record<string, unknown>
  const apiCoords = extractMapCoordinates(rawRecord)

  const id =
    payload.id ??
    `record-${index}-${apiCoords?.latitude ?? 'na'}-${apiCoords?.longitude ?? 'na'}-${payload.date_detected}`

  const record: AnalyticsRecord = {
    id,
    ...(payload.location?.trim() ? { location: payload.location.trim() } : {}),
    damage_type: payload.damage_type,
    severity: titleCaseSeverity(String(payload.severity)),
    confidence: normalizeConfidence(Number(payload.confidence ?? 0)),
    date_detected: payload.date_detected,
    suggested_recommendation: readSuggestedRecommendation(rawRecord),
    ...(apiCoords
      ? {
          latitude: apiCoords.latitude,
          longitude: apiCoords.longitude,
          coordinate_source: 'api' as const,
        }
      : {}),
  }

  return resolveRecordCoordinates(record)
}

export function normalizeAnalyticsRecords(
  raw: AnalyticsRecordApiPayload[] | Record<string, unknown>[],
): AnalyticsRecord[] {
  return raw.map((record, index) => normalizeAnalyticsRecord(record, index))
}
