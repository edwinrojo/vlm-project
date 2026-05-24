<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Maximize2, X } from 'lucide-vue-next'
import LeafletMapView from '@/components/LeafletMapView.vue'
import { Button } from '@/components/ui/button'
import type { AnalyticsRecord } from '@/types'

defineProps<{
  records: AnalyticsRecord[]
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })
const mapRef = ref<InstanceType<typeof LeafletMapView> | null>(null)

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    setTimeout(() => mapRef.value?.invalidateSize(), 150)
    setTimeout(() => mapRef.value?.invalidateSize(), 400)
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[1200] flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Expanded damage map"
    >
      <div
        class="flex shrink-0 flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div class="min-w-0 pr-2">
          <h2 class="text-base font-semibold text-foreground sm:text-lg">
            Damage Map — Expanded View
          </h2>
          <p class="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Draw a rectangle to filter the dashboard by geographic area.
          </p>
        </div>
        <Button variant="outline" size="sm" class="w-full shrink-0 sm:w-auto" @click="open = false">
          <X class="h-4 w-4" />
          Close
        </Button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-3 sm:p-6">
        <LeafletMapView
          ref="mapRef"
          :records="records"
          :loading="loading"
          height-class="h-[calc(100dvh-11rem)] min-h-[200px] sm:h-[calc(100vh-9rem)]"
          :enable-area-select="true"
        />
      </div>
    </div>
  </Teleport>

  <Button
    variant="outline"
    size="sm"
    class="w-full gap-1.5 sm:w-auto"
    @click="open = true"
  >
    <Maximize2 class="h-4 w-4 shrink-0" />
    <span class="truncate">Enlarge map</span>
  </Button>
</template>
