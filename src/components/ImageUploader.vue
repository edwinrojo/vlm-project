<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AlertCircle,
  Camera,
  ImageIcon,
  ImagePlus,
  Loader2,
  Map,
  MapPin,
  Upload,
  X,
} from "lucide-vue-next";
import CameraCaptureDialog from "@/components/CameraCaptureDialog.vue";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import UploadLocationMap from "@/components/UploadLocationMap.vue";
import {
  ACCEPTED_IMAGE_ACCEPT,
  CAMERA_CAPTURE_ACCEPT,
  isAcceptedImageFile,
  MAX_IMAGE_SIZE_BYTES,
} from "@/constants/upload";
import type { DetectionCoordinates } from "@/types";
import {
  extractGpsFromImage,
  formatCoordinates,
  formatFileSize,
  getUploadCoordinates,
} from "@/utils";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    progress?: number;
    phase?: "uploading" | "analyzing" | null;
    error?: string | null;
  }>(),
  {
    loading: false,
    progress: 0,
    phase: null,
    error: null,
  },
);

const emit = defineEmits<{
  upload: [file: File, coordinates: DetectionCoordinates];
  clear: [];
}>();

type LocationMode = "exif" | "gps" | "map" | null;
type ExifStatus = "idle" | "reading" | "found" | "not_found";

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isDragging = ref(false);
const validationError = ref<string | null>(null);

const coordinates = ref<DetectionCoordinates | null>(null);
const locationMode = ref<LocationMode>(null);
const locationError = ref<string | null>(null);
const isFetchingGps = ref(false);
const isReadingExif = ref(false);
const exifStatus = ref<ExifStatus>("idle");
const cameraDialogOpen = ref(false);

const fileInputRef = ref<HTMLInputElement | null>(null);
const nativeCameraInputRef = ref<HTMLInputElement | null>(null);

const accept = ACCEPTED_IMAGE_ACCEPT;

const progressLabel = computed(() => {
  if (props.phase === "analyzing") return "Running AI analysis...";
  return "Uploading image...";
});

const coordinatesLabel = computed(() => {
  if (!coordinates.value) return null;
  return formatCoordinates(coordinates.value.lat, coordinates.value.lon);
});

const canSubmit = computed(
  () =>
    Boolean(selectedFile.value && coordinates.value) &&
    !props.loading &&
    !isReadingExif.value,
);

const locationSourceHint = computed(() => {
  if (exifStatus.value === "reading") {
    return "Reading GPS from image metadata…";
  }
  if (locationMode.value === "exif" && coordinates.value) {
    return "Location from photo EXIF metadata.";
  }
  if (exifStatus.value === "not_found" && selectedFile.value) {
    return "No GPS in this image — use device location or pick on the map.";
  }
  return null;
});

function resetLocation() {
  coordinates.value = null;
  locationMode.value = null;
  locationError.value = null;
  isFetchingGps.value = false;
  isReadingExif.value = false;
  exifStatus.value = "idle";
}

function validateFile(file: File): string | null {
  if (!isAcceptedImageFile(file)) {
    return "Please upload a JPEG, JPG, or PNG image only.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be under ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`;
  }
  return null;
}

async function applyExifCoordinates(file: File) {
  isReadingExif.value = true;
  exifStatus.value = "reading";
  locationError.value = null;

  try {
    const fromExif = await extractGpsFromImage(file);
    if (fromExif) {
      coordinates.value = fromExif;
      locationMode.value = "exif";
      exifStatus.value = "found";
      return;
    }
    exifStatus.value = "not_found";
  } finally {
    isReadingExif.value = false;
  }
}

async function usePhotoLocation() {
  if (!selectedFile.value) return;
  await applyExifCoordinates(selectedFile.value);
  if (exifStatus.value === "not_found") {
    locationError.value =
      "This image has no GPS metadata. Use current location or pick on the map.";
  }
}

function setFile(file: File) {
  const err = validateFile(file);
  if (err) {
    validationError.value = err;
    return;
  }
  validationError.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  resetLocation();
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  void applyExifCoordinates(file);
}

function handleFiles(files: FileList | null) {
  const file = files?.[0];
  if (file) setFile(file);
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;
  handleFiles(event.dataTransfer?.files ?? null);
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  handleFiles(input.files);
  input.value = "";
}

function openFilePicker() {
  fileInputRef.value?.click();
}

function openCameraDialog() {
  cameraDialogOpen.value = true;
}

function openNativeCamera() {
  nativeCameraInputRef.value?.click();
}

function onCameraCapture(file: File) {
  setFile(file);
}

function clearSelection() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = null;
  previewUrl.value = null;
  validationError.value = null;
  resetLocation();
  emit("clear");
}

async function useCurrentLocation() {
  locationMode.value = "gps";
  exifStatus.value = "idle";
  locationError.value = null;
  isFetchingGps.value = true;

  try {
    const position = await getUploadCoordinates();
    if (!position) {
      locationError.value =
        "Could not get your location. Allow location access or pick a point on the map.";
      coordinates.value = null;
      return;
    }
    coordinates.value = position;
  } finally {
    isFetchingGps.value = false;
  }
}

