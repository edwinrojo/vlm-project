<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import LeafletMapView from '@/components/LeafletMapView.vue'
import MapExpandDialog from '@/components/MapExpandDialog.vue'
import type { AnalyticsRecord } from '@/types'
import { getMappableRecords } from '@/utils/geocode'
import { severityColor } from '@/utils'

const props = defineProps<{
  records: AnalyticsRecord[]
  loading?: boolean
}>()

const mapDialogOpen = ref(false)

const mappableRecords = computed(() => getMappableRecords(props.records))

const legendItems = [
  { label: 'Severe', severity: 'Severe' },
  { label: 'Moderate', severity: 'Moderate' },
  { label: 'Minor', severity: 'Minor' },
]
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Damage Map</CardTitle>
          <CardDescription>
            {{ mappableRecords.length }} of {{ records.length }} shown
          </CardDescription>
        </div>
        <div
          class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
        >
          <MapExpandDialog
            v-model:open="mapDialogOpen"
            :records="records"
            :loading="loading"
          />
          <div class="flex flex-wrap gap-1.5">
          <span
            v-for="item in legendItems"
            :key="item.label"
            class="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            <span
              class="h-2.5 w-2.5 rounded-full ring-1 ring-white"
              :style="{ background: severityColor(item.severity) }"
            />
            {{ item.label }}
          </span>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent class="min-w-0">
      <LeafletMapView :records="records" :loading="loading" />
    </CardContent>
  </Card>
</template>
