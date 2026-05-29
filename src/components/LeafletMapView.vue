<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import {
  Eraser,
  Flame,
  Layers,
  SquareDashedMousePointer,
} from "lucide-vue-next";

// Legacy Leaflet plugins attach to global `L` (see vite manualChunks for leaflet).
;(globalThis as typeof globalThis & { L: typeof L }).L = L;
import "leaflet.markercluster";
import "leaflet.heat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { primaryRiskLevel, RISK_LEVELS } from "@/constants/roadReport";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from "@/constants/map";
import { useMapAreaSelection } from "@/composables/useMapAreaSelection";
import { useDashboardFiltersStore } from "@/stores/dashboardFilters";
import type { AnalyticsRecord } from "@/types";
import { filterByRiskLevel } from "@/utils/filters";
import { getMappableRecords } from "@/utils/geocode";
import {
  formatConfidence,
  formatCreatedAt,
  formatRecordCoordinates,
  formatRecordRecommendation,
  getDetectionImageUrl,
  getRecordDisplayLabel,
  isOffTopicRecord,
  OFF_TOPIC_RECORD_LABEL,
  riskLevelBadgeVariant,
  riskLevelColor,
} from "@/utils";

const props = withDefaults(
  defineProps<{
    records: AnalyticsRecord[];
    loading?: boolean;
    heightClass?: string;
    enableAreaSelect?: boolean;
  }>(),
  {
    loading: false,
    heightClass:
      "h-[min(52vh,420px)] min-h-[240px] sm:h-[420px] sm:min-h-[320px]",
    enableAreaSelect: true,
  },
);

const filtersStore = useDashboardFiltersStore();

const mapContainer = ref<HTMLElement | null>(null);
const mapError = ref<string | null>(null);
const mapReady = ref(false);

type MapViewMode = "cluster" | "heatmap";

const mapViewMode = ref<MapViewMode>("cluster");

let map: L.Map | null = null;
let clusterLayer: L.MarkerClusterGroup | null = null;
let heatLayer: L.HeatLayer | null = null;
let resizeObserver: ResizeObserver | null = null;

const HEAT_GRADIENT: Record<number, string> = {
  0.25: "#10b981",
  0.45: "#f59e0b",
  0.7: "#ef4444",
  1: "#b91c1c",
};

const areaSelection = useMapAreaSelection(
  () => map,
  (bounds) => filtersStore.setMapArea(bounds),
);

const displayedRecords = computed(() => {
  let list = getMappableRecords(props.records);
  if (filtersStore.mapSelectedRiskLevels.length > 0) {
    list = filterByRiskLevel(list, filtersStore.mapSelectedRiskLevels);
  }
  return list;
});

const invalidCoordinateCount = computed(
  () => props.records.filter((r) => r.coordinate_status === "invalid").length,
);

const hasNoValidMarkers = computed(
  () => !props.loading && displayedRecords.value.length === 0,
);

const markerRiskStats = computed(() => {
  const counts = new Map<string, number>();
  for (const level of RISK_LEVELS) counts.set(level, 0);

  let unknownCount = 0;

  for (const record of displayedRecords.value) {
    const level = primaryRiskLevel(record.risk_levels);
    if (counts.has(level)) {
      counts.set(level, (counts.get(level) ?? 0) + 1);
    } else {
      unknownCount += 1;
    }
  }

  const items: { level: string; count: number; color: string }[] =
    RISK_LEVELS.map((level) => ({
      level,
      count: counts.get(level) ?? 0,
      color: riskLevelColor(level),
    }));

  if (unknownCount > 0) {
    items.push({
      level: "Unknown",
      count: unknownCount,
      color: riskLevelColor("Unknown"),
    });
  }

  return items;
});

const visibleMarkerStats = computed(() =>
  markerRiskStats.value.filter((item) => item.count > 0),
);

