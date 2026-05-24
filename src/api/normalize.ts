import {
  formatJoinedList,
  mapRiskLevelToSeverity,
  parseDamageClassifications,
  parseRiskOrUrgencyLevels,
} from '@/constants/roadReport'
import type {
  AnalyticsRecord,
  AnalyticsRecordApiPayload,
  DetectionResult,
  RoadReportApiRecord,
  Severity,
} from '@/types'
import { extractMapCoordinates } from './coordinates'
import { parseApiCoordinates } from '@/utils/coordinates'
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

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function isRoadReportPayload(raw: Record<string, unknown>): boolean {
  return (
    typeof raw.damage_classification === 'string' ||
    typeof raw.assessment_risk_level === 'string' ||
    Array.isArray(raw.risk_levels) ||
    raw.risk_level != null
  )
}

function parseRecordRiskLevels(row: Record<string, unknown>): string[] {
  return parseRiskOrUrgencyLevels(
    row.risk_levels ?? row.risk_level ?? row.assessment_risk_level,
  )
}

function parseRecordUrgencyLevels(row: Record<string, unknown>): string[] {
  return parseRiskOrUrgencyLevels(row.recommendation_urgency)
}

export function mapRoadReportToAnalyticsRecord(
  raw: RoadReportApiRecord | Record<string, unknown>,
  index: number,
): AnalyticsRecord {
  const row = raw as Record<string, unknown>
  const coords = parseApiCoordinates(row)

  const id =
    row.id != null
      ? String(row.id)
      : `record-${index}-${coords.source_latitude ?? 'na'}-${coords.source_longitude ?? 'na'}`

  const damageClassifications = parseDamageClassifications(row.damage_classification)
  const riskLevels = parseRecordRiskLevels(row)
  const urgencyLevels = parseRecordUrgencyLevels(row)

  const record: AnalyticsRecord = {
    id,
    damage_classifications: damageClassifications,
    damage_classification:
      formatJoinedList(damageClassifications) ||
      String(row.damage_classification ?? 'Unknown'),
    damage_dimensions_estimate: String(row.damage_dimensions_estimate ?? ''),
    damage_technical_terms: readStringArray(row.damage_technical_terms),
    risk_levels: riskLevels,
    assessment_risk_level:
      formatJoinedList(riskLevels) || String(row.assessment_risk_level ?? ''),
    assessment_vru_hazard: Boolean(row.assessment_vru_hazard),
    assessment_hazard_analysis: String(row.assessment_hazard_analysis ?? ''),
    recommendation_action: String(row.recommendation_action ?? ''),
    recommendation_urgency_levels: urgencyLevels,
    recommendation_urgency:
      formatJoinedList(urgencyLevels) || String(row.recommendation_urgency ?? ''),
    recommendation_disclaimer: String(row.recommendation_disclaimer ?? ''),
    confidence_score: normalizeConfidence(Number(row.confidence_score ?? 0)),
    file_name: String(row.file_name ?? ''),
    created_at: String(row.created_at ?? ''),
    source_latitude: coords.source_latitude,
    source_longitude: coords.source_longitude,
    coordinate_status: coords.status,
    ...(coords.latitude != null && coords.longitude != null
      ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          coordinate_source: 'api' as const,
        }
      : {}),
  }

  return resolveRecordCoordinates(record)
}

function mapLegacyPayload(
  payload: AnalyticsRecordApiPayload,
  index: number,
): AnalyticsRecord {
  const rawRecord = payload as Record<string, unknown>
  const suggested =
    payload.suggested_recommendation ??
    (typeof rawRecord.recommendation === 'string' ? rawRecord.recommendation : '')

  return mapRoadReportToAnalyticsRecord(
    {
      id: Number(payload.id) || index + 1,
      damage_classification: payload.damage_type ?? 'Unknown',
      damage_dimensions_estimate: '',
      damage_technical_terms: [],
      assessment_risk_level: payload.severity ?? 'Medium',
      assessment_vru_hazard: false,
      assessment_hazard_analysis: '',
      recommendation_action: suggested,
      recommendation_urgency: '',
      recommendation_disclaimer: '',
      confidence_score: Number(payload.confidence ?? 0),
      file_name: '',
      latitude: payload.latitude ?? 0,
      longitude: payload.longitude ?? 0,
      created_at: payload.date_detected ?? '',
    },
    index,
  )
}

