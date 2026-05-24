import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { MapAreaBounds } from '@/types/filters'
import { ALL_SEVERITIES } from '@/types/filters'
import type { Severity } from '@/types'

export const useDashboardFiltersStore = defineStore('dashboardFilters', () => {
  const dateRangeEnabled = ref(false)
  const dateFrom = ref('')
  const dateTo = ref('')

  const selectedSeverities = ref<Severity[]>([])
  const mapSelectedSeverities = ref<Severity[]>([])
  const confidenceMin = ref(0)
  const confidenceMax = ref(1)

  const mapAreaBounds = ref<MapAreaBounds | null>(null)

  const hasActiveDashboardFilters = computed(
    () => dateRangeEnabled.value || mapAreaBounds.value != null,
  )

  const hasActiveMapFilters = computed(
    () => mapSelectedSeverities.value.length > 0 || mapAreaBounds.value != null,
  )

  const hasActiveTableFilters = computed(
    () =>
      selectedSeverities.value.length > 0 ||
      confidenceMin.value > 0 ||
      confidenceMax.value < 1,
  )

  function toggleSeverity(severity: Severity) {
    const index = selectedSeverities.value.indexOf(severity)
    if (index >= 0) {
      selectedSeverities.value = selectedSeverities.value.filter((s) => s !== severity)
    } else {
      selectedSeverities.value = [...selectedSeverities.value, severity]
    }
  }

  function toggleMapSeverity(severity: Severity) {
    const index = mapSelectedSeverities.value.indexOf(severity)
    if (index >= 0) {
      mapSelectedSeverities.value = mapSelectedSeverities.value.filter((s) => s !== severity)
    } else {
      mapSelectedSeverities.value = [...mapSelectedSeverities.value, severity]
    }
  }

  function setMapArea(bounds: MapAreaBounds | null) {
    mapAreaBounds.value = bounds
  }

  function clearMapArea() {
    mapAreaBounds.value = null
  }

  function resetTableFilters() {
    selectedSeverities.value = []
    confidenceMin.value = 0
    confidenceMax.value = 1
  }

  function resetMapFilters() {
    mapSelectedSeverities.value = []
    mapAreaBounds.value = null
  }

  function resetDashboardFilters() {
    dateRangeEnabled.value = false
    dateFrom.value = ''
    dateTo.value = ''
    mapAreaBounds.value = null
  }

  function resetAll() {
    resetDashboardFilters()
    resetTableFilters()
    mapSelectedSeverities.value = []
  }

  return {
    dateRangeEnabled,
    dateFrom,
    dateTo,
    selectedSeverities,
    mapSelectedSeverities,
    confidenceMin,
    confidenceMax,
    mapAreaBounds,
    hasActiveDashboardFilters,
    hasActiveTableFilters,
    hasActiveMapFilters,
    allSeverities: ALL_SEVERITIES,
    toggleSeverity,
    toggleMapSeverity,
    setMapArea,
    clearMapArea,
    resetTableFilters,
    resetMapFilters,
    resetDashboardFilters,
    resetAll,
  }
})