function useMapPicker() {
  locationMode.value = "map";
  locationError.value = null;
  exifStatus.value = "idle";
}

function submitUpload() {
  if (!selectedFile.value || !coordinates.value) return;
  emit("upload", selectedFile.value, coordinates.value);
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Upload Road Image</CardTitle>
      <CardDescription
        >Upload a road image to analyze for road damage</CardDescription
      >
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
        <div
          v-if="!previewUrl"
          class="flex flex-col items-center gap-4 px-6 py-10 text-center"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
          >
            <ImagePlus class="h-7 w-7 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">
              Add a road damage photo
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              JPEG, JPG, or PNG · max
              {{ formatFileSize(MAX_IMAGE_SIZE_BYTES) }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              GPS from photo metadata is used automatically when available.
            </p>
          </div>

          <div class="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              class="flex-1"
              :disabled="loading"
              @click="openFilePicker"
            >
              <ImagePlus class="h-4 w-4" />
              Choose file
            </Button>
            <Button
              type="button"
              class="flex-1"
              :disabled="loading"
              @click="openCameraDialog"
            >
              <Camera class="h-4 w-4" />
              Take photo
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="text-xs text-muted-foreground"
            :disabled="loading"
            @click="openNativeCamera"
          >
            Use device camera app
          </Button>

          <p class="text-xs text-muted-foreground">
            or drag and drop an image here
          </p>

          <input
            ref="fileInputRef"
            type="file"
            class="sr-only"
            :accept="accept"
            :disabled="loading"
            @change="onFileChange"
          />
          <input
            ref="nativeCameraInputRef"
            type="file"
            class="sr-only"
            :accept="CAMERA_CAPTURE_ACCEPT"
            capture="environment"
            :disabled="loading"
            @change="onFileChange"
          />
        </div>

        <div v-else class="p-4">
          <div
            class="relative overflow-hidden rounded-lg border border-border bg-black/5"
          >
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
              {{ selectedFile ? formatFileSize(selectedFile.size) : "" }}
            </p>
          </div>
        </div>
      </div>

      <section class="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
        <div>
          <p class="text-sm font-medium text-foreground">Location</p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            GPS is read from the photo when present; otherwise choose a source below.
          </p>
        </div>

        <p
          v-if="locationSourceHint"
          class="text-xs"
          :class="
            locationMode === 'exif' && coordinates
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-muted-foreground'
          "
        >
          <Loader2
            v-if="isReadingExif"
            class="mr-1 inline h-3 w-3 animate-spin"
          />
          {{ locationSourceHint }}
        </p>

        <div class="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            :class="locationMode === 'exif' ? 'border-primary bg-primary/5' : ''"
            :disabled="loading || !selectedFile || isReadingExif"
            @click="usePhotoLocation"
          >
            <Loader2
              v-if="isReadingExif"
              class="h-4 w-4 animate-spin"
            />
            <ImageIcon v-else class="h-4 w-4" />
            From photo
          </Button>
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            :class="locationMode === 'gps' ? 'border-primary bg-primary/5' : ''"
            :disabled="loading || isFetchingGps"
            @click="useCurrentLocation"
          >
            <Loader2
              v-if="isFetchingGps"
              class="h-4 w-4 animate-spin"
            />
            <MapPin v-else class="h-4 w-4" />
            Use current location
          </Button>
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            :class="locationMode === 'map' ? 'border-primary bg-primary/5' : ''"
            :disabled="loading"
            @click="useMapPicker"
          >
            <Map class="h-4 w-4" />
            Pick on map
          </Button>
        </div>

        <UploadLocationMap
          v-if="locationMode === 'map'"
          v-model="coordinates"
        />

        <p
          v-if="coordinatesLabel"
          class="rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-foreground"
        >
          {{ coordinatesLabel }}
        </p>

        <p
          v-if="locationError"
          class="text-xs text-destructive"
        >
          {{ locationError }}
        </p>
        <p
          v-else-if="locationMode === 'map' && !coordinates"
          class="text-xs text-muted-foreground"
        >
          Tap the map to set a location.
        </p>
      </section>

      <div
        v-if="validationError || error"
        class="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
        <p>{{ validationError || error }}</p>
      </div>

      <div v-if="loading" class="space-y-2">
        <div
          class="flex items-center justify-between text-xs text-muted-foreground"
        >
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
        :disabled="!canSubmit"
        @click="submitUpload"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <Upload v-else class="h-4 w-4" />
        {{ loading ? "Processing..." : "Analyze Road Damage" }}
      </Button>
      <p
        v-if="selectedFile && !coordinates && !loading"
        class="text-center text-xs text-muted-foreground"
      >
        {{
          isReadingExif
            ? "Reading GPS from image…"
            : "Select a location before analyzing."
        }}
      </p>
    </CardContent>

    <CameraCaptureDialog
      v-model:open="cameraDialogOpen"
      @capture="onCameraCapture"
    />
  </Card>
</template>
