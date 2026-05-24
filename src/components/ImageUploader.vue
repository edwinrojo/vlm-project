<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertCircle, ImagePlus, Loader2, Upload, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/upload'
import { formatFileSize } from '@/utils'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    progress?: number
    phase?: 'uploading' | 'analyzing' | null
    error?: string | null
  }>(),
  {
    loading: false,
    progress: 0,
    phase: null,
    error: null,
  },
)

const emit = defineEmits<{
  upload: [file: File]
  clear: []
}>()

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)
const validationError = ref<string | null>(null)

const accept = ACCEPTED_IMAGE_TYPES.join(',')

const progressLabel = computed(() => {
  if (props.phase === 'analyzing') return 'Running AI analysis...'
  return 'Uploading image...'
})

function validateFile(file: File): string | null {
  if (
    !file.type.startsWith('image/') ||
    !ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])
  ) {
    return 'Please upload a JPEG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be under ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`
  }
  return null
}

function setFile(file: File) {
  const err = validateFile(file)
  if (err) {
    validationError.value = err
    return
  }
  validationError.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function handleFiles(files: FileList | null) {
  const file = files?.[0]
  if (file) setFile(file)
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  handleFiles(event.dataTransfer?.files ?? null)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  handleFiles(input.files)
  input.value = ''
}

function clearSelection() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = null
  previewUrl.value = null
  validationError.value = null
  emit('clear')
}

function submitUpload() {
  if (selectedFile.value) emit('upload', selectedFile.value)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Upload Road Image</CardTitle>
      <CardDescription>
        Sends a multipart request to
        <code class="rounded bg-muted px-1 text-xs">POST /detect-road-damage</code>.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        class="relative rounded-xl border-2 border-dashed transition-colors"
        :class="
          isDragging
            ? 'border-primary bg-accent/40'
            : 'border-border bg-muted/30 hover:border-primary/50'
        "
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop="onDrop"
      >
        <label
          v-if="!previewUrl"
          class="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-12 text-center"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ImagePlus class="h-7 w-7 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">
              Drop image here or click to browse
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, or WebP · max {{ formatFileSize(MAX_IMAGE_SIZE_BYTES) }}
            </p>
          </div>
          <input
            type="file"
            class="sr-only"
            :accept="accept"
            :disabled="loading"
            @change="onFileChange"
          />
        </label>

        <div v-else class="p-4">
          <div class="relative overflow-hidden rounded-lg border border-border bg-black/5">
            <img
              :src="previewUrl"
              alt="Selected road image preview"
              class="max-h-72 w-full object-contain"
            />
            <Button
              v-if="!loading"
              variant="secondary"
              size="icon"
              class="absolute right-2 top-2 h-8 w-8 bg-white/90 shadow"
              @click="clearSelection"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
          <div class="mt-3 text-sm">
            <p class="font-medium text-foreground">{{ selectedFile?.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ selectedFile ? formatFileSize(selectedFile.size) : '' }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="validationError || error"
        class="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
        <p>{{ validationError || error }}</p>
      </div>

      <div v-if="loading" class="space-y-2">
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>{{ progressLabel }}</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all duration-300"
            :style="{ width: `${Math.max(progress, 5)}%` }"
          />
        </div>
      </div>

      <Button
        class="w-full"
        size="lg"
        :disabled="!selectedFile || loading"
        @click="submitUpload"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <Upload v-else class="h-4 w-4" />
        {{ loading ? 'Processing...' : 'Analyze Road Damage' }}
      </Button>
    </CardContent>
  </Card>
</template>
