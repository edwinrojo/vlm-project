/** Normalized map point used by Leaflet (WGS84) */
export interface MapCoordinates {
  latitude: number
  longitude: number
}

export type CoordinateSource = 'api' | 'lookup'

export type CoordinateValidationStatus = 'valid' | 'invalid' | 'missing'
