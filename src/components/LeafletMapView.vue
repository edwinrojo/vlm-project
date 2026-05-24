<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import { Eraser, SquareDashedMousePointer } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from '@/constants/map'
import { useMapAreaSelection } from '@/composables/useMapAreaSelection'
import { useDashboardFiltersStore } from '@/stores/dashboardFilters'
import type { AnalyticsRecord, Severity } from '@/types'
import { filterBySeverity } from '@/utils/filters'
import { getMappableRecords } from '@/utils/geocode'
import {
  formatConfidence,
  formatCoordinates,
  getRecordDisplayLabel,
  severityBadgeVariant,
  severityColor,
} from '@/utils'

const props = withDefaults(
  defineProps<{
    records: AnalyticsRecord[]
    loading?: boolean
    heightClass?: string
    enableAreaSelect?: boolean
  }>(),
  {
    loading: false,
    heightClass: 'h-[420px]',
    enableAreaSelect: true,
  },
)

const filtersStore = useDashboardFiltersStore()

const mapContainer = ref<HTMLElement | null>(null)
const mapError = ref<string | null>(null)
const mapReady = ref(false)

let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let resizeObserver: ResizeObserver | null = null

const areaSelection = useMapAreaSelection(
  () => map,
  (bounds) => filtersStore.setMapArea(bounds),
)

const displayedRecords = computed(() => {
  let list = getMappableRecords(props.records)
  if (filtersStore.mapSelectedSeverities.length > 0) {
    list = filterBySeverity(list, filtersStore.mapSelectedSeverities)
  }
  return list
})

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function createMarkerIcon(severity: string) {
  const color = severityColor(severity)
  return L.divIcon({
    className: 'damage-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function renderMarkers() {
  if (!map || !markersLayer) return

  markersLayer.clearLayers()
  const bounds: L.LatLngTuple[] = []

  for (const record of displayedRecords.value) {
    if (record.latitude == null || record.longitude == null) continue
    const latLng: L.LatLngTuple = [record.latitude, record.longitude]
    bounds.push(latLng)

    const recommendation = record.suggested_recommendation
      ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.4">${escapeHtml(record.suggested_recommendation)}</p>`
      : ''

    L.marker(latLng, { icon: createMarkerIcon(record.severity) })
      .bindPopup(`
        <div style="min-width:200px;max-width:260px">
          <strong>${escapeHtml(getRecordDisplayLabel(record))}</strong><br/>
          <span style="font-size:12px;color:#64748b">${formatCoordinates(record.latitude, record.longitude)}</span><br/>
          ${escapeHtml(record.damage_type)} · ${escapeHtml(record.severity)}<br/>
          Confidence: ${formatConfidence(record.confidence)}<br/>
          <span style="color:#64748b;font-size:12px">${escapeHtml(record.date_detected)}</span>
          ${recommendation}
        </div>
      `)
      .addTo(markersLayer)
  }

  if (bounds.length > 1) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [32, 32], maxZoom: 14 })
  } else if (bounds.length === 1 && bounds[0]) {
    map.setView(bounds[0], 14)
  } else if (!filtersStore.mapAreaBounds) {
    map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM)
  }
}

function destroyMap() {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (map) {
    areaSelection.unbindMap(map)
    map.remove()
  }
  map = null
  markersLayer = null
  mapReady.value = false
}

function initMap() {
  if (!mapContainer.value || map) return

  mapError.value = null

  try {
    map = L.map(mapContainer.value, {
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      scrollWheelZoom: true,
    })

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    markersLayer = L.layerGroup().addTo(map)
    areaSelection.bindMap(map)

    if (filtersStore.mapAreaBounds) {
      areaSelection.showExistingArea(filtersStore.mapAreaBounds)
    }

    renderMarkers()

    resizeObserver = new ResizeObserver(() => map?.invalidateSize())
    resizeObserver.observe(mapContainer.value)

    map.whenReady(() => {
      mapReady.value = true
      map?.invalidateSize()
    })
  } catch (err) {
    mapError.value = err instanceof Error ? err.message : 'Failed to initialize map'
    destroyMap()
  }
}

function startAreaDraw() {
  areaSelection.startDrawing()
}

function clearMapFilters() {
  areaSelection.clearSelection()
  filtersStore.resetMapFilters()
}

function isMapSeverityActive(severity: Severity) {
  return filtersStore.mapSelectedSeverities.includes(severity)
}

onMounted(() => {
  initMap()
})

watch(displayedRecords, () => {
  if (map) renderMarkers()
})

watch(
  () => filtersStore.mapAreaBounds,
  (bounds) => {
    if (!map) return
    if (bounds) areaSelection.showExistingArea(bounds)
    else areaSelection.clearSelectionLayer()
  },
)

onUnmounted(() => {
  destroyMap()
})

defineExpose({ invalidateSize: () => map?.invalidateSize() })
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col gap-3 rounded-lg border border-border bg-muted/15 p-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Map severity
        </span>
        <button
          v-for="severity in filtersStore.allSeverities"
          :key="severity"
          type="button"
          class="rounded-full transition-opacity"
          :class="
            isMapSeverityActive(severity)
              ? 'ring-2 ring-primary ring-offset-1'
              : 'opacity-60 hover:opacity-100'
          "
          @click="filtersStore.toggleMapSeverity(severity)"
        >
          <Badge :variant="severityBadgeVariant(severity)">{{ severity }}</Badge>
        </button>
        <span class="text-xs text-muted-foreground">None selected = show all</span>
      </div>

      <div v-if="enableAreaSelect" class="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-8 gap-1.5 text-xs"
          :class="{ 'ring-2 ring-primary': areaSelection.isDrawing }"
          @click="startAreaDraw"
        >
          <SquareDashedMousePointer class="h-3.5 w-3.5" />
          {{ areaSelection.isDrawing ? 'Drag on map…' : 'Select area' }}
        </Button>
        <Button
          v-if="filtersStore.mapAreaBounds"
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 gap-1 text-xs"
          @click="clearMapFilters"
        >
          <Eraser class="h-3.5 w-3.5" />
          Clear map filters
        </Button>
        <span
          v-if="filtersStore.mapAreaBounds"
          class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        >
          Area filter active · dashboard updated
        </span>
      </div>

      <p class="text-xs text-muted-foreground">
        Showing {{ displayedRecords.length }} marker(s) on the map.
        <template v-if="filtersStore.mapAreaBounds">
          Area selection filters the entire dashboard.
        </template>
      </p>
    </div>

    <div class="relative w-full min-h-[280px]" :class="heightClass">
      <div
        ref="mapContainer"
        class="leaflet-map-root absolute inset-0 overflow-hidden rounded-lg border border-border bg-[#e8eef4]"
        role="application"
        aria-label="Road damage map"
      />

      <div
        v-if="loading"
        class="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center rounded-lg bg-background/80"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>

      <div
        v-if="mapError"
        class="absolute bottom-3 left-3 right-3 z-[500] rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        {{ mapError }}
      </div>

      <div
        v-if="!loading && !mapReady && !mapError"
        class="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center text-sm text-muted-foreground"
      >
        Loading map…
      </div>
    </div>
  </div>
</template>

<style scoped>
.leaflet-map-root :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}

:deep(.damage-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
