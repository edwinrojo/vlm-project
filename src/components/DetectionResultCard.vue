<script setup lang="ts">
import { computed } from "vue";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import type { DetectionResult } from "@/types";
import {
  formatConfidence,
  formatCoordinates,
  riskLevelBadgeVariant,
  severityBadgeVariant,
} from "@/utils";

const props = defineProps<{
  result: DetectionResult | null;
  previewImageUrl?: string | null;
  loading?: boolean;
  error?: string | null;
}>();

const confidencePercent = computed(() =>
  props.result ? Math.round(props.result.confidence * 100) : 0,
);

const riskBadgeVariant = computed(() => {
  if (!props.result?.assessment_risk_level) {
    return severityBadgeVariant(props.result?.severity ?? "");
  }
  return riskLevelBadgeVariant(props.result.assessment_risk_level);
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Detection Results</CardTitle>
      <CardDescription>AI analysis of the uploaded image</CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-4">
        <Skeleton class="h-40 w-full rounded-lg" />
        <Skeleton class="h-6 w-32" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-20 w-full" />
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      >
        <p class="text-sm font-medium text-destructive">Detection failed</p>
        <p class="mt-1 text-sm text-destructive/90">{{ error }}</p>
      </div>

      <div v-else-if="result" class="space-y-5">
        <div
          v-if="previewImageUrl"
          class="overflow-hidden rounded-lg border border-border bg-muted/30"
        >
          <img
            :src="previewImageUrl"
            alt="Analyzed road image"
            class="max-h-56 w-full object-contain"
          />
          <p
            class="border-t border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
          >
            {{ result.file_name || "Uploaded image" }}
          </p>
        </div>

        <div class="rounded-lg border border-border bg-muted/20 p-5 space-y-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full"
                :class="
                  result.damage_detected ? 'bg-red-100' : 'bg-emerald-100'
                "
              >
                <ShieldAlert
                  v-if="result.damage_detected"
                  class="h-5 w-5 text-red-600"
                />
                <CheckCircle2 v-else class="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Status</p>
                <p class="text-lg font-semibold text-foreground">
                  {{
                    result.damage_detected
                      ? "Damage Detected"
                      : "No Damage Found"
                  }}
                </p>
              </div>
            </div>
            <Badge v-if="result.damage_detected" :variant="riskBadgeVariant">
              {{ result.assessment_risk_level || result.severity }}
            </Badge>
          </div>

          <div v-if="result.damage_detected" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div
                class="rounded-lg border border-border bg-card p-4 sm:col-span-2"
              >
                <p
                  class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Classification
                </p>
                <p class="mt-1 text-base font-semibold leading-snug">
                  {{ result.damage_type }}
                </p>
                <p
                  v-if="result.damage_dimensions_estimate"
                  class="mt-2 text-sm text-muted-foreground"
                >
                  {{ result.damage_dimensions_estimate }}
                </p>
              </div>
              <div class="rounded-lg border border-border bg-card p-4">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Confidence
                </p>
                <p class="mt-1 text-base font-semibold">
                  {{ formatConfidence(result.confidence) }}
                </p>
              </div>
              <div class="rounded-lg border border-border bg-card p-4">
                <p
                  class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  VRU hazard
                </p>
                <p class="mt-1 text-base font-semibold">
                  {{ result.assessment_vru_hazard ? "Yes" : "No" }}
                </p>
              </div>
            </div>

            <div
              v-if="result.latitude != null && result.longitude != null"
              class="rounded-lg border border-border bg-card p-4"
            >
              <p
                class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Location
              </p>
              <p class="mt-1 font-mono text-sm">
                {{ formatCoordinates(result.latitude, result.longitude) }}
              </p>
            </div>

            <div
              v-if="result.damage_technical_terms?.length"
              class="flex flex-wrap gap-1"
            >
              <Badge
                v-for="term in result.damage_technical_terms"
                :key="term"
                variant="outline"
                class="text-xs"
              >
                {{ term }}
              </Badge>
            </div>

            <div>
              <div
                class="mb-1.5 flex justify-between text-xs text-muted-foreground"
              >
                <span>Model confidence</span>
                <span>{{ confidencePercent }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="
                    confidencePercent >= 90
                      ? 'bg-emerald-500'
                      : confidencePercent >= 70
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  "
                  :style="{ width: `${confidencePercent}%` }"
                />
              </div>
            </div>

            <p
              v-if="result.assessment_hazard_analysis"
              class="text-sm leading-relaxed text-muted-foreground"
            >
              {{ result.assessment_hazard_analysis }}
            </p>
          </div>

          <div
            v-if="result.recommendation"
            class="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950"
          >
            <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p class="text-sm font-semibold">Recommendation</p>
              <p
                v-if="result.recommendation_action"
                class="mt-1 text-sm font-medium"
              >
                {{ result.recommendation_action }}
              </p>
              <p v-if="result.recommendation_urgency" class="mt-1 text-sm">
                Urgency: {{ result.recommendation_urgency }}
              </p>
              <p class="mt-1 text-sm leading-relaxed">
                {{ result.recommendation }}
              </p>
              <p
                v-if="result.recommendation_disclaimer"
                class="mt-2 text-xs text-amber-800/80"
              >
                {{ result.recommendation_disclaimer }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center"
      >
        <ShieldAlert class="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p class="text-sm font-medium text-muted-foreground">No analysis yet</p>
        <p class="mt-1 max-w-xs text-xs text-muted-foreground">
          Upload a road image and run detection. Allow location access to send
          GPS with the upload.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
