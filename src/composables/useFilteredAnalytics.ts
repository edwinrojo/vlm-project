import { computed, type Ref } from 'vue'
import type { AnalyticsRecord } from '@/types'
import { useDashboardFiltersStore } from '@/stores/dashboardFilters'
import { excludeOffTopicRecords, isOffTopicRecord } from '@/utils/record'
import {
  filterByConfidence,
  filterByDamageClassification,
  filterByDateRange,
  filterByMapArea,
  filterByRiskLevel,
} from '@/utils/filters'

export interface DashboardSummaryCounts {
  /** All records from API */
  totalLoaded: number
  /** After date / map area filters */
  totalInView: number
  /** confidence_score > 0 */
  roadDamageCount: number
  /** confidence_score === 0 */
  offTopicCount: number
  /** coordinate_status invalid or missing */
  badGpsCount: number
  /** Road damage with valid map coordinates */
  mappableRoadDamageCount: number
}

function countBadGps(records: AnalyticsRecord[]): number {
  return records.filter(
    (record) =>
      record.coordinate_status === 'invalid' ||
      record.coordinate_status === 'missing',
  ).length
}

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
  const dashboardRecords = computed(() => {
    let result = excludeOffTopicRecords(inViewRecords.value)
    result = filterByDamageClassification(
      result,
      filters.selectedClassifications,
    )
    return result
  })

  const offTopicInViewCount = computed(
    () => inViewRecords.value.filter(isOffTopicRecord).length,
  )

  const dashboardSummary = computed((): DashboardSummaryCounts => {
    const inView = inViewRecords.value
    const roadDamage = dashboardRecords.value

    return {
      totalLoaded: records.value.length,
      totalInView: inView.length,
      roadDamageCount: roadDamage.length,
      offTopicCount: offTopicInViewCount.value,
      badGpsCount: countBadGps(inView),
      mappableRoadDamageCount: roadDamage.filter(
        (record) => record.coordinate_status === 'valid',
      ).length,
    }
  })

  const tableRecords = computed(() => {
    let result = inViewRecords.value
    result = filterByRiskLevel(result, filters.selectedRiskLevels)
    result = filterByDamageClassification(
      result,
      filters.selectedClassifications,
    )
    result = filterByConfidence(result, filters.confidenceMin, filters.confidenceMax)
    return result
  })

  return {
    inViewRecords,
    dashboardRecords,
    tableRecords,
    dashboardSummary,
    offTopicInViewCount,
    filters,
  }
}
