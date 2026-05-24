<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import ApexChart from '@/components/ApexChart.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import type { SeverityChartData } from '@/types'
import { formatDate } from '@/utils'

const props = defineProps<{
  dailyData: SeverityChartData[]
  loading?: boolean
}>()

const hasData = computed(() => props.dailyData.some((d) => d.value > 0))

const series = computed(() => [
  {
    name: 'Detections',
    data: props.dailyData.map((d) => d.value),
  },
])

const options = computed(() => ({
  chart: {
    type: 'area' as const,
    toolbar: { show: false },
    fontFamily: 'inherit',
    zoom: { enabled: false },
  },
  stroke: { curve: 'smooth' as const, width: 2 },
  fill: {
    type: 'gradient' as const,
    gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
  },
  colors: ['#1e4d8c'],
  dataLabels: { enabled: false },
  xaxis: {
    categories: props.dailyData.map((d) => formatDate(d.label)),
    labels: { style: { fontSize: '11px' }, rotate: -45 },
  },
  yaxis: {
    labels: { formatter: (val: number) => Math.round(val).toString() },
    min: 0,
    forceNiceScale: true,
  },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
}))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Daily Detections</CardTitle>
      <CardDescription>Detection volume over time from analytics records</CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-64 w-full" />
      <div
        v-else-if="!hasData"
        class="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground"
      >
        No detection dates in the current dataset.
      </div>
      <ApexChart
        v-else
        type="area"
        height="280"
        :options="options"
        :series="series"
      />
    </CardContent>
  </Card>
</template>
