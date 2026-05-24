<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const VueApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
</script>

<template>
  <Suspense>
    <VueApexChart v-bind="$attrs" />
    <template #fallback>
      <Skeleton class="h-full min-h-[16rem] w-full" />
    </template>
  </Suspense>
</template>
