import axios from 'axios'
import { parseApiError } from './errors'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL,
  timeout: 60_000,
  headers: {
    Accept: 'application/json',
    ...(baseURL.includes('ngrok')
      ? { 'ngrok-skip-browser-warning': 'true' }
      : {}),
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(new Error(parseApiError(error))),
)

export const useMockData = import.meta.env.VITE_USE_MOCK === 'true'
export const apiMode: 'mock' | 'live' = useMockData ? 'mock' : 'live'
