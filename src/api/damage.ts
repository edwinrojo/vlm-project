import type { DetectionCoordinates, DetectionResult, RoadCheckApiResponse } from '@/types'
import { mockDetectionResult } from '@/data/mock'
import { apiClient, useMockData } from './client'
import { normalizeDetectionResult } from './normalize'

export type DetectionPhase = 'uploading' | 'analyzing'

const detectPath =
  import.meta.env.VITE_DETECT_PATH?.trim() || '/road-check'

export async function detectRoadDamage(
  image: File,
  options?: {
    coordinates?: DetectionCoordinates | null
    onProgress?: (percentage: number, phase: DetectionPhase) => void
  },
): Promise<DetectionResult> {
  if (useMockData) {
    return mockDetect(image, options?.onProgress)
  }

  const formData = new FormData()
  formData.append('file', image)

  if (options?.coordinates) {
    formData.append('lat', String(options.coordinates.lat))
    formData.append('lon', String(options.coordinates.lon))
  }

  const { data } = await apiClient.post<RoadCheckApiResponse>(
    detectPath,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return
        const uploadPct = Math.round((event.loaded / event.total) * 85)
        options?.onProgress?.(uploadPct, 'uploading')
      },
    },
  )

  options?.onProgress?.(100, 'analyzing')
  return normalizeDetectionResult(data as unknown as Record<string, unknown>)
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

  return normalizeDetectionResult({
    damage_profile: {
      classification: mockDetectionResult.damage_type,
      dimensions_estimate: mockDetectionResult.damage_dimensions_estimate ?? '12 inches deep',
      technical_terms: mockDetectionResult.damage_technical_terms ?? ['pothole'],
    },
    assessment: {
      risk_level: mockDetectionResult.assessment_risk_level ?? 'High/Critical',
      vru_hazard: mockDetectionResult.assessment_vru_hazard ?? true,
      hazard_analysis:
        mockDetectionResult.assessment_hazard_analysis ??
        'Significant pothole requiring prompt repair.',
    },
    confidence_score: mockDetectionResult.confidence,
    recommendation: {
      action: mockDetectionResult.recommendation_action ?? 'Immediate asphalt patching',
      urgency: mockDetectionResult.recommendation_urgency ?? 'Critical',
      disclaimer:
        mockDetectionResult.recommendation_disclaimer ??
        'AI-generated assessment. Professional inspection required.',
    },
    fileName: mockDetectionResult.file_name ?? 'mock-upload.jpg',
    latitude: mockDetectionResult.latitude ?? 7.0731,
    longitude: mockDetectionResult.longitude ?? 125.612,
  })
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
