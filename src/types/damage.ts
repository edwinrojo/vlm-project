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

/** POST /road-check response body */
export interface RoadCheckApiResponse {
  damage_profile: {
    classification: string
    dimensions_estimate: string
    technical_terms: string[]
  }
  assessment: {
    risk_level: string
    vru_hazard: boolean
    hazard_analysis: string
  }
  confidence_score: number
  recommendation: {
    action: string
    urgency: string
    disclaimer: string
  }
  fileName?: string
  file_name?: string
  latitude?: number
  longitude?: number
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
