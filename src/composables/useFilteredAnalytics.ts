import { computed, type Ref } from 'vue'
import type { AnalyticsRecord } from '@/types'
import { useDashboardFiltersStore } from '@/stores/dashboardFilters'
import {
  filterByConfidence,
  filterByDateRange,
  filterByMapArea,
  filterBySeverity,
} from '@/utils/filters'

export function useFilteredAnalytics(records: Ref<AnalyticsRecord[]>) {
  const filters = useDashboardFiltersStore()

  const dashboardRecords = computed(() => {
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

  const tableRecords = computed(() => {
    let result = dashboardRecords.value
    result = filterBySeverity(result, filters.selectedSeverities)
    result = filterByConfidence(result, filters.confidenceMin, filters.confidenceMax)
    return result
  })

  return {
    dashboardRecords,
    tableRecords,
    filters,
  }
}
