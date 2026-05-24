<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import ApexChart from '@/components/ApexChart.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import type { DamageTypeChartData, SeverityChartData } from '@/types'
import { severityColor } from '@/utils'

const props = defineProps<{
  severityData: SeverityChartData[]
  damageTypeData: DamageTypeChartData[]
  loading?: boolean
}>()

const isNarrow = useMediaQuery('(max-width: 639px)')
const chartHeight = computed(() => (isNarrow.value ? 260 : 320))

const severityTotal = computed(() => props.severityData.reduce((sum, d) => sum + d.value, 0))
const damageTypeTotal = computed(() => props.damageTypeData.reduce((sum, d) => sum + d.value, 0))

const severitySeries = computed(() => props.severityData.map((item) => item.value))
const severityLabels = computed(() => props.severityData.map((item) => item.label))
const severityColors = computed(() => props.severityData.map((item) => severityColor(item.label)))

const severityOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'inherit' },
  labels: severityLabels.value,
  colors: severityColors.value,
  legend: {
    position: 'bottom' as const,
    fontSize: isNarrow.value ? '11px' : '12px',
  },
  dataLabels: { enabled: true },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontWeight: 600,
          },
        },
      },
    },
  },
  noData: { text: 'No severity data' },
}))

const damageTypeSeries = computed(() => [
  {
    name: 'Detections',
    data: props.damageTypeData.map((item) => item.value),
  },
])

const damageTypeOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '55%',
    },
  },
  colors: ['#1e4d8c'],
  dataLabels: { enabled: false },
  xaxis: {
    categories: props.damageTypeData.map((item) => item.label),
    labels: {
      rotate: isNarrow.value ? -45 : 0,
      hideOverlappingLabels: true,
      trim: true,
      style: { fontSize: isNarrow.value ? '10px' : '12px' },
    },
  },
  yaxis: {
    labels: { formatter: (val: number) => Math.round(val).toString() },
    min: 0,
  },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
  noData: { text: 'No damage type data' },
}))
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
        <CardDescription>Breakdown of detected damage severity levels</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton v-if="loading" class="mx-auto h-72 w-full max-w-sm" />
        <div
          v-else-if="severityTotal === 0"
          class="flex h-72 items-center justify-center text-sm text-muted-foreground"
        >
          No records to chart yet.
        </div>
        <ApexChart
          v-else
          type="donut"
          :height="chartHeight"
          :options="severityOptions"
          :series="severitySeries"
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Damage Types</CardTitle>
        <CardDescription>Most frequently detected road damage categories</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton v-if="loading" class="h-72 w-full" />
        <div
          v-else-if="damageTypeTotal === 0"
          class="flex h-72 items-center justify-center text-sm text-muted-foreground"
        >
          No records to chart yet.
        </div>
        <ApexChart
          v-else
          type="bar"
          :height="chartHeight"
          :options="damageTypeOptions"
          :series="damageTypeSeries"
        />
      </CardContent>
    </Card>
  </div>
</template>
