/** Normalized map point used by Leaflet (WGS84) */
export interface MapCoordinates {
  latitude: number
  longitude: number
}

export type CoordinateSource = 'api' | 'lookup'
