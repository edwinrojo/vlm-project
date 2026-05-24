<script setup lang="ts">
import { Activity, AlertOctagon, BarChart3, Gauge } from 'lucide-vue-next'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import type { DashboardStats } from '@/types'
import { formatConfidence } from '@/utils'

defineProps<{
  stats: DashboardStats | null
  loading?: boolean
}>()

const statCards = [
  { key: 'totalDamages', label: 'Total Damages', icon: Activity, color: 'text-primary' },
  { key: 'severeCount', label: 'Severe Cases', icon: AlertOctagon, color: 'text-red-600' },
  { key: 'moderateCount', label: 'Moderate Cases', icon: BarChart3, color: 'text-amber-600' },
  { key: 'avgConfidence', label: 'Avg. Confidence', icon: Gauge, color: 'text-emerald-600' },
] as const
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Card v-for="card in statCards" :key="card.key">
      <CardContent class="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
        <template v-if="loading">
          <Skeleton class="h-12 w-12 rounded-xl" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-3 w-24" />
            <Skeleton class="h-7 w-16" />
          </div>
        </template>
        <template v-else>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
          >
            <component :is="card.icon" class="h-6 w-6" :class="card.color" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ card.label }}</p>
            <p class="text-2xl font-bold tracking-tight text-foreground">
              <template v-if="stats">
                {{
                  card.key === 'avgConfidence'
                    ? formatConfidence(stats.avgConfidence)
                    : stats[card.key]
                }}
              </template>
              <template v-else>—</template>
            </p>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
