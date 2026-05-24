import axios from 'axios'

type FastApiDetail = string | { msg?: string; loc?: unknown[] }[]

export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred'
  }

  const data = error.response?.data as { detail?: FastApiDetail; message?: string } | undefined

  if (data?.message) return data.message

  const detail = data?.detail
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'object' && item?.msg ? item.msg : String(item)))
      .join(', ')
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Cannot reach the API server. Check that the backend is running and CORS is configured.'
  }

  if (error.response?.status === 413) {
    return 'Image file is too large for the server.'
  }

  return error.message || 'An unexpected error occurred'
}
