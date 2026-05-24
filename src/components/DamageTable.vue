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
  <Card>
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

      <div v-else class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coordinates</TableHead>
              <TableHead>Damage Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead class="min-w-[200px]">Suggested Recommendation</TableHead>
              <TableHead class="hidden sm:table-cell">Confidence</TableHead>
              <TableHead class="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="records.length === 0">
              <TableCell colspan="6" class="h-24 text-center text-muted-foreground">
                No detections match the current filters.
              </TableCell>
            </TableRow>
            <TableRow v-for="(record, index) in records" :key="getRecordKey(record, index)">
              <TableCell class="font-mono text-xs">
                {{ formatCoordinates(record.latitude, record.longitude) }}
              </TableCell>
              <TableCell>{{ record.damage_type }}</TableCell>
              <TableCell>
                <Badge :variant="severityBadgeVariant(record.severity)">
                  {{ record.severity }}
                </Badge>
              </TableCell>
              <TableCell class="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {{ record.suggested_recommendation || '—' }}
              </TableCell>
              <TableCell class="hidden sm:table-cell">
                {{ formatConfidence(record.confidence) }}
              </TableCell>
              <TableCell class="hidden md:table-cell">
                {{ formatDate(record.date_detected) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
