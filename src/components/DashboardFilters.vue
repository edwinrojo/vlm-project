<script setup lang="ts">
import { computed } from 'vue'
import { CalendarRange, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import { useDashboardFiltersStore } from '@/stores/dashboardFilters'

const props = defineProps<{
  totalRecords: number
  filteredCount: number
}>()

const filters = useDashboardFiltersStore()

const summary = computed(() => {
  if (!filters.hasActiveDashboardFilters) return 'Showing all records'
  return `Showing ${props.filteredCount} of ${props.totalRecords} records`
})
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle class="text-base">Dashboard Filters</CardTitle>
          <CardDescription>{{ summary }}</CardDescription>
        </div>
        <Button
          v-if="filters.hasActiveDashboardFilters"
          variant="ghost"
          size="sm"
          class="gap-1.5"
          @click="filters.resetDashboardFilters()"
        >
          <RotateCcw class="h-3.5 w-3.5" />
          Reset dashboard filters
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input
          v-model="filters.dateRangeEnabled"
          type="checkbox"
          class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <CalendarRange class="h-4 w-4 text-muted-foreground" />
        Filter by date range
      </label>

      <div
        v-if="filters.dateRangeEnabled"
        class="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2"
      >
        <label class="space-y-1.5 text-sm">
          <span class="font-medium text-foreground">From</span>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          />
        </label>
        <label class="space-y-1.5 text-sm">
          <span class="font-medium text-foreground">To</span>
          <input
            v-model="filters.dateTo"
            type="date"
            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          />
        </label>
      </div>

      <p v-else class="text-xs text-muted-foreground">
        Date filter off — all detections from earliest to most recent are included.
      </p>
    </CardContent>
  </Card>
</template>
