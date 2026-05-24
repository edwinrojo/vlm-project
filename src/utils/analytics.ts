import type { AnalyticsRecord, DashboardStats, DamageTypeChartData, SeverityChartData } from '@/types'

export function computeDashboardStats(records: AnalyticsRecord[]): DashboardStats {
  const severeCount = records.filter((r) => r.severity.toLowerCase() === 'severe').length
  const moderateCount = records.filter((r) => r.severity.toLowerCase() === 'moderate').length
  const minorCount = records.filter((r) => r.severity.toLowerCase() === 'minor').length
  const avgConfidence =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.confidence, 0) / records.length
      : 0

  return {
    totalDamages: records.length,
    severeCount,
    moderateCount,
    minorCount,
    avgConfidence,
  }
}

export function computeSeverityChartData(records: AnalyticsRecord[]): SeverityChartData[] {
  const counts = { Minor: 0, Moderate: 0, Severe: 0 }

  for (const record of records) {
    const key = record.severity as keyof typeof counts
    if (key in counts) counts[key]++
  }

  return Object.entries(counts).map(([label, value]) => ({ label, value }))
}

export function computeDamageTypeChartData(records: AnalyticsRecord[]): DamageTypeChartData[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    counts.set(record.damage_type, (counts.get(record.damage_type) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([label, value]) => ({ label, value }))
}

export function computeDailyDetectionChartData(
  records: AnalyticsRecord[],
): SeverityChartData[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    counts.set(record.date_detected, (counts.get(record.date_detected) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }))
}
