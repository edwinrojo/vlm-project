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
      class="fixed inset-0 z-[1100] flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Expanded damage map"
    >
      <div class="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div>
          <h2 class="text-lg font-semibold text-foreground">Damage Map — Expanded View</h2>
          <p class="text-sm text-muted-foreground">
            Draw a rectangle to filter the dashboard by geographic area.
          </p>
        </div>
        <Button variant="outline" size="sm" @click="open = false">
          <X class="h-4 w-4" />
          Close
        </Button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
        <LeafletMapView
          ref="mapRef"
          :records="records"
          :loading="loading"
          height-class="h-[calc(100vh-9rem)]"
          :enable-area-select="true"
        />
      </div>
    </div>
  </Teleport>

  <Button variant="outline" size="sm" class="gap-1.5" @click="open = true">
    <Maximize2 class="h-4 w-4" />
    Enlarge map
  </Button>
</template>
