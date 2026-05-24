import dayjs from 'dayjs'
import { RISK_LEVELS, recordHasRiskLevel } from '@/constants/roadReport'
import type {
  AnalyticsRecord,
  DashboardStats,
  DamageTypeChartData,
  RiskLevelChartData,
} from '@/types'

export function computeDashboardStats(records: AnalyticsRecord[]): DashboardStats {
  const avgConfidence =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.confidence_score, 0) / records.length
      : 0

  return {
    totalDamages: records.length,
    criticalCount: records.filter((r) => recordHasRiskLevel(r, 'Critical')).length,
    highCount: records.filter((r) => recordHasRiskLevel(r, 'High')).length,
    mediumCount: records.filter((r) => recordHasRiskLevel(r, 'Medium')).length,
    lowCount: records.filter((r) => recordHasRiskLevel(r, 'Low')).length,
    avgConfidence,
  }
}

export function computeRiskLevelChartData(
  records: AnalyticsRecord[],
): RiskLevelChartData[] {
  const counts = new Map<string, number>()

  for (const level of RISK_LEVELS) {
    counts.set(level, 0)
  }

  for (const record of records) {
    for (const level of record.risk_levels) {
      counts.set(level, (counts.get(level) ?? 0) + 1)
    }
  }

  return RISK_LEVELS.map((label) => ({
    label,
    value: counts.get(label) ?? 0,
  })).filter((item) => item.value > 0)
}

/** @deprecated Use computeRiskLevelChartData */
export const computeSeverityChartData = computeRiskLevelChartData

export function computeDamageTypeChartData(
  records: AnalyticsRecord[],
): DamageTypeChartData[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    const types =
      record.damage_classifications.length > 0
        ? record.damage_classifications
        : [record.damage_classification]

    for (const type of types) {
      counts.set(type, (counts.get(type) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }))
}

export function computeDailyDetectionChartData(
  records: AnalyticsRecord[],
): RiskLevelChartData[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    const day = dayjs(record.created_at).isValid()
      ? dayjs(record.created_at).format('YYYY-MM-DD')
      : record.created_at
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }))
}
