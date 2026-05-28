export type Severity = 'Minor' | 'Moderate' | 'Severe'

export type DamageType = 'Pothole' | 'Crack' | 'Surface wear' | 'Other'

/** Normalized upload/detection result for the UI */
export interface DetectionResult {
  damage_detected: boolean
  damage_type: string
  damage_dimensions_estimate?: string
  damage_technical_terms?: string[]
  /** Mapped bucket for badges (from assessment risk level) */
  severity: Severity | string
  assessment_risk_level?: string
  assessment_vru_hazard?: boolean
  assessment_hazard_analysis?: string
  confidence: number
  recommendation: string
  recommendation_action?: string
  recommendation_urgency?: string
  recommendation_disclaimer?: string
  file_name?: string
  latitude?: number
  longitude?: number
}

/** Nested objects may be null when the model returns off-topic (confidence_score 0). */
export interface RoadCheckApiResponse {
  error?: string | null
  confidence_score: number
  damage_profile?: {
    classification?: string | null
    dimensions_estimate?: string | null
    technical_terms?: string[] | null
  } | null
  assessment?: {
    risk_level?: string | null
    vru_hazard?: boolean | null
    hazard_analysis?: string | null
  } | null
  recommendation?: {
    action?: string | null
    urgency?: string | null
    disclaimer?: string | null
  } | null
  fileName?: string | null
  file_name?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface DetectionCoordinates {
  lat: number
  lon: number
}
