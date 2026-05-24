<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import DetectionResultCard from '@/components/DetectionResultCard.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import type { DetectionCoordinates } from '@/types'
import { useDetectionStore } from '@/stores'

const detectionStore = useDetectionStore()
const { result, isDetecting, uploadProgress, detectionPhase, previewImageUrl, error } =
  storeToRefs(detectionStore)

async function handleUpload(file: File, coordinates: DetectionCoordinates) {
  try {
    await detectionStore.analyzeImage(file, coordinates)
    const message = result.value?.damage_detected
      ? `${result.value.damage_type} · ${result.value.assessment_risk_level ?? result.value.severity}`
      : 'No road damage detected'
    toast.success('Analysis complete', { description: message })
  } catch {
    toast.error('Detection failed', {
      description: error.value ?? 'Unable to analyze the image.',
    })
  }
}

function handleClear() {
  detectionStore.resetDetection()
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <ImageUploader
      :loading="isDetecting"
      :progress="uploadProgress"
      :phase="detectionPhase"
      :error="error"
      @upload="handleUpload"
      @clear="handleClear"
    />
    <DetectionResultCard
      :result="result"
      :preview-image-url="previewImageUrl"
      :loading="isDetecting"
      :error="error"
    />
  </div>
</template>