const markerStatsSummary = computed(() =>
  visibleMarkerStats.value
    .map((item) => `${item.count} ${item.level}`)
    .join(" · "),
);

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createMarkerIcon(riskLevel: string) {
  const color = riskLevelColor(riskLevel);
  return L.divIcon({
    className: "damage-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function heatIntensity(record: AnalyticsRecord): number {
  const level = primaryRiskLevel(record.risk_levels).toLowerCase();
  if (level === "critical") return 1;
  if (level === "high") return 0.85;
  if (level === "medium") return 0.55;
  if (level === "low") return 0.35;
  return 0.45;
}

function createClusterLayer(): L.MarkerClusterGroup {
  return L.markerClusterGroup({
    maxClusterRadius: 52,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 17,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount();
      const size = count < 10 ? 34 : count < 50 ? 40 : 46;
      return L.divIcon({
        html: `<div class="damage-cluster" style="width:${size}px;height:${size}px"><span>${count}</span></div>`,
        className: "damage-cluster-wrap",
        iconSize: L.point(size, size),
      });
    },
  });
}

function removeHeatLayer() {
  if (map && heatLayer) {
    map.removeLayer(heatLayer);
    heatLayer = null;
  }
}

function removeClusterLayer() {
  if (map && clusterLayer) {
    map.removeLayer(clusterLayer);
    clusterLayer = null;
  }
}

function fitMapToDisplayedRecords() {
  if (!map) return;

  if (
    mapViewMode.value === "cluster" &&
    clusterLayer &&
    clusterLayer.getLayers().length > 0
  ) {
    map.fitBounds(clusterLayer.getBounds(), { padding: [32, 32], maxZoom: 14 });
    return;
  }

  const bounds: L.LatLngTuple[] = [];
  for (const record of displayedRecords.value) {
    if (record.latitude == null || record.longitude == null) continue;
    bounds.push([record.latitude, record.longitude]);
  }

  if (bounds.length > 1) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [32, 32], maxZoom: 14 });
  } else if (bounds.length === 1 && bounds[0]) {
    map.setView(bounds[0], 14);
  } else if (!filtersStore.mapAreaBounds) {
    map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
  }
}

function buildMarkerPopupHtml(record: AnalyticsRecord): string {
  if (isOffTopicRecord(record)) {
    return `
      <div class="map-popup-content" style="min-width:200px;max-width:280px">
        <strong>${escapeHtml(OFF_TOPIC_RECORD_LABEL)}</strong>
      </div>
    `
  }

  const imageUrl = getDetectionImageUrl(record.file_name);
  const imageHtml = imageUrl
    ? `<img
        src="${escapeHtml(imageUrl)}"
        alt="${escapeHtml(record.file_name || "Road damage")}"
        loading="lazy"
        class="map-popup-image"
        style="display:block;width:100%;max-height:180px;margin:0 0 8px;border-radius:6px;object-fit:cover;background:#f1f5f9"
        onerror="this.style.display='none'"
      />`
    : "";

  const recommendation = formatRecordRecommendation(record);
  const recommendationHtml =
    recommendation && recommendation !== "—"
      ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.4">${escapeHtml(recommendation)}</p>`
      : "";

  return `
    <div class="map-popup-content" style="min-width:220px;max-width:300px">
      ${imageHtml}
      <strong>${escapeHtml(getRecordDisplayLabel(record))}</strong><br/>
      <span style="font-size:12px;color:#64748b">${escapeHtml(formatRecordCoordinates(record))}</span><br/>
      ${escapeHtml(record.damage_classification)}<br/>
      <span style="font-size:12px">Risk: ${escapeHtml(record.assessment_risk_level || "—")}</span><br/>
      <span style="font-size:12px">Confidence Score: ${formatConfidence(record.confidence_score)}</span><br/>
      <span style="color:#64748b;font-size:11px">${escapeHtml(formatCreatedAt(record.created_at))}</span>
      ${recommendationHtml}
    </div>
  `;
}

function renderClusterMarkers() {
  if (!map) return;

  removeHeatLayer();
  removeClusterLayer();

  clusterLayer = createClusterLayer();
  clusterLayer.addTo(map);

  for (const record of displayedRecords.value) {
    if (record.latitude == null || record.longitude == null) continue;
    const latLng: L.LatLngTuple = [record.latitude, record.longitude];

    L.marker(latLng, {
      icon: createMarkerIcon(primaryRiskLevel(record.risk_levels)),
    })
      .bindPopup(buildMarkerPopupHtml(record), { maxWidth: 320 })
      .addTo(clusterLayer);
  }

  fitMapToDisplayedRecords();
}

