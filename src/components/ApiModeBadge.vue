<script setup lang="ts">
import { apiMode } from '@/api/client'
import { cn } from '@/lib/utils'

const label = apiMode === 'mock' ? 'Mock API' : 'Live API'
</script>

<template>
  <span
    :class="
      cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1',
        apiMode === 'mock'
          ? 'bg-amber-500/20 text-amber-100 ring-amber-400/30'
          : 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/30',
      )
    "
    :title="
      apiMode === 'mock'
        ? 'Using local mock data — set VITE_USE_MOCK=false for backend'
        : 'Connected to FastAPI backend'
    "
  >
    {{ label }}
  </span>
</template>
