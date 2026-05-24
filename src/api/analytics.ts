import type { AnalyticsRecord, AnalyticsRecordApiPayload } from '@/types'
import { mockAnalyticsRecords } from '@/data/mock'
import { apiClient, useMockData } from './client'
import { normalizeAnalyticsRecords } from './normalize'

export async function fetchAnalytics(): Promise<AnalyticsRecord[]> {
  if (useMockData) {
    await delay(800)
    return normalizeAnalyticsRecords(mockAnalyticsRecords.map((r) => ({ ...r })))
  }

  const { data } = await apiClient.get<AnalyticsRecordApiPayload[]>('/analytics')
  return normalizeAnalyticsRecords(data)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
