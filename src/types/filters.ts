import { RISK_LEVELS } from '@/constants/roadReport'

/** Serializable map rectangle (WGS84) */
export interface MapAreaBounds {
  south: number
  west: number
  north: number
  east: number
}

export const ALL_RISK_LEVELS = RISK_LEVELS

export type { RiskLevel } from '@/constants/roadReport'
