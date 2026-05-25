<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { Camera, Loader2, SwitchCamera, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { DetectionCoordinates } from '@/types'
import { getUploadCoordinates } from '@/utils'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  capture: [file: File, coordinates: DetectionCoordinates | null]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const cameraError = ref<string | null>(null)
const isStarting = ref(false)
const isCapturing = ref(false)
const useFrontCamera = ref(false)

let stream: MediaStream | null = null

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  if (videoRef.value) videoRef.value.srcObject = null
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value =
      'Camera is not supported in this browser. Use “Choose file” or a mobile device.'
    return
  }

  cameraError.value = null
  isStarting.value = true
  stopCamera()

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: useFrontCamera.value ? 'user' : { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    })

    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
  } catch {
    cameraError.value =
      'Could not access the camera. Allow camera permission and try again.'
  } finally {
    isStarting.value = false
  }
}

async function toggleCamera() {
  useFrontCamera.value = !useFrontCamera.value
  await startCamera()
}

async function capturePhoto() {
  const video = videoRef.value
  if (!video || video.videoWidth === 0 || isCapturing.value) return

  isCapturing.value = true
  cameraError.value = null

  const gpsPromise = getUploadCoordinates()

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    isCapturing.value = false
    return
  }

  ctx.drawImage(video, 0, 0)

  await new Promise<void>((resolve) => {
    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) {
            cameraError.value = 'Failed to capture photo. Please try again.'
            return
          }

          const file = new File([blob], `road-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          const coordinates = await gpsPromise
          emit('capture', file, coordinates)
          open.value = false
        } finally {
          isCapturing.value = false
          resolve()
        }
      },
      'image/jpeg',
      0.92,
    )
  })
}

watch(open, (isOpen) => {
  if (isOpen) {
    useFrontCamera.value = false
    void startCamera()
  } else {
    stopCamera()
    cameraError.value = null
  }
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[1200] flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Capture road photo"
    >
      <div
        class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6"
      >
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-foreground sm:text-lg">
            Take photo
          </h2>
          <p class="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Point at the road damage. Device GPS is saved when you capture.
          </p>
        </div>
        <Button variant="outline" size="sm" @click="open = false">
          <X class="h-4 w-4" />
          Cancel
        </Button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4 sm:p-6">
        <div
          class="relative flex w-full max-w-2xl items-center justify-center overflow-hidden rounded-xl border border-border bg-black aspect-[4/3]"
        >
          <video
            v-show="!cameraError && !isStarting"
            ref="videoRef"
            class="h-full w-full object-cover"
            playsinline
            muted
          />

          <div
            v-if="isStarting"
            class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
            Starting camera…
          </div>

          <p
            v-else-if="cameraError"
            class="px-6 text-center text-sm text-muted-foreground"
          >
            {{ cameraError }}
          </p>
        </div>

        <div class="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            class="sm:flex-1"
            :disabled="isStarting || Boolean(cameraError)"
            @click="toggleCamera"
          >
            <SwitchCamera class="h-4 w-4" />
            Switch camera
          </Button>
          <Button
            type="button"
            size="lg"
            class="sm:flex-1"
            :disabled="isStarting || isCapturing || Boolean(cameraError)"
            @click="capturePhoto"
          >
            <Loader2 v-if="isCapturing" class="h-4 w-4 animate-spin" />
            <Camera v-else class="h-4 w-4" />
            {{ isCapturing ? 'Capturing…' : 'Capture photo' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
