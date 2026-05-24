export type Severity = 'Minor' | 'Moderate' | 'Severe'

export type DamageType = 'Pothole' | 'Crack' | 'Surface wear' | 'Other'

export interface DetectionResult {
  damage_detected: boolean
  damage_type: DamageType | string
  severity: Severity | string
  confidence: number
  recommendation: string
  /** Optional map pin when the detection API returns coordinates */
  latitude?: number
  longitude?: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}
