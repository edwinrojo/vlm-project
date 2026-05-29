<script setup lang="ts">
import { computed } from 'vue'
import { Filter, RotateCcw } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardFiltersStore } from '@/stores/dashboardFilters'
import { riskLevelBadgeVariant } from '@/utils'

const props = defineProps<{
  totalInView: number
  filteredCount: number
}>()

const filters = useDashboardFiltersStore()

const confidenceMinPercent = computed({
  get: () => Math.round(filters.confidenceMin * 100),
  set: (v: number) => {
    filters.confidenceMin = Math.min(v / 100, filters.confidenceMax)
  },
})

const confidenceMaxPercent = computed({
  get: () => Math.round(filters.confidenceMax * 100),
  set: (v: number) => {
    filters.confidenceMax = Math.max(v / 100, filters.confidenceMin)
  },
})

function isRiskLevelActive(level: string) {
  return filters.selectedRiskLevels.includes(level)
}

function isClassificationActive(classification: string) {
  return filters.selectedClassifications.includes(classification)
}
</script>

<template>
  <div class="space-y-4 rounded-lg border border-border bg-muted/15 p-3 sm:p-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter class="h-4 w-4 text-muted-foreground" />
        Table filters
        <span class="text-xs font-normal text-muted-foreground">
          ({{ filteredCount }} of {{ totalInView }} rows)
        </span>
      </div>
      <Button
        v-if="filters.hasActiveTableFilters"
        variant="ghost"
        size="sm"
        class="h-7 gap-1 text-xs"
        @click="filters.resetTableFilters()"
      >
        <RotateCcw class="h-3 w-3" />
        Reset
      </Button>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Risk level
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="level in filters.allRiskLevels"
          :key="level"
          type="button"
          class="rounded-full transition-opacity"
          :class="
            isRiskLevelActive(level)
              ? 'ring-2 ring-primary ring-offset-1'
              : 'opacity-70 hover:opacity-100'
          "
          @click="filters.toggleRiskLevel(level)"
        >
          <Badge :variant="riskLevelBadgeVariant(level)">{{ level }}</Badge>
        </button>
      </div>
      <p class="text-xs text-muted-foreground">
        Click to toggle. None selected = all risk levels.
      </p>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Damage classification
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in filters.allClassifications"
          :key="type"
          type="button"
          class="rounded-full transition-opacity"
          :class="
            isClassificationActive(type)
              ? 'ring-2 ring-primary ring-offset-1'
              : 'opacity-70 hover:opacity-100'
          "
          @click="filters.toggleClassification(type)"
        >
          <Badge variant="outline">{{ type }}</Badge>
        </button>
      </div>
      <p class="text-xs text-muted-foreground">
        Click to toggle. Applies to table, charts, and map. None selected = all types.
      </p>
    </div>

    <div class="space-y-3">
      <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Confidence range
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="space-y-1 text-sm">
          <span class="text-muted-foreground">Minimum (%)</span>
          <input
            v-model.number="confidenceMinPercent"
            type="range"
            min="0"
            max="100"
            class="w-full accent-primary"
          />
          <span class="font-mono text-xs">{{ confidenceMinPercent }}%</span>
        </label>
        <label class="space-y-1 text-sm">
          <span class="text-muted-foreground">Maximum (%)</span>
          <input
            v-model.number="confidenceMaxPercent"
            type="range"
            min="0"
            max="100"
            class="w-full accent-primary"
          />
          <span class="font-mono text-xs">{{ confidenceMaxPercent }}%</span>
        </label>
      </div>
    </div>
  </div>
</template>
