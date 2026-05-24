/** Canonical damage_classification values from GET /get-road-report */
export const DAMAGE_CLASSIFICATIONS = [
  'Pothole',
  'Alligator Cracking',
  'Rutting',
  'Depression',
] as const

/** assessment_risk_level / recommendation_urgency values */
export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const

export const URGENCY_LEVELS = RISK_LEVELS

export type DamageClassification = (typeof DAMAGE_CLASSIFICATIONS)[number]
export type RiskLevel = (typeof RISK_LEVELS)[number]

const RISK_PRIORITY: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function splitList(value: string): string[] {
  return value
    .split(/[,;/]|\bor\b|\band\b/gi)
    .map((part) => part.trim())
    .filter(Boolean)
}

function canonicalize(value: string, allowed: readonly string[]): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const exact = allowed.find((item) => item.toLowerCase() === trimmed.toLowerCase())
  if (exact) return exact

  const lower = trimmed.toLowerCase()
  for (const item of allowed) {
    if (lower.includes(item.toLowerCase())) return item
  }
  return null
}

/** Parse one or many risk/urgency values (string, array, or legacy "High/Critical"). */
export function parseRiskOrUrgencyLevels(value: unknown): RiskLevel[] {
  const found = new Set<RiskLevel>()
  const candidates: string[] = []

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') candidates.push(...splitList(item))
    }
  } else if (typeof value === 'string') {
    candidates.push(...splitList(value))
  }

  for (const part of candidates) {
    const level = canonicalize(part, RISK_LEVELS)
    if (level) found.add(level as RiskLevel)
  }

  return RISK_LEVELS.filter((level) => found.has(level))
}

/** Parse damage_classification into canonical types (supports comma-separated text). */
export function parseDamageClassifications(value: unknown): DamageClassification[] {
  const found = new Set<DamageClassification>()
  const candidates: string[] = []

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') candidates.push(...splitList(item))
    }
  } else if (typeof value === 'string') {
    candidates.push(...splitList(value))
  }

  for (const part of candidates) {
    const classification = canonicalize(part, DAMAGE_CLASSIFICATIONS)
    if (classification) found.add(classification as DamageClassification)
  }

  return DAMAGE_CLASSIFICATIONS.filter((item) => found.has(item))
}

export function formatJoinedList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : ''
}

/** Map API risk level text to legacy severity buckets for badges/charts. */
export function mapRiskLevelToSeverity(riskLevel: string): 'Minor' | 'Moderate' | 'Severe' {
  const levels = parseRiskOrUrgencyLevels(riskLevel)
  const primary = levels.length > 0 ? primaryRiskLevel(levels) : riskLevel

  switch (primary.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'Severe'
    case 'medium':
      return 'Moderate'
    case 'low':
      return 'Minor'
    default:
      if (/critical|high/i.test(riskLevel)) return 'Severe'
      if (/medium/i.test(riskLevel)) return 'Moderate'
      return 'Minor'
  }
}

/** Highest-priority level for map marker color when a record has multiple. */
export function primaryRiskLevel(levels: string[]): string {
  if (levels.length === 0) return 'Unknown'

  return [...levels].sort(
    (a, b) =>
      (RISK_PRIORITY[b.toLowerCase()] ?? 0) - (RISK_PRIORITY[a.toLowerCase()] ?? 0),
  )[0]!
}

export function recordHasRiskLevel(record: { risk_levels: string[] }, level: string): boolean {
  const target = level.toLowerCase()
  return record.risk_levels.some((item) => item.toLowerCase() === target)
}
