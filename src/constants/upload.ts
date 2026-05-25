export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

/** MIME types allowed for road-check uploads */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const

/** File-picker accept string (MIME + extensions for .jpg / .jpeg) */
export const ACCEPTED_IMAGE_ACCEPT = [
  ...ACCEPTED_IMAGE_TYPES,
  '.jpg',
  '.jpeg',
  '.png',
].join(',')

/** Mobile-native camera capture (rear camera when supported) */
export const CAMERA_CAPTURE_ACCEPT = 'image/jpeg'

const ACCEPTED_EXTENSION_PATTERN = /\.(jpe?g|png)$/i

export function isAcceptedImageFile(file: File): boolean {
  if (
    ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return true
  }
  return ACCEPTED_EXTENSION_PATTERN.test(file.name)
}
