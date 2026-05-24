<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import Table from '@/components/ui/table/Table.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import type { AnalyticsRecord } from '@/types'
import {
  formatConfidence,
  formatCoordinates,
  formatDate,
  getRecordKey,
  severityBadgeVariant,
} from '@/utils'

defineProps<{
  records: AnalyticsRecord[]
  loading?: boolean
}>()
</script>

<template>
  <Card class="min-w-0">
    <CardHeader>
      <CardTitle>Recent Detections</CardTitle>
      <CardDescription>
        Coordinates and suggested recommendations from the analytics API.
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

        <!-- Mobile: card list -->
        <ul v-else class="space-y-3 sm:hidden">
          <li
            v-for="(record, index) in records"
            :key="getRecordKey(record, index)"
            class="rounded-lg border border-border bg-muted/10 p-3"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <Badge :variant="severityBadgeVariant(record.severity)">
                {{ record.severity }}
              </Badge>
              <span class="font-mono text-[11px] text-muted-foreground">
                {{ formatConfidence(record.confidence) }}
              </span>
            </div>
            <p class="mt-2 font-medium text-sm text-foreground">
              {{ record.damage_type }}
            </p>
            <p class="mt-1 font-mono text-xs text-muted-foreground break-all">
              {{ formatCoordinates(record.latitude, record.longitude) }}
            </p>
            <p class="mt-2 text-xs text-muted-foreground">
              {{ formatDate(record.date_detected) }}
            </p>
            <p
              v-if="record.suggested_recommendation"
              class="mt-2 border-t border-border pt-2 text-sm leading-relaxed text-muted-foreground"
            >
              {{ record.suggested_recommendation }}
            </p>
          </li>
        </ul>

        <!-- Tablet+: scrollable table -->
        <div v-if="records.length > 0" class="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="whitespace-nowrap">Coordinates</TableHead>
                <TableHead class="whitespace-nowrap">Damage Type</TableHead>
                <TableHead class="whitespace-nowrap">Severity</TableHead>
                <TableHead class="min-w-[12rem]">Suggested Recommendation</TableHead>
                <TableHead class="hidden whitespace-nowrap md:table-cell">
                  Confidence
                </TableHead>
                <TableHead class="hidden whitespace-nowrap lg:table-cell">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(record, index) in records"
                :key="getRecordKey(record, index)"
              >
                <TableCell class="font-mono text-xs whitespace-nowrap">
                  {{ formatCoordinates(record.latitude, record.longitude) }}
                </TableCell>
                <TableCell class="max-w-[8rem] truncate sm:max-w-none">
                  {{ record.damage_type }}
                </TableCell>
                <TableCell>
                  <Badge :variant="severityBadgeVariant(record.severity)">
                    {{ record.severity }}
                  </Badge>
                </TableCell>
                <TableCell class="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {{ record.suggested_recommendation || '—' }}
                </TableCell>
                <TableCell class="hidden whitespace-nowrap md:table-cell">
                  {{ formatConfidence(record.confidence) }}
                </TableCell>
                <TableCell class="hidden whitespace-nowrap lg:table-cell">
                  {{ formatDate(record.date_detected) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
