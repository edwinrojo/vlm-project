import type { CoordinateSource, MapCoordinates } from './coordinates'
import type { DamageType, Severity } from './damage'

export interface AnalyticsRecord {
  id?: string
  /** Optional — the Python API provides coordinates only */
  location?: string
  damage_type: DamageType | string
  severity: Severity | string
  confidence: number
  date_detected: string
  suggested_recommendation: string
  latitude?: number
  longitude?: number
  coordinate_source?: CoordinateSource
}

/** Raw analytics row as returned by GET /analytics (before normalization) */
export interface AnalyticsRecordApiPayload {
  id?: string
  location?: string
  damage_type: string
  severity: string
  confidence: number
  date_detected: string
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
  severeCount: number
  moderateCount: number
  minorCount: number
  avgConfidence: number
}

export interface SeverityChartData {
  label: string
  value: number
}

export interface DamageTypeChartData {
  label: string
  value: number
}
