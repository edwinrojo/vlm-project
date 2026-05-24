<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const VueApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
</script>

<template>
  <div class="min-w-0 w-full max-w-full overflow-hidden">
    <Suspense>
      <VueApexChart v-bind="$attrs" class="max-w-full" />
      <template #fallback>
        <Skeleton class="h-full min-h-[12rem] w-full sm:min-h-[16rem]" />
      </template>
    </Suspense>
  </div>
</template>
