import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DetectionPhase } from '@/api/damage'
import { detectRoadDamage } from '@/api/damage'
import type { AnalyticsRecord, DetectionResult } from '@/types'
import { fetchAnalytics } from '@/api/analytics'

export const useDetectionStore = defineStore('detection', () => {
  const result = ref<DetectionResult | null>(null)
  const isDetecting = ref(false)
  const uploadProgress = ref(0)
  const detectionPhase = ref<DetectionPhase | null>(null)
  const previewImageUrl = ref<string | null>(null)
  const lastUploadedFile = ref<File | null>(null)
  const error = ref<string | null>(null)

  function setPreview(file: File) {
    if (previewImageUrl.value) URL.revokeObjectURL(previewImageUrl.value)
    lastUploadedFile.value = file
    previewImageUrl.value = URL.createObjectURL(file)
  }

  async function analyzeImage(image: File) {
    isDetecting.value = true
    uploadProgress.value = 0
    detectionPhase.value = 'uploading'
    error.value = null
    setPreview(image)

    try {
      result.value = await detectRoadDamage(image, (percentage, phase) => {
        uploadProgress.value = percentage
        detectionPhase.value = phase
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Detection failed'
      result.value = null
      throw err
    } finally {
      isDetecting.value = false
      detectionPhase.value = null
    }
  }

  function resetDetection() {
    result.value = null
    uploadProgress.value = 0
    detectionPhase.value = null
    error.value = null
    lastUploadedFile.value = null
    if (previewImageUrl.value) URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = null
  }

  return {
    result,
    isDetecting,
    uploadProgress,
    detectionPhase,
    previewImageUrl,
    lastUploadedFile,
    error,
    analyzeImage,
    resetDetection,
  }
})

export { useDashboardFiltersStore } from './dashboardFilters'

export const useAnalyticsStore = defineStore('analytics', () => {
  const records = ref<AnalyticsRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<Date | null>(null)

  async function loadAnalytics() {
    isLoading.value = true
    error.value = null

    try {
      records.value = await fetchAnalytics()
      lastFetchedAt.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load analytics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return { records, isLoading, error, lastFetchedAt, loadAnalytics }
})
