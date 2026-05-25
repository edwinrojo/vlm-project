<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ImageOff } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AnalyticsRecord } from "@/types";
import {
  formatCreatedAt,
  formatRecordConfidence,
  formatRecordCoordinates,
  formatRecordRecommendation,
  getDetectionImageUrl,
  isOffTopicRecord,
  OFF_TOPIC_RECORD_LABEL,
  riskLevelBadgeVariant,
} from "@/utils";

const props = defineProps<{
  record: AnalyticsRecord | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const imageLoadFailed = ref(false);

const imageUrl = computed(() =>
  props.record ? getDetectionImageUrl(props.record.file_name) : null,
);

const isOffTopic = computed(() =>
  props.record ? isOffTopicRecord(props.record) : false,
);

watch(
  () => [props.record?.id, props.record?.file_name, open.value] as const,
  () => {
    imageLoadFailed.value = false;
  },
);

function onImageError() {
  imageLoadFailed.value = true;
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      side="right"
      class="flex h-full flex-col gap-0 overflow-hidden p-0"
    >
      <template v-if="record">
        <div class="shrink-0 border-b border-border bg-muted/20">
          <div
            v-if="imageUrl && !imageLoadFailed"
            class="relative flex max-h-[min(42vh,420px)] min-h-[200px] items-center justify-center bg-muted/30 p-4"
          >
            <img
              :src="imageUrl"
              :alt="`Road damage: ${record.file_name}`"
              class="max-h-[min(40vh,400px)] w-full rounded-lg object-contain shadow-sm"
              loading="lazy"
              @error="onImageError"
            />
          </div>
          <div
            v-else
            class="flex min-h-[160px] flex-col items-center justify-center gap-2 bg-muted/30 px-6 py-8 text-center text-sm text-muted-foreground"
          >
            <ImageOff class="h-8 w-8 opacity-50" />
            <p v-if="!imageUrl">
              Image unavailable — set
              <code class="text-xs">VITE_IMAGE_DETECTION_PATH</code> in
              <code class="text-xs">.env</code>
            </p>
            <p v-else>Could not load {{ record.file_name }}</p>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SheetHeader class="border-b-0">
            <SheetTitle>Road damage report #{{ record.id }}</SheetTitle>
            <SheetDescription>
              {{ record.file_name || "Uploaded image" }} ·
              {{ formatCreatedAt(record.created_at) }}
            </SheetDescription>
          </SheetHeader>

          <div class="space-y-6 px-6 pb-8 pt-2">
            <section
              v-if="isOffTopic"
              class="space-y-1 rounded-lg border border-border bg-muted/25 p-4"
            >
              <h3 class="text-base font-bold text-foreground">RESULT</h3>
              <p class="text-sm font-medium leading-relaxed text-destructive">
                {{ OFF_TOPIC_RECORD_LABEL }}
              </p>
              <p class="text-sm text-muted-foreground">
                This upload was classified as not road damage.
              </p>
              <dl class="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt class="text-muted-foreground">Detected</dt>
                  <dd>{{ formatCreatedAt(record.created_at) }}</dd>
                </div>
                <div>
                  <dt class="text-muted-foreground">Coordinates</dt>
                  <dd class="font-mono text-xs break-all">
                    {{ formatRecordCoordinates(record) }}
                  </dd>
                </div>
              </dl>
            </section>

            <template v-else>
              <section class="space-y-3">
                <h3 class="text-base font-bold text-foreground">Summary</h3>
                <dl class="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt class="text-muted-foreground">Confidence</dt>
                    <dd class="font-medium">
                      {{ formatRecordConfidence(record) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted-foreground">Coordinates</dt>
                    <dd class="font-mono text-xs break-all">
                      {{ formatRecordCoordinates(record) }}
                    </dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="mb-1 text-muted-foreground">Risk level</dt>
                    <dd class="flex flex-wrap gap-1">
                      <Badge
                        v-for="level in record.risk_levels"
                        :key="level"
                        :variant="riskLevelBadgeVariant(level)"
                      >
                        {{ level }}
                      </Badge>
                      <span
                        v-if="record.risk_levels.length === 0"
                        class="text-foreground"
                      >
                        {{ record.assessment_risk_level || "—" }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="space-y-3">
                <h3 class="text-base font-bold text-foreground">
                  Damage classification
                </h3>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="type in record.damage_classifications"
                    :key="type"
                    variant="outline"
                  >
                    {{ type }}
                  </Badge>
                </div>
                <p
                  v-if="record.damage_classifications.length === 0"
                  class="text-sm"
                >
                  {{ record.damage_classification }}
                </p>
                <dl class="grid gap-2 text-sm">
                  <div v-if="record.damage_dimensions_estimate">
                    <dt class="text-muted-foreground">Dimensions estimate</dt>
                    <dd>{{ record.damage_dimensions_estimate }}</dd>
                  </div>
                  <div v-if="record.damage_technical_terms.length > 0">
                    <dt class="text-muted-foreground">Technical terms</dt>
                    <dd>{{ record.damage_technical_terms.join(", ") }}</dd>
                  </div>
                </dl>
              </section>

              <section class="space-y-3">
                <h3 class="text-base font-bold text-foreground">Assessment</h3>
                <dl class="grid gap-3 text-sm">
                  <div>
                    <dt class="text-muted-foreground">VRU hazard</dt>
                    <dd class="font-medium">
                      {{ record.assessment_vru_hazard ? "Yes" : "No" }}
                    </dd>
                  </div>
                  <div v-if="record.assessment_hazard_analysis">
                    <dt class="text-muted-foreground">Hazard analysis</dt>
                    <dd class="leading-relaxed text-foreground">
                      {{ record.assessment_hazard_analysis }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="space-y-3">
                <h3 class="text-base font-bold text-foreground">
                  Recommendation
                </h3>
                <dl class="grid gap-3 text-sm">
                  <div v-if="record.recommendation_action">
                    <dt class="text-muted-foreground">Action</dt>
                    <dd>{{ record.recommendation_action }}</dd>
                  </div>
                  <div>
                    <dt class="mb-1 text-muted-foreground">Urgency</dt>
                    <dd class="flex flex-wrap gap-1">
                      <Badge
                        v-for="level in record.recommendation_urgency_levels"
                        :key="level"
                        :variant="riskLevelBadgeVariant(level)"
                      >
                        {{ level }}
                      </Badge>
                      <span
                        v-if="record.recommendation_urgency_levels.length === 0"
                      >
                        {{ record.recommendation_urgency || "—" }}
                      </span>
                    </dd>
                  </div>
                  <div v-if="record.recommendation_disclaimer">
                    <dt class="text-muted-foreground">Disclaimer</dt>
                    <dd class="text-muted-foreground">
                      {{ record.recommendation_disclaimer }}
                    </dd>
                  </div>
                </dl>
              </section>
            </template>
          </div>
        </div>
      </template>
    </SheetContent>
  </Sheet>
</template>