function readSuggestedRecommendation(raw: Record<string, unknown>): string {
  const value =
    raw.suggested_recommendation ??
    raw.suggestedRecommendation ??
    raw.recommendation
  return typeof value === 'string' ? value : ''
}

function isRoadCheckResponse(raw: Record<string, unknown>): boolean {
  return raw.damage_profile != null && typeof raw.damage_profile === 'object'
}

function readNested(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const value = raw[key]
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function normalizeRoadCheckResponse(
  raw: Record<string, unknown>,
): DetectionResult {
  const profile = readNested(raw, 'damage_profile')
  const assessment = readNested(raw, 'assessment')
  const recommendation = readNested(raw, 'recommendation')

  const classification = String(profile.classification ?? '').trim()
  const riskLevel = String(assessment.risk_level ?? '').trim()
  const terms = readStringArray(profile.technical_terms)

  const damage_detected =
    classification.length > 0 &&
    !/no damage|not applicable|none detected|unrelated/i.test(classification)

  const urgencyLevels = parseRiskOrUrgencyLevels(recommendation.urgency)
  const recommendationText =
    [
      recommendation.action,
      urgencyLevels.length > 0 ? `Urgency: ${formatJoinedList(urgencyLevels)}` : null,
    ]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .join('. ') || String(recommendation.disclaimer ?? '')

  const coords = parseApiCoordinates(raw)

  return {
    damage_detected,
    damage_type: classification || 'Unknown',
    damage_dimensions_estimate: String(profile.dimensions_estimate ?? ''),
    damage_technical_terms: terms,
    severity: mapRiskLevelToSeverity(riskLevel || 'Medium'),
    assessment_risk_level: riskLevel,
    assessment_vru_hazard: Boolean(assessment.vru_hazard),
    assessment_hazard_analysis: String(assessment.hazard_analysis ?? ''),
    confidence: normalizeConfidence(Number(raw.confidence_score ?? 0)),
    recommendation: recommendationText,
    recommendation_action: String(recommendation.action ?? ''),
    recommendation_urgency: formatJoinedList(urgencyLevels) || String(recommendation.urgency ?? ''),
    recommendation_disclaimer: String(recommendation.disclaimer ?? ''),
    file_name: String(raw.fileName ?? raw.file_name ?? ''),
    ...(coords
      ? { latitude: coords.latitude, longitude: coords.longitude }
      : {}),
  }
}

export function normalizeDetectionResult(
  raw: DetectionResult | Record<string, unknown>,
): DetectionResult {
  const rawRecord = raw as Record<string, unknown>

  if (isRoadCheckResponse(rawRecord)) {
    return normalizeRoadCheckResponse(rawRecord)
  }

  const legacy = raw as DetectionResult
  const coords = extractMapCoordinates(rawRecord)

  return {
    damage_detected: Boolean(legacy.damage_detected),
    damage_type: legacy.damage_type ?? 'Unknown',
    severity: titleCaseSeverity(String(legacy.severity ?? 'Minor')),
    confidence: normalizeConfidence(Number(legacy.confidence ?? 0)),
    recommendation:
      typeof legacy.recommendation === 'string'
        ? legacy.recommendation
        : readSuggestedRecommendation(rawRecord),
    ...(coords
      ? { latitude: coords.latitude, longitude: coords.longitude }
      : {}),
  }
}

export function normalizeAnalyticsRecord(
  raw: RoadReportApiRecord | AnalyticsRecordApiPayload | Record<string, unknown>,
  index: number,
): AnalyticsRecord {
  const rawRecord = raw as Record<string, unknown>
  if (isRoadReportPayload(rawRecord)) {
    return mapRoadReportToAnalyticsRecord(rawRecord, index)
  }
  return mapLegacyPayload(raw as AnalyticsRecordApiPayload, index)
}

export function normalizeAnalyticsRecords(
  raw: (RoadReportApiRecord | AnalyticsRecordApiPayload | Record<string, unknown>)[],
): AnalyticsRecord[] {
  return raw.map((record, index) => normalizeAnalyticsRecord(record, index))
}
