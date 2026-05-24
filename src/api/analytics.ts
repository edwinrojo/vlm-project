import type { AnalyticsRecord, RoadReportApiRecord } from '@/types'
import { mockAnalyticsRecords } from '@/data/mock'
import { apiClient, useMockData } from './client'
import { normalizeAnalyticsRecords } from './normalize'

export async function fetchAnalytics(): Promise<AnalyticsRecord[]> {
  if (useMockData) {
    await delay(800)
    return normalizeAnalyticsRecords(mockAnalyticsRecords.map((r) => ({ ...r })))
  }

  const path =
    import.meta.env.VITE_ANALYTICS_PATH?.trim() || '/get-road-report'

  const { data } = await apiClient.get<
    RoadReportApiRecord[] | { data?: RoadReportApiRecord[] }
  >(path)

  const rows = Array.isArray(data) ? data : (data?.data ?? [])
  return normalizeAnalyticsRecords(rows)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
