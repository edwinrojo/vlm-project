/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_IMAGE_DETECTION_PATH?: string
  readonly VITE_ANALYTICS_PATH?: string
  readonly VITE_DETECT_PATH?: string // default: /road-check
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
