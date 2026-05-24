<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from '@/constants/map'
import type { DetectionCoordinates } from '@/types'

const coordinates = defineModel<DetectionCoordinates | null>({ default: null })

const mapContainer = ref<HTMLElement | null>(null)
const mapError = ref<string | null>(null)

let map: L.Map | null = null
let marker: L.Marker | null = null
let resizeObserver: ResizeObserver | null = null

function pinIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function setMarker(latlng: L.LatLng, pan = true) {
  if (!map) return

  if (marker) {
    marker.setLatLng(latlng)
  } else {
    marker = L.marker(latlng, { icon: pinIcon(), draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker!.getLatLng()
      coordinates.value = { lat: pos.lat, lon: pos.lng }
    })
  }

  if (pan) map.panTo(latlng)
}

function syncFromModel() {
  if (!map || !coordinates.value) return
  setMarker(L.latLng(coordinates.value.lat, coordinates.value.lon), true)
}

function destroyMap() {
  resizeObserver?.disconnect()
  resizeObserver = null
  map?.remove()
  map = null
  marker = null
}

function initMap() {
  if (!mapContainer.value || map) return

  mapError.value = null

  try {
    const initial = coordinates.value
    const center: L.LatLngExpression = initial
      ? [initial.lat, initial.lon]
      : MAP_DEFAULT_CENTER

    map = L.map(mapContainer.value, {
      center,
      zoom: initial ? 15 : MAP_DEFAULT_ZOOM,
      scrollWheelZoom: true,
    })

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    map.on('click', (event) => {
      coordinates.value = { lat: event.latlng.lat, lon: event.latlng.lng }
      setMarker(event.latlng, false)
    })

    if (initial) setMarker(L.latLng(initial.lat, initial.lon), false)

    resizeObserver = new ResizeObserver(() => map?.invalidateSize())
    resizeObserver.observe(mapContainer.value)

    map.whenReady(() => {
      map?.invalidateSize()
    })
  } catch (err) {
    mapError.value =
      err instanceof Error ? err.message : 'Failed to initialize map'
    destroyMap()
  }
}

onMounted(async () => {
  await nextTick()
  initMap()
})

watch(coordinates, () => syncFromModel())

onUnmounted(() => {
  destroyMap()
})
</script>

<template>
  <div class="space-y-2">
    <p class="text-xs text-muted-foreground">
      Click the map to place the pin, or drag it to adjust.
    </p>
    <div class="relative h-52 w-full sm:h-56">
      <div
        ref="mapContainer"
        class="leaflet-map-root absolute inset-0 overflow-hidden rounded-lg border border-border bg-[#e8eef4]"
        role="application"
        aria-label="Pick upload location on map"
      />
      <p
        v-if="mapError"
        class="absolute inset-x-3 bottom-3 z-[500] rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
      >
        {{ mapError }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.leaflet-map-root :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}
</style>
