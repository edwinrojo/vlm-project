<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import ReportDetailDrawer from "@/components/ReportDetailDrawer.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import type { AnalyticsRecord } from "@/types";
import {
  formatConfidence,
  formatCreatedAt,
  getRecordKey,
  riskLevelBadgeVariant,
} from "@/utils";

const PAGE_SIZE = 10;

const props = defineProps<{
  records: AnalyticsRecord[];
  loading?: boolean;
}>();

const currentPage = ref(1);
const drawerOpen = ref(false);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.records.length / PAGE_SIZE)),
);

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return props.records.slice(start, start + PAGE_SIZE);
});

const rangeStart = computed(() =>
  props.records.length === 0 ? 0 : (currentPage.value - 1) * PAGE_SIZE + 1,
);

const rangeEnd = computed(() =>
  Math.min(currentPage.value * PAGE_SIZE, props.records.length),
);

const showPagination = computed(() => props.records.length > PAGE_SIZE);

watch(
  () => props.records,
  () => {
    currentPage.value = 1;
  },
);

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages;
});

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value);
}
const selectedRecord = ref<AnalyticsRecord | null>(null);

function openRecord(record: AnalyticsRecord) {
  selectedRecord.value = record;
  drawerOpen.value = true;
}

function primaryClassification(record: AnalyticsRecord): string {
  if (record.damage_classifications.length > 0) {
    return record.damage_classifications[0]!;
  }
  return record.damage_classification;
}

function classificationSummary(record: AnalyticsRecord): string {
  const extra = record.damage_classifications.length - 1;
  if (extra > 0) return `+${extra} more`;
  return record.file_name;
}
</script>

<template>
  <Card class="min-w-0">
    <CardHeader>
      <CardTitle>Road Damage Reports</CardTitle>
      <CardDescription>
        Tap a row to view full report details.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-3">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </div>

      <template v-else>
        <p
          v-if="records.length === 0"
          class="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground"
        >
          No detections match the current filters.
        </p>

        <ul v-else class="space-y-2 sm:hidden">
          <li
            v-for="(record, index) in paginatedRecords"
            :key="getRecordKey(record, index)"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
              @click="openRecord(record)"
            >
              <div class="min-w-0 flex-1 space-y-1.5">
                <p class="truncate font-medium text-sm text-foreground">
                  {{ primaryClassification(record) }}
                </p>
                <div class="flex flex-wrap items-center gap-1.5">
                  <Badge
                    v-for="level in record.risk_levels.slice(0, 2)"
                    :key="level"
                    :variant="riskLevelBadgeVariant(level)"
                    class="text-[10px]"
                  >
                    {{ level }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    {{ formatConfidence(record.confidence_score) }}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ formatCreatedAt(record.created_at) }}
                </p>
              </div>
              <ChevronRight class="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        </ul>

        <div v-if="records.length > 0" class="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="whitespace-nowrap">ID</TableHead>
                <TableHead class="min-w-[10rem]">Classification</TableHead>
                <TableHead class="whitespace-nowrap">Risk</TableHead>
                <TableHead class="whitespace-nowrap">Confidence</TableHead>
                <TableHead class="whitespace-nowrap">Detected</TableHead>
                <TableHead class="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(record, index) in paginatedRecords"
                :key="getRecordKey(record, index)"
                class="cursor-pointer"
                @click="openRecord(record)"
              >
                <TableCell>{{ record.id }}</TableCell>
                <TableCell>
                  <p class="font-medium text-sm text-foreground">
                    {{ primaryClassification(record) }}
                  </p>
                  <p class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ classificationSummary(record) }}
                  </p>
                </TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-1">
                    <Badge
                      v-for="level in record.risk_levels.slice(0, 2)"
                      :key="level"
                      :variant="riskLevelBadgeVariant(level)"
                    >
                      {{ level }}
                    </Badge>
                    <Badge
                      v-if="record.risk_levels.length > 2"
                      variant="secondary"
                      class="text-xs"
                    >
                      +{{ record.risk_levels.length - 2 }}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell class="whitespace-nowrap text-sm">
                  {{ formatConfidence(record.confidence_score) }}
                </TableCell>
                <TableCell
                  class="whitespace-nowrap text-xs text-muted-foreground"
                >
                  {{ formatCreatedAt(record.created_at) }}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  <ChevronRight class="h-4 w-4" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div
          v-if="records.length > 0"
          class="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-muted-foreground">
            Showing {{ rangeStart }}–{{ rangeEnd }} of {{ records.length }}
          </p>
          <div
            v-if="showPagination"
            class="flex items-center justify-between gap-2 sm:justify-end"
          >
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)"
            >
              <ChevronLeft class="h-4 w-4" />
              Previous
            </Button>
            <span class="text-sm text-muted-foreground tabular-nums">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Next
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </template>
    </CardContent>

    <ReportDetailDrawer v-model:open="drawerOpen" :record="selectedRecord" />
  </Card>
</template>
