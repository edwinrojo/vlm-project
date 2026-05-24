import type { AnalyticsRecordApiPayload, DetectionResult } from "@/types";

export const mockDetectionResult: DetectionResult = {
  damage_detected: true,
  damage_type: "Pothole",
  severity: "Severe",
  confidence: 0.96,
  recommendation:
    "Immediate asphalt patching required. Schedule repair within 48 hours.",
};

export const mockAnalyticsRecords: AnalyticsRecordApiPayload[] = [
  {
    id: "1",
    damage_type: "Pothole",
    severity: "Severe",
    confidence: 0.94,
    date_detected: "2026-05-24",
    latitude: 7.0731,
    longitude: 125.612,
    suggested_recommendation:
      "Immediate asphalt patching required. Schedule repair crew within 48 hours.",
  },
  {
    id: "2",
    damage_type: "Crack",
    severity: "Moderate",
    confidence: 0.88,
    date_detected: "2026-05-24",
    map_coordinates: { latitude: 7.0956, longitude: 125.6128 },
    suggested_recommendation:
      "Apply crack sealant and monitor expansion over the next 2 weeks.",
  },
  {
    id: "3",
    damage_type: "Surface wear",
    severity: "Minor",
    confidence: 0.82,
    date_detected: "2026-05-23",
    latitude: 7.1254,
    longitude: 125.6432,
    suggested_recommendation:
      "Schedule resurfacing during the next maintenance cycle.",
  },
  {
    id: "4",
    damage_type: "Pothole",
    severity: "Moderate",
    confidence: 0.91,
    date_detected: "2026-05-23",
    latitude: 7.0189,
    longitude: 125.5054,
    suggested_recommendation:
      "Fill pothole and compact base material before rainy season.",
  },
  {
    id: "5",
    damage_type: "Crack",
    severity: "Severe",
    confidence: 0.93,
    date_detected: "2026-05-22",
    latitude: 7.1123,
    longitude: 125.6345,
    suggested_recommendation:
      "Urgent lane repair recommended. Install temporary warning signage.",
  },
  {
    id: "6",
    damage_type: "Pothole",
    severity: "Minor",
    confidence: 0.79,
    date_detected: "2026-05-22",
    latitude: 7.1889,
    longitude: 125.4567,
    suggested_recommendation:
      "Add to routine maintenance queue for next inspection round.",
  },
  {
    id: "7",
    damage_type: "Surface wear",
    severity: "Moderate",
    confidence: 0.85,
    date_detected: "2026-05-21",
    latitude: 7.1045,
    longitude: 125.6189,
    suggested_recommendation:
      "Plan micro-surfacing treatment for this road segment.",
  },
  {
    id: "8",
    damage_type: "Crack",
    severity: "Minor",
    confidence: 0.76,
    date_detected: "2026-05-21",
    latitude: 7.0567,
    longitude: 125.5789,
    suggested_recommendation:
      "Continue monitoring. No immediate action required.",
  },
];
