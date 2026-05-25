import type { AnalyticsRecord, DetectionResult } from '@/types'
import { formatRecordCoordinates } from './coordinates'
import { formatConfidence } from './format'

/** Shown when API confidence_score is 0 (not road damage). */
export const OFF_TOPIC_RECORD_LABEL = 'Off-topic / not road damage'

export function isOffTopicConfidence(score: number): boolean {
  return score === 0
}

export function isOffTopicRecord(record: AnalyticsRecord): boolean {
  return isOffTopicConfidence(record.confidence_score)
}

export function isOffTopicDetectionResult(result: DetectionResult): boolean {
  return isOffTopicConfidence(result.confidence)
}

export function formatDetectionConfidence(result: DetectionResult): string {
  if (isOffTopicDetectionResult(result)) return OFF_TOPIC_RECORD_LABEL
  return formatConfidence(result.confidence)
}

/** Records used for stats, charts, and map markers. */
export function excludeOffTopicRecords(records: AnalyticsRecord[]): AnalyticsRecord[] {
  return records.filter((record) => !isOffTopicRecord(record))
}

export function formatRecordConfidence(record: AnalyticsRecord): string {
  if (isOffTopicRecord(record)) return OFF_TOPIC_RECORD_LABEL
  return formatConfidence(record.confidence_score)
}

/** Primary line for map popups and labels */
export function getRecordDisplayLabel(record: AnalyticsRecord): string {
  if (isOffTopicRecord(record)) return OFF_TOPIC_RECORD_LABEL
  if (record.file_name?.trim()) return record.file_name.trim()
  if (record.damage_classification?.trim()) return record.damage_classification.trim()
  const coords = formatRecordCoordinates(record)
  if (coords !== '—') return coords
  return `Report ${record.id}`
}

/** Combined recommendation text for table / popups */
export function formatRecordRecommendation(record: AnalyticsRecord): string {
  if (isOffTopicRecord(record)) return OFF_TOPIC_RECORD_LABEL

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
