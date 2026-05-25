<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { AlertCircle, RefreshCw } from "lucide-vue-next";
import { toast } from "vue-sonner";
import DashboardFilters from "@/components/DashboardFilters.vue";
import DamageTable from "@/components/DamageTable.vue";
import DashboardStats from "@/components/DashboardStats.vue";
import DetectionFilters from "@/components/DetectionFilters.vue";
import DetectionsTrendChart from "@/components/DetectionsTrendChart.vue";
import RoadMap from "@/components/RoadMap.vue";
import RiskLevelChart from "@/components/RiskLevelChart.vue";
import { Button } from "@/components/ui/button";
import { useFilteredAnalytics } from "@/composables/useFilteredAnalytics";
import { useAnalyticsStore } from "@/stores";
import {
  computeDailyDetectionChartData,
  computeDashboardStats,
  computeDamageTypeChartData,
  computeRiskLevelChartData,
} from "@/utils";

const analyticsStore = useAnalyticsStore();
const { records, isLoading, error, lastFetchedAt } =
  storeToRefs(analyticsStore);

const { dashboardRecords, tableRecords, offTopicInViewCount } =
  useFilteredAnalytics(records);

const stats = computed(() =>
  dashboardRecords.value.length > 0
    ? computeDashboardStats(dashboardRecords.value)
    : null,
);
const riskLevelData = computed(() =>
  computeRiskLevelChartData(dashboardRecords.value),
);
const damageTypeData = computed(() =>
  computeDamageTypeChartData(dashboardRecords.value),
);
const dailyData = computed(() =>
  computeDailyDetectionChartData(dashboardRecords.value),
);

const lastUpdatedLabel = computed(() =>
  lastFetchedAt.value
    ? dayjs(lastFetchedAt.value).format("MMM D, YYYY h:mm A")
    : null,
);

async function loadData(showToast = false) {
  try {
    await analyticsStore.loadAnalytics();
    if (showToast) {
      toast.success("Analytics updated", {
        description: `${records.value.length} records loaded.`,
      });
    }
  } catch {
    toast.error("Failed to load analytics", {
      description: error.value ?? "Unable to fetch dashboard data.",
    });
  }
}

onMounted(() => loadData());
</script>

<template>
  <div class="min-w-0 space-y-4 sm:space-y-6">
    <div
      class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
    >
      <p
        v-if="lastUpdatedLabel"
        class="text-xs text-muted-foreground sm:order-1"
      >
        Last updated: {{ lastUpdatedLabel }}
      </p>
      <Button
        variant="outline"
        size="sm"
        class="w-full sm:order-2 sm:ml-auto sm:w-auto"
        :disabled="isLoading"
        @click="loadData(true)"
      >
        <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
        Refresh Data
      </Button>
    </div>

    <div
      v-if="error && !isLoading"
      class="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p class="font-medium">Could not load analytics</p>
        <p class="mt-0.5 opacity-90">{{ error }}</p>
      </div>
    </div>

    <DashboardFilters
      :total-records="records.length"
      :filtered-count="dashboardRecords.length"
      :off-topic-excluded-count="offTopicInViewCount"
    />

    <DashboardStats :stats="stats" :loading="isLoading" />
    <DetectionsTrendChart :daily-data="dailyData" :loading="isLoading" />
    <RiskLevelChart
      :risk-level-data="riskLevelData"
      :damage-type-data="damageTypeData"
      :loading="isLoading"
    />

    <div class="min-w-0 space-y-4 sm:space-y-6">
      <RoadMap :records="dashboardRecords" :loading="isLoading" />
      <DetectionFilters
        :total-in-view="dashboardRecords.length + offTopicInViewCount"
        :filtered-count="tableRecords.length"
      />
      <DamageTable :records="tableRecords" :loading="isLoading" />
    </div>
  </div>
</template>
