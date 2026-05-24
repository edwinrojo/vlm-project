import type { Severity } from './damage'

/** Serializable map rectangle (WGS84) */
export interface MapAreaBounds {
  south: number
  west: number
  north: number
  east: number
}

export const ALL_SEVERITIES: Severity[] = ['Minor', 'Moderate', 'Severe']
