<script setup lang="ts">
import { computed } from "vue";
import { Ban, MapPin, MapPinOff, ShieldAlert } from "lucide-vue-next";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import type { DashboardSummaryCounts } from "@/composables/useFilteredAnalytics";

const props = defineProps<{
  summary: DashboardSummaryCounts;
  loading?: boolean;
}>();

const items = computed(() => {
  const { roadDamageCount, offTopicCount, badGpsCount, mappableRoadDamageCount } =
    props.summary;

  return [
    {
      key: "road-damage",
      label: "Road damage",
      value: roadDamageCount,
      hint:
        mappableRoadDamageCount < roadDamageCount
          ? `${mappableRoadDamageCount} on map`
          : "Included in charts & map",
      icon: ShieldAlert,
      accent: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100",
      iconClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "off-topic",
      label: "Off-topic",
      value: offTopicCount,
      hint: "Confidence 0 · hidden from analytics",
      icon: Ban,
      accent: "border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100",
      iconClass: "text-slate-600 dark:text-slate-400",
    },
    {
      key: "bad-gps",
      label: "Bad GPS",
      value: badGpsCount,
      hint: "Missing or invalid coordinates",
      icon: MapPinOff,
      accent: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100",
      iconClass: "text-amber-600 dark:text-amber-400",
    },
  ];
});
</script>

<template>
  <section
    class="rounded-xl border border-border bg-card shadow-sm"
    aria-label="Dashboard record summary"
  >
    <div
      class="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div>
        <h2 class="text-sm font-semibold text-foreground">Record summary</h2>
        <p class="mt-0.5 text-xs text-muted-foreground">
          <template v-if="loading">Loading reports…</template>
          <template v-else>
            {{ summary.totalInView }} report{{
              summary.totalInView === 1 ? "" : "s"
            }}
            in current view
            <span v-if="summary.totalLoaded !== summary.totalInView">
              ({{ summary.totalLoaded }} total loaded)
            </span>
          </template>
        </p>
      </div>
      <div
        v-if="!loading && summary && summary.mappableRoadDamageCount > 0"
        class="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <MapPin class="h-3.5 w-3.5" />
        {{ summary.mappableRoadDamageCount }} plottable on map
      </div>
    </div>

    <div class="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
      <template v-if="loading">
        <Skeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-lg" />
      </template>

      <template v-else>
        <div
          v-for="item in items"
          :key="item.key"
          class="flex gap-3 rounded-lg border p-4"
          :class="item.accent"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/60"
          >
            <component :is="item.icon" class="h-5 w-5" :class="item.iconClass" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium uppercase tracking-wide opacity-80">
              {{ item.label }}
            </p>
            <p class="mt-0.5 text-2xl font-bold tabular-nums leading-none">
              {{ item.value }}
            </p>
            <p class="mt-1.5 text-[11px] leading-snug opacity-80">
              {{ item.hint }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
