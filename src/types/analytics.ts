import type { CoordinateSource, CoordinateValidationStatus, MapCoordinates } from './coordinates'
import type { DamageType } from './damage'

/** Raw row from GET /get-road-report */
export interface RoadReportApiRecord {
  id: number
  damage_classification: string
  damage_dimensions_estimate: string
  damage_technical_terms: string[]
  /** May be a single level or several (e.g. "High, Critical" or "High/Critical") */
  assessment_risk_level: string
  assessment_vru_hazard: boolean
  assessment_hazard_analysis: string
  recommendation_action: string
  /** Same value set as risk levels; may list multiple */
  recommendation_urgency: string
  recommendation_disclaimer: string
  confidence_score: number
  file_name: string
  /** WGS84 coordinates */
  latitude: number
  longitude: number
  created_at: string
  /** Present if the API returns explicit arrays */
  risk_levels?: string[]
  risk_level?: string | string[]
}

/** Normalized record used across dashboard, map, and filters */
export interface AnalyticsRecord {
  id: string
  /** Parsed canonical types: Pothole, Alligator Cracking, Rutting, Depression */
  damage_classifications: string[]
  /** Human-readable join of damage_classifications */
  damage_classification: string
  damage_dimensions_estimate: string
  damage_technical_terms: string[]
  /** Parsed levels: Low, Medium, High, Critical (one or more per record) */
  risk_levels: string[]
  /** Joined display of risk_levels */
  assessment_risk_level: string
  assessment_vru_hazard: boolean
  assessment_hazard_analysis: string
  recommendation_action: string
  /** Parsed urgency levels (same vocabulary as risk_levels) */
  recommendation_urgency_levels: string[]
  recommendation_urgency: string
  recommendation_disclaimer: string
  confidence_score: number
  file_name: string
  created_at: string
  /** Raw latitude/longitude from the API response */
  source_latitude?: number | null
  source_longitude?: number | null
  /** Validated WGS84 for map (Davao / Philippines only) */
  latitude?: number
  longitude?: number
  coordinate_status?: CoordinateValidationStatus
  coordinate_source?: CoordinateSource
}

/** @deprecated Legacy flat analytics shape — converted during normalization */
export interface AnalyticsRecordApiPayload {
  id?: string
  location?: string
  damage_type?: string
  severity?: string
  confidence?: number
  date_detected?: string
  suggested_recommendation?: string
  latitude?: number
  longitude?: number
  lat?: number
  lng?: number
  map_coordinates?: MapCoordinates | { lat: number; lng: number } | [number, number]
  coordinates?: MapCoordinates | { lat: number; lng: number } | [number, number]
}

export interface DashboardStats {
  totalDamages: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  avgConfidence: number
}

export interface RiskLevelChartData {
  label: string
  value: number
}

/** @deprecated Use RiskLevelChartData */
export type SeverityChartData = RiskLevelChartData

export interface DamageTypeChartData {
  label: string
  value: number
}
