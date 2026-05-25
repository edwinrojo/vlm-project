import { computed, type Ref } from 'vue'
import type { AnalyticsRecord } from '@/types'
import { useDashboardFiltersStore } from '@/stores/dashboardFilters'
import { excludeOffTopicRecords } from '@/utils/record'
import {
  filterByConfidence,
  filterByDateRange,
  filterByMapArea,
  filterByRiskLevel,
} from '@/utils/filters'

export function useFilteredAnalytics(records: Ref<AnalyticsRecord[]>) {
  const filters = useDashboardFiltersStore()

  /** Date/map scoped records (includes off-topic for the table). */
  const inViewRecords = computed(() => {
    let result = records.value
    result = filterByDateRange(
      result,
      filters.dateRangeEnabled,
      filters.dateFrom,
      filters.dateTo,
    )
    result = filterByMapArea(result, filters.mapAreaBounds)
    return result
  })

  /** Road-damage records only — stats, charts, map markers. */
  const dashboardRecords = computed(() =>
    excludeOffTopicRecords(inViewRecords.value),
  )

  const offTopicInViewCount = computed(
    () => inViewRecords.value.length - dashboardRecords.value.length,
  )

  const tableRecords = computed(() => {
    let result = inViewRecords.value
    result = filterByRiskLevel(result, filters.selectedRiskLevels)
    result = filterByConfidence(result, filters.confidenceMin, filters.confidenceMax)
    return result
  })

  return {
    inViewRecords,
    dashboardRecords,
    tableRecords,
    offTopicInViewCount,
    filters,
  }
}