function renderHeatmap() {
  if (!map) return;

  removeClusterLayer();
  removeHeatLayer();

  const points: [number, number, number][] = [];

  for (const record of displayedRecords.value) {
    if (record.latitude == null || record.longitude == null) continue;
    points.push([
      record.latitude,
      record.longitude,
      heatIntensity(record),
    ]);
  }

  if (points.length > 0) {
    heatLayer = L.heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 16,
      minOpacity: 0.35,
      max: 1,
      gradient: HEAT_GRADIENT,
    });
    heatLayer.addTo(map);
  }

  fitMapToDisplayedRecords();
}

function renderMarkers() {
  if (!map) return;

  if (mapViewMode.value === "heatmap") {
    renderHeatmap();
  } else {
    renderClusterMarkers();
  }
}

function setMapViewMode(mode: MapViewMode) {
  if (mapViewMode.value === mode) return;
  mapViewMode.value = mode;
  if (map) renderMarkers();
}

function destroyMap() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (map) {
    areaSelection.unbindMap(map);
    map.remove();
  }
  map = null;
  clusterLayer = null;
  heatLayer = null;
  mapReady.value = false;
}

function initMap() {
  if (!mapContainer.value || map) return;

  mapError.value = null;

  try {
    map = L.map(mapContainer.value, {
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    areaSelection.bindMap(map);

    if (filtersStore.mapAreaBounds) {
      areaSelection.showExistingArea(filtersStore.mapAreaBounds);
    }

    renderMarkers();

    resizeObserver = new ResizeObserver(() => map?.invalidateSize());
    resizeObserver.observe(mapContainer.value);

    map.whenReady(() => {
      mapReady.value = true;
      map?.invalidateSize();
    });
  } catch (err) {
    mapError.value =
      err instanceof Error ? err.message : "Failed to initialize map";
    destroyMap();
  }
}

function startAreaDraw() {
  areaSelection.startDrawing();
}

function clearMapFilters() {
  areaSelection.clearSelection();
  filtersStore.resetMapFilters();
}

function isMapRiskLevelActive(level: string) {
  return filtersStore.mapSelectedRiskLevels.includes(level);
}

onMounted(() => {
  initMap();
});

watch(displayedRecords, () => {
  if (map) renderMarkers();
});

watch(mapViewMode, () => {
  if (map) renderMarkers();
});

watch(
  () => filtersStore.mapAreaBounds,
  (bounds) => {
    if (!map) return;
    if (bounds) areaSelection.showExistingArea(bounds);
    else areaSelection.clearSelectionLayer();
  },
);

onUnmounted(() => {
  destroyMap();
});

defineExpose({ invalidateSize: () => map?.invalidateSize() });
</script>

<template>
  <div class="space-y-3">
    <div
      class="flex flex-col gap-2 rounded-lg border border-border bg-muted/15 p-2.5 sm:gap-3 sm:p-3"
    >
      <div class="space-y-2">
        <span
          class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Map risk level
        </span>
        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            v-for="level in filtersStore.allRiskLevels"
            :key="level"
            type="button"
            class="rounded-full transition-opacity"
            :class="
              isMapRiskLevelActive(level)
                ? 'ring-2 ring-primary ring-offset-1'
                : 'opacity-60 hover:opacity-100'
            "
            @click="filtersStore.toggleMapRiskLevel(level)"
          >
            <Badge :variant="riskLevelBadgeVariant(level)">{{ level }}</Badge>
          </button>
        </div>
        <p class="text-[11px] text-muted-foreground sm:text-xs">
          <span class="hidden sm:inline"
            >None selected = show all risk levels</span
          >
          <span class="sm:hidden">Tap badges to filter markers</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span
          class="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-auto"
        >
          Map view
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          class="h-8 gap-1.5 text-xs"
          :class="{ 'ring-2 ring-primary': mapViewMode === 'cluster' }"
          @click="setMapViewMode('cluster')"
        >
          <Layers class="h-3.5 w-3.5" />
          Clusters
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          class="h-8 gap-1.5 text-xs"
          :class="{ 'ring-2 ring-primary': mapViewMode === 'heatmap' }"
          @click="setMapViewMode('heatmap')"
        >
          <Flame class="h-3.5 w-3.5" />
          Heatmap
        </Button>
        <p class="w-full text-[11px] text-muted-foreground sm:text-xs">
          <span v-if="mapViewMode === 'cluster'">
            Group nearby markers; click a cluster to zoom or spiderfy.
          </span>
          <span v-else>
            Density by risk (green low → red critical). Switch to clusters
            for report popups.
          </span>
        </p>
      </div>

      <div
        v-if="enableAreaSelect"
        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-8 gap-1.5 text-xs"
          :class="{ 'ring-2 ring-primary': areaSelection.isDrawing }"
          @click="startAreaDraw"
        >
          <SquareDashedMousePointer class="h-3.5 w-3.5" />
          {{ areaSelection.isDrawing ? "Drag on map…" : "Select area" }}
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
          class="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary sm:text-xs"
        >
          <span class="hidden sm:inline"
            >Area filter active · dashboard updated</span
          >
          <span class="sm:hidden">Area filter active</span>
        </span>
      </div>

      <p class="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        Showing {{ displayedRecords.length }} marker(s) with valid GPS in the
        Davao region.
        <template v-if="invalidCoordinateCount > 0">
          {{ invalidCoordinateCount }} record(s) have missing or invalid
          latitude/longitude from the API.
        </template>
        <template v-if="filtersStore.mapAreaBounds">
          Area selection filters the entire dashboard.
        </template>
      </p>
    </div>

    <div class="relative w-full min-w-0 min-h-[240px]" :class="heightClass">
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
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
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

      <div
        v-if="hasNoValidMarkers && mapReady && !mapError"
        class="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center p-4"
      >
        <p
          class="max-w-sm rounded-lg border border-border bg-background/95 px-4 py-3 text-center text-sm text-muted-foreground shadow-sm"
        >
          No map markers — API coordinates are missing, invalid, or outside the
          Davao area (e.g. 0,0 or placeholder values). Check latitude and
          longitude on each report.
        </p>
      </div>

      <div
        v-if="mapReady && !mapError && !loading"
        class="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-[min(100%,20rem)] flex-col gap-2 sm:max-w-xs"
      >
        <div
          class="pointer-events-auto rounded-lg border border-border bg-background/95 px-3 py-2.5 shadow-md backdrop-blur-sm"
        >
          <p
            class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Risk legend
          </p>
          <div class="flex flex-wrap gap-x-3 gap-y-1.5">
            <button
              v-for="level in RISK_LEVELS"
              :key="level"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-0.5 py-0.5 text-xs transition-opacity hover:opacity-100"
              :class="
                filtersStore.mapSelectedRiskLevels.length > 0 &&
                !isMapRiskLevelActive(level)
                  ? 'opacity-45'
                  : 'opacity-100'
              "
              :title="`Filter map to ${level}`"
              @click="filtersStore.toggleMapRiskLevel(level)"
            >
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow-sm"
                :style="{ backgroundColor: riskLevelColor(level) }"
              />
              <span class="font-medium text-foreground">{{ level }}</span>
            </button>
          </div>
        </div>

        <div
          v-if="displayedRecords.length > 0"
          class="pointer-events-none rounded-lg border border-border bg-background/95 px-3 py-2 shadow-md backdrop-blur-sm"
        >
          <p class="text-xs font-semibold text-foreground">
            {{ displayedRecords.length }}
            marker{{ displayedRecords.length === 1 ? "" : "s" }} on map
          </p>
          <p
            v-if="markerStatsSummary"
            class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground"
          >
            {{ markerStatsSummary }}
          </p>
          <p
            v-if="filtersStore.mapSelectedRiskLevels.length > 0"
            class="mt-1 text-[10px] text-primary"
          >
            Filtered:
            {{ filtersStore.mapSelectedRiskLevels.join(", ") }}
          </p>
        </div>
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

:deep(.map-popup-image) {
  max-width: none !important;
}

:deep(.damage-cluster-wrap) {
  background: transparent !important;
  border: none !important;
}

:deep(.damage-cluster) {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: hsl(221 83% 53%);
  color: white;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgb(0 0 0 / 28%);
}
</style>
