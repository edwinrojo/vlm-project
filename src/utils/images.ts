/** Base URL for uploaded detection images (no trailing slash). */
export function getDetectionImageBaseUrl(): string | null {
  const base = import.meta.env.VITE_IMAGE_DETECTION_PATH?.trim()
  return base ? base.replace(/\/$/, '') : null
}

/** Full URL for a report image from `file_name`. */
export function getDetectionImageUrl(fileName: string | undefined | null): string | null {
  const name = fileName?.trim()
  if (!name) return null

  const base = getDetectionImageBaseUrl()
  if (!base) return null

  const segments = name.split('/').filter(Boolean).map((segment) => encodeURIComponent(segment))
  return `${base}/${segments.join('/')}`
}
