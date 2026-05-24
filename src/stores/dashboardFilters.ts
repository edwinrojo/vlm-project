import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { MapAreaBounds } from '@/types/filters'
import { ALL_RISK_LEVELS } from '@/types/filters'

export const useDashboardFiltersStore = defineStore('dashboardFilters', () => {
  const dateRangeEnabled = ref(false)
  const dateFrom = ref('')
  const dateTo = ref('')

  const selectedRiskLevels = ref<string[]>([])
  const mapSelectedRiskLevels = ref<string[]>([])
  const confidenceMin = ref(0)
  const confidenceMax = ref(1)

  const mapAreaBounds = ref<MapAreaBounds | null>(null)

  const hasActiveDashboardFilters = computed(
    () => dateRangeEnabled.value || mapAreaBounds.value != null,
  )

  const hasActiveMapFilters = computed(
    () => mapSelectedRiskLevels.value.length > 0 || mapAreaBounds.value != null,
  )

  const hasActiveTableFilters = computed(
    () =>
      selectedRiskLevels.value.length > 0 ||
      confidenceMin.value > 0 ||
      confidenceMax.value < 1,
  )

  function toggleRiskLevel(level: string) {
    const index = selectedRiskLevels.value.indexOf(level)
    if (index >= 0) {
      selectedRiskLevels.value = selectedRiskLevels.value.filter((l) => l !== level)
    } else {
      selectedRiskLevels.value = [...selectedRiskLevels.value, level]
    }
  }

  function toggleMapRiskLevel(level: string) {
    const index = mapSelectedRiskLevels.value.indexOf(level)
    if (index >= 0) {
      mapSelectedRiskLevels.value = mapSelectedRiskLevels.value.filter((l) => l !== level)
    } else {
      mapSelectedRiskLevels.value = [...mapSelectedRiskLevels.value, level]
    }
  }

  function setMapArea(bounds: MapAreaBounds | null) {
    mapAreaBounds.value = bounds
  }

  function clearMapArea() {
    mapAreaBounds.value = null
  }

  function resetTableFilters() {
    selectedRiskLevels.value = []
    confidenceMin.value = 0
    confidenceMax.value = 1
  }

  function resetMapFilters() {
    mapSelectedRiskLevels.value = []
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
    mapSelectedRiskLevels.value = []
  }

  return {
    dateRangeEnabled,
    dateFrom,
    dateTo,
    selectedRiskLevels,
    mapSelectedRiskLevels,
    confidenceMin,
    confidenceMax,
    mapAreaBounds,
    hasActiveDashboardFilters,
    hasActiveTableFilters,
    hasActiveMapFilters,
    allRiskLevels: ALL_RISK_LEVELS,
    toggleRiskLevel,
    toggleMapRiskLevel,
    setMapArea,
    clearMapArea,
    resetTableFilters,
    resetMapFilters,
    resetDashboardFilters,
    resetAll,
  }
})
