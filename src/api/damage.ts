import type { DetectionResult } from '@/types'
import { mockDetectionResult } from '@/data/mock'
import { apiClient, useMockData } from './client'
import { normalizeDetectionResult } from './normalize'

export type DetectionPhase = 'uploading' | 'analyzing'

export async function detectRoadDamage(
  image: File,
  onProgress?: (percentage: number, phase: DetectionPhase) => void,
): Promise<DetectionResult> {
  if (useMockData) {
    return mockDetect(image, onProgress)
  }

  const formData = new FormData()
  formData.append('image', image)

  const { data } = await apiClient.post<DetectionResult>('/detect-road-damage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total) return
      const uploadPct = Math.round((event.loaded / event.total) * 85)
      onProgress?.(uploadPct, 'uploading')
    },
  })

  onProgress?.(100, 'analyzing')
  return normalizeDetectionResult(data)
}

async function mockDetect(
  _image: File,
  onProgress?: (percentage: number, phase: DetectionPhase) => void,
): Promise<DetectionResult> {
  const steps: [number, DetectionPhase, number][] = [
    [20, 'uploading', 200],
    [50, 'uploading', 300],
    [75, 'uploading', 250],
    [85, 'analyzing', 300],
    [100, 'analyzing', 450],
  ]

  for (const [pct, phase, wait] of steps) {
    await delay(wait)
    onProgress?.(pct, phase)
  }

  return normalizeDetectionResult({ ...mockDetectionResult })
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
