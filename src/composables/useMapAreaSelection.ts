import { ref } from 'vue'
import L from 'leaflet'
import type { MapAreaBounds } from '@/types/filters'
import { boundsToMapArea, mapAreaToLatLngBounds } from '@/utils/filters'

export function useMapAreaSelection(
  getMap: () => L.Map | null,
  onAreaChange: (bounds: MapAreaBounds | null) => void,
) {
  const isDrawing = ref(false)
  let startPoint: L.LatLng | null = null
  let previewRect: L.Rectangle | null = null
  let selectionLayer: L.Rectangle | null = null

  const drawHandlers = {
    mousedown: (e: L.LeafletMouseEvent) => {
      if (!isDrawing.value) return
      L.DomEvent.stopPropagation(e)
      const map = getMap()
      if (!map) return

      startPoint = e.latlng
      map.dragging.disable()

      if (previewRect) {
        map.removeLayer(previewRect)
        previewRect = null
      }

      previewRect = L.rectangle(L.latLngBounds(startPoint, startPoint), {
        color: '#1e4d8c',
        weight: 2,
        fillOpacity: 0.15,
        dashArray: '6 4',
      }).addTo(map)
    },
    mousemove: (e: L.LeafletMouseEvent) => {
      if (!isDrawing.value || !startPoint || !previewRect) return
      previewRect.setBounds(L.latLngBounds(startPoint, e.latlng))
    },
    mouseup: (e: L.LeafletMouseEvent) => {
      if (!isDrawing.value || !startPoint) return
      const map = getMap()
      if (!map) return

      map.dragging.enable()
      isDrawing.value = false
      map.getContainer().style.cursor = ''

      const bounds = L.latLngBounds(startPoint, e.latlng)
      startPoint = null

      if (previewRect) {
        map.removeLayer(previewRect)
        previewRect = null
      }

      if (bounds.getNorth() === bounds.getSouth() && bounds.getEast() === bounds.getWest()) {
        return
      }

      setSelectionLayer(boundsToMapArea(bounds))
      onAreaChange(boundsToMapArea(bounds))
    },
  }

  function bindMap(map: L.Map) {
    map.on('mousedown', drawHandlers.mousedown)
    map.on('mousemove', drawHandlers.mousemove)
    map.on('mouseup', drawHandlers.mouseup)
  }

  function unbindMap(map: L.Map) {
    map.off('mousedown', drawHandlers.mousedown)
    map.off('mousemove', drawHandlers.mousemove)
    map.off('mouseup', drawHandlers.mouseup)
  }

  function startDrawing() {
    const map = getMap()
    if (!map) return
    isDrawing.value = true
    map.getContainer().style.cursor = 'crosshair'
  }

  function cancelDrawing() {
    const map = getMap()
    isDrawing.value = false
    startPoint = null
    if (map) {
      map.dragging.enable()
      map.getContainer().style.cursor = ''
      if (previewRect) {
        map.removeLayer(previewRect)
        previewRect = null
      }
    }
  }

  function setSelectionLayer(area: MapAreaBounds) {
    const map = getMap()
    if (!map) return

    if (selectionLayer) {
      map.removeLayer(selectionLayer)
    }

    selectionLayer = L.rectangle(mapAreaToLatLngBounds(area), {
      color: '#1e4d8c',
      weight: 2,
      fillOpacity: 0.12,
    }).addTo(map)
  }

  function clearSelectionLayer() {
    const map = getMap()
    if (selectionLayer && map) {
      map.removeLayer(selectionLayer)
      selectionLayer = null
    }
  }

  function clearSelection() {
    clearSelectionLayer()
    onAreaChange(null)
  }

  function showExistingArea(area: MapAreaBounds) {
    setSelectionLayer(area)
  }

  return {
    isDrawing,
    bindMap,
    unbindMap,
    startDrawing,
    cancelDrawing,
    clearSelection,
    clearSelectionLayer,
    showExistingArea,
  }
}
